"""
AxelPath course registration routes.

Flow
----
1. POST /course-registrations/init          — create DB record, return registration_id
2. POST /agreements/accept                   — student accepts agreement (separate router)
3. POST /course-registrations/create-order  — verify agreement → create Razorpay order
4. POST /course-registrations/verify        — verify Razorpay signature → mark paid
5. POST /course-registrations/webhook       — Razorpay webhook (idempotent)

Legacy endpoint
---------------
POST /course-registrations/start            — kept for backward compatibility
"""

import hashlib
import hmac
import logging
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import settings
from app.database.connection import get_db
from app.models.agreement_acceptance import AgreementAcceptance
from app.models.course import Course
from app.models.course_registration import CourseRegistration
from app.schemas.agreement import AGREEMENT_VERSION_V1
from app.schemas.course_registration import (
    CreateOrderRequest,
    CreateOrderResponse,
    RegistrationInitRequest,
    RegistrationInitResponse,
    RegistrationStartRequest,
    RegistrationStartResponse,
    RegistrationSuccessResponse,
    RegistrationVerifyRequest,
)
from app.services.email_service import send_email
from app.services.razorpay_service import (
    create_order,
    fetch_payment,
    payment_reference_values,
    verify_signature,
)
from app.excel.exporter import export_all_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/course-registrations", tags=["Course Registrations"])

# ──────────────────────────────────────────────────
# Fixed fee — server-side only; NEVER trust frontend
# ──────────────────────────────────────────────────
COURSE_REGISTRATION_FEE_RUPEES = 8550          # ₹8,550
COURSE_REGISTRATION_FEE_PAISE = 855_000        # 855,000 paise


def _make_registration_id() -> str:
    return f"APREG-{datetime.utcnow().year}-{uuid4().hex[:8].upper()}"


def _get_active_course(db: Session, course_slug: str) -> Course:
    course = (
        db.query(Course)
        .filter(
            Course.is_active == True,
            (Course.slug == course_slug) | (Course.title == course_slug),
        )
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Selected course was not found.")
    return course


def _build_confirmation_email(reg: CourseRegistration) -> tuple[str, str]:
    subject = f"AxelPath Payment Successful — {reg.registration_id}"
    body = f"""Hello {reg.full_name},

Your AxelPath Academy enrollment has been confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENROLLMENT CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Registration ID   : {reg.registration_id}
Program           : {reg.course_title}
Payment Status    : Paid & Verified
Razorpay Order    : {reg.razorpay_order_id}
Razorpay Payment  : {reg.razorpay_payment_id}
UTR / Reference   : {reg.utr or "N/A"}
Agreement Version : {reg.agreement_version or AGREEMENT_VERSION_V1}
Payment Date      : {reg.paid_at.strftime("%d %B %Y, %H:%M UTC") if reg.paid_at else "N/A"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please keep your Registration ID for all future communication.

Thank you for choosing AxelPath Academy.

Regards,
AxelPath Team
"""
    return subject, body


# ══════════════════════════════════════════════════
# STEP 1 — Init registration (no Razorpay order yet)
# ══════════════════════════════════════════════════

@router.post(
    "/init",
    response_model=RegistrationInitResponse,
    status_code=status.HTTP_201_CREATED,
)
def init_registration(
    payload: RegistrationInitRequest,
    db: Session = Depends(get_db),
):
    """
    Create a course registration record.
    No Razorpay order is created yet — the student must accept the agreement first.
    """
    course = _get_active_course(db, payload.course_slug)

    # Check if this student already has a successful registration for this course
    existing_paid = (
        db.query(CourseRegistration)
        .filter(
            CourseRegistration.email == str(payload.email).lower(),
            CourseRegistration.course_slug == course.slug,
            CourseRegistration.payment_status == "paid",
        )
        .first()
    )
    if existing_paid:
        raise HTTPException(
            status_code=409,
            detail=(
                "A successful enrollment already exists for this email and course. "
                f"Registration ID: {existing_paid.registration_id}"
            ),
        )

    registration_id = _make_registration_id()

    registration = CourseRegistration(
        registration_id=registration_id,
        full_name=payload.full_name.strip(),
        email=str(payload.email).lower(),
        phone=payload.phone.strip(),
        referral_id=payload.referral_id.strip() if payload.referral_id else None,
        course_id=course.id,
        course_slug=course.slug,
        course_title=course.title,
        amount=COURSE_REGISTRATION_FEE_RUPEES,
        payment_status="pending_agreement",
        agreement_accepted=False,
        enrollment_status="pending",
    )
    db.add(registration)
    db.commit()

    return RegistrationInitResponse(
        registration_id=registration_id,
        course_title=course.title,
        message="Registration created. Please read and accept the agreement to continue.",
    )


# ══════════════════════════════════════════════════
# STEP 3 — Create Razorpay order (after agreement)
# ══════════════════════════════════════════════════

@router.post(
    "/create-order",
    response_model=CreateOrderResponse,
)
def create_payment_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
):
    """
    Create a Razorpay order for an existing registration.

    Prerequisites (all checked server-side):
      - Registration must exist.
      - Agreement must have been accepted and recorded in MySQL.
      - No successful payment must already exist.

    The payment amount is FIXED server-side. No amount is returned to the frontend.
    """
    registration = (
        db.query(CourseRegistration)
        .filter(CourseRegistration.registration_id == payload.registration_id)
        .first()
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    # Guard: already paid — do not create a new order
    if registration.payment_status == "paid":
        raise HTTPException(
            status_code=409,
            detail=(
                "Payment already completed for this registration. "
                f"Registration ID: {registration.registration_id}"
            ),
        )

    # Guard: agreement must be accepted (checked from both the registration row
    # and the dedicated agreement_acceptances table)
    if not registration.agreement_accepted:
        acceptance = (
            db.query(AgreementAcceptance)
            .filter(
                AgreementAcceptance.registration_id == payload.registration_id,
                AgreementAcceptance.agreement_accepted == True,
            )
            .first()
        )
        if not acceptance:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Agreement not yet accepted. "
                    "Please read and accept the AxelPath agreement before paying."
                ),
            )
        # Sync denormalised column
        registration.agreement_accepted = True
        registration.agreement_version = acceptance.agreement_version

    # If a Razorpay order already exists and is not yet paid, reuse it
    if (
        registration.razorpay_order_id
        and registration.payment_status in ("order_created", "agreement_accepted")
    ):
        return CreateOrderResponse(
            registration_id=registration.registration_id,
            course_title=registration.course_title,
            currency="INR",
            razorpay_order_id=registration.razorpay_order_id,
            razorpay_key_id=settings.RAZORPAY_KEY_ID,
        )

    # Create Razorpay order — amount is ALWAYS server-side fixed
    try:
        order = create_order(
            amount_rupees=COURSE_REGISTRATION_FEE_RUPEES,
            receipt=registration.registration_id,
            notes={
                "registration_id": registration.registration_id,
                "course_slug": registration.course_slug,
                "agreement_version": AGREEMENT_VERSION_V1,
            },
        )
    except Exception as exc:
        logger.error("Razorpay order creation failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Unable to create the payment order. Please try again.",
        ) from exc

    registration.razorpay_order_id = order["id"]
    registration.payment_status = "order_created"
    db.commit()

    return CreateOrderResponse(
        registration_id=registration.registration_id,
        course_title=registration.course_title,
        currency="INR",
        razorpay_order_id=order["id"],
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
    )


# ══════════════════════════════════════════════════
# STEP 4 — Verify Razorpay payment
# ══════════════════════════════════════════════════

@router.post(
    "/verify",
    response_model=RegistrationSuccessResponse,
)
def verify_registration_payment(
    payload: RegistrationVerifyRequest,
    db: Session = Depends(get_db),
):
    """
    Verify Razorpay payment cryptographically. Only marks SUCCESS after:
      1. HMAC-SHA256 signature matches.
      2. Razorpay API confirms payment is captured.
      3. Amount matches server-side fixed amount.
      4. UTR/reference is unique.
    """
    registration = (
        db.query(CourseRegistration)
        .filter(CourseRegistration.registration_id == payload.registration_id)
        .first()
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    # Idempotent: already paid
    if registration.payment_status == "paid":
        return RegistrationSuccessResponse(
            success=True,
            registration_id=registration.registration_id,
            course_title=registration.course_title,
            payment_status="paid",
            message="Registration is already confirmed.",
        )

    if payload.razorpay_order_id != registration.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Payment order does not match this registration.",
        )

    normalized_utr = payload.utr.strip().upper()
    if not normalized_utr:
        raise HTTPException(
            status_code=400,
            detail="Please enter the UTR / transaction reference number.",
        )

    # Duplicate UTR check
    duplicate = (
        db.query(CourseRegistration)
        .filter(
            CourseRegistration.utr == normalized_utr,
            CourseRegistration.id != registration.id,
        )
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="This UTR has already been used for another registration.",
        )

    # Cryptographic signature verification
    try:
        if not verify_signature(
            registration.razorpay_order_id,
            payload.razorpay_payment_id,
            payload.razorpay_signature,
        ):
            raise HTTPException(
                status_code=400,
                detail="Payment signature verification failed.",
            )
        payment = fetch_payment(payload.razorpay_payment_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Razorpay payment verification is temporarily unavailable.",
        ) from exc

    if payment.get("order_id") != registration.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Payment is not linked to this registration order.",
        )

    # Amount must match server-side fixed value (paise)
    if int(payment.get("amount", 0)) != COURSE_REGISTRATION_FEE_PAISE:
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match the programme fee.",
        )

    if payment.get("status") != "captured" or not payment.get("captured"):
        raise HTTPException(
            status_code=400,
            detail="Payment is not captured yet. Please wait and try again.",
        )

    razorpay_refs = payment_reference_values(payment)
    if razorpay_refs and normalized_utr not in razorpay_refs:
        raise HTTPException(
            status_code=400,
            detail="The UTR / transaction reference does not match the Razorpay payment.",
        )

    # All checks passed — mark as paid
    now = datetime.utcnow()
    registration.razorpay_payment_id = payload.razorpay_payment_id
    registration.razorpay_signature = payload.razorpay_signature
    registration.utr = normalized_utr
    registration.payment_status = "paid"
    registration.enrollment_status = "active"
    registration.paid_at = now

    try:
        db.commit()
        try:
            export_all_data(db)
        except Exception as export_exc:
            logger.warning("Excel export failed (non-fatal): %s", export_exc)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This payment or UTR has already been registered.",
        ) from exc

    # Send confirmation email only after verified payment
    subject, body = _build_confirmation_email(registration)
    email_sent = send_email(registration.email, subject, body)

    return RegistrationSuccessResponse(
        success=True,
        registration_id=registration.registration_id,
        course_title=registration.course_title,
        payment_status="paid",
        message=(
            "Payment successful. Your AxelPath enrollment has been confirmed. "
            "Confirmation email sent."
            if email_sent
            else "Payment successful. Your AxelPath enrollment has been confirmed. "
            "Email delivery is pending SMTP configuration."
        ),
        email_sent=email_sent,
    )


# ══════════════════════════════════════════════════
# WEBHOOK — Razorpay webhook (idempotent)
# ══════════════════════════════════════════════════

@router.post("/webhook", include_in_schema=False)
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay webhook endpoint.
    Verifies signature using RAZORPAY_WEBHOOK_SECRET and processes
    payment.captured events idempotently.
    """
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    webhook_secret = getattr(settings, "RAZORPAY_WEBHOOK_SECRET", "")
    if not webhook_secret:
        logger.warning("RAZORPAY_WEBHOOK_SECRET not configured — webhook ignored.")
        return {"status": "ignored", "reason": "webhook secret not configured"}

    # Verify webhook signature
    expected = hmac.new(
        webhook_secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Webhook signature invalid.")

    import json
    try:
        event_data = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    event = event_data.get("event", "")

    if event == "payment.captured":
        payment_entity = (
            event_data.get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )
        payment_id = payment_entity.get("id")
        order_id = payment_entity.get("order_id")
        captured_amount = int(payment_entity.get("amount", 0))

        if not payment_id or not order_id:
            return {"status": "ignored", "reason": "missing payment or order id"}

        registration = (
            db.query(CourseRegistration)
            .filter(CourseRegistration.razorpay_order_id == order_id)
            .first()
        )

        if not registration:
            logger.info("Webhook: no registration found for order %s", order_id)
            return {"status": "ignored", "reason": "registration not found"}

        # Idempotent — already paid
        if registration.payment_status == "paid":
            return {"status": "already_processed"}

        # Amount guard
        if captured_amount != COURSE_REGISTRATION_FEE_PAISE:
            logger.error(
                "Webhook: amount mismatch for order %s (got %s, expected %s)",
                order_id,
                captured_amount,
                COURSE_REGISTRATION_FEE_PAISE,
            )
            return {"status": "ignored", "reason": "amount mismatch"}

        now = datetime.utcnow()
        registration.razorpay_payment_id = payment_id
        registration.payment_status = "paid"
        registration.enrollment_status = "active"
        registration.paid_at = now

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            logger.warning("Webhook: IntegrityError for order %s — already processed", order_id)
            return {"status": "already_processed"}

        # Send email only once (razorpay_payment_id uniqueness prevents duplicates)
        subject, body = _build_confirmation_email(registration)
        send_email(registration.email, subject, body)

        logger.info("Webhook: payment captured for %s", registration.registration_id)

    return {"status": "ok"}


# ══════════════════════════════════════════════════
# LEGACY — /start kept for backward compatibility
# ══════════════════════════════════════════════════

@router.post(
    "/start",
    response_model=RegistrationStartResponse,
    status_code=status.HTTP_201_CREATED,
)
def start_registration(
    payload: RegistrationStartRequest,
    db: Session = Depends(get_db),
):
    """
    Legacy endpoint — creates registration + Razorpay order in one step.
    Kept for backward compatibility. New frontend uses /init + /create-order.
    """
    course = _get_active_course(db, payload.course_slug)

    registration_id = _make_registration_id()
    try:
        order = create_order(
            amount_rupees=COURSE_REGISTRATION_FEE_RUPEES,
            receipt=registration_id,
            notes={
                "registration_id": registration_id,
                "course_slug": course.slug,
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to create the Razorpay payment order. Please try again.",
        ) from exc

    registration = CourseRegistration(
        registration_id=registration_id,
        full_name=payload.full_name.strip(),
        email=str(payload.email).lower(),
        phone=payload.phone.strip(),
        referral_id=payload.referral_id.strip() if payload.referral_id else None,
        course_id=course.id,
        course_slug=course.slug,
        course_title=course.title,
        amount=COURSE_REGISTRATION_FEE_RUPEES,
        razorpay_order_id=order["id"],
        payment_status="order_created",
    )
    db.add(registration)
    db.commit()

    return RegistrationStartResponse(
        registration_id=registration_id,
        course_title=course.title,
        currency="INR",
        razorpay_order_id=order["id"],
        razorpay_key_id=settings.RAZORPAY_KEY_ID,
    )
