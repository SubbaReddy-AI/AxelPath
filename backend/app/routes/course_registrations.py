"""
AxelPath course registration routes.

Payment flow
------------
1. POST /course-registrations/init         — create DB record, return registration_id
2. POST /agreements/accept                  — student accepts agreement (separate router)
3. POST /course-registrations/create-order — verify agreement → create Razorpay order
4. POST /course-registrations/verify       — verify Razorpay signature → mark paid
5. POST /course-registrations/webhook      — Razorpay webhook (idempotent backup path)

Legacy endpoint (backward-compat)
----------------------------------
POST /course-registrations/start           — kept for older frontends

Security invariants (enforced server-side, never trusted from the client)
--------------------------------------------------------------------------
- Payment amount is supplied by the student and validated server-side:
    * Must be a positive integer (rupees), minimum ₹1, maximum ₹10,00,000.
    * Stored on the registration row at order-creation time.
    * Cross-checked against Razorpay API response at verification.
- HMAC-SHA256 signature is verified before any payment is accepted.
- UTR uniqueness is enforced at DB level (unique index) and application level.
- Webhook signatures are verified with RAZORPAY_WEBHOOK_SECRET.
- All Razorpay credentials come exclusively from environment variables.
"""

import json
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
    verify_webhook_signature,
)
from app.excel.exporter import export_all_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/course-registrations", tags=["Course Registrations"])

# ──────────────────────────────────────────────────────────────────────────────
# Amount bounds — validated server-side when the student submits their amount
# ──────────────────────────────────────────────────────────────────────────────
_AMOUNT_MIN_RUPEES = 1           # ₹1 minimum
_AMOUNT_MAX_RUPEES = 1_000_000   # ₹10,00,000 maximum


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _make_registration_id() -> str:
    return f"APREG-{datetime.utcnow().year}-{uuid4().hex[:8].upper()}"


def _get_active_course(db: Session, course_slug: str) -> Course:
    course = (
        db.query(Course)
        .filter(
            Course.is_active == True,  # noqa: E712
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


def _mark_paid(
    db: Session,
    registration: CourseRegistration,
    payment_id: str,
    signature: str | None,
    utr: str | None,
) -> None:
    """
    Write the 'paid' state to the database inside a transaction.

    Raises HTTPException 409 on IntegrityError (duplicate payment_id / UTR).
    """
    now = datetime.utcnow()
    registration.razorpay_payment_id = payment_id
    registration.razorpay_signature = signature
    registration.utr = utr
    registration.payment_status = "paid"
    registration.enrollment_status = "active"
    registration.paid_at = now

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        logger.error(
            "DB IntegrityError marking %s as paid: %s",
            registration.registration_id,
            exc,
        )
        raise HTTPException(
            status_code=409,
            detail="This payment or UTR has already been registered.",
        ) from exc


# ──────────────────────────────────────────────────────────────────────────────
# STEP 1 — Init registration (no Razorpay order yet)
# ──────────────────────────────────────────────────────────────────────────────

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
    Create a course registration record (Step 1).

    No Razorpay order is created yet — the student must read and accept the
    AxelPath agreement before proceeding to payment.

    Returns a registration_id that identifies the record throughout the flow.
    """
    course = _get_active_course(db, payload.course_slug)

    # Prevent duplicate successful enrollments for the same email + course
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
        amount=0,           # updated at create-order time with the student's chosen amount
        payment_status="pending_agreement",
        agreement_accepted=False,
        enrollment_status="pending",
    )
    db.add(registration)
    db.commit()

    logger.info(
        "Registration created | registration_id=%s course=%s",
        registration_id,
        course.slug,
    )

    return RegistrationInitResponse(
        registration_id=registration_id,
        course_title=course.title,
        message="Registration created. Please read and accept the agreement to continue.",
    )


# ──────────────────────────────────────────────────────────────────────────────
# STEP 3 — Create Razorpay order (after agreement accepted)
# ──────────────────────────────────────────────────────────────────────────────

@router.post(
    "/create-order",
    response_model=CreateOrderResponse,
)
def create_payment_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
):
    """
    Create a Razorpay order for an existing registration (Step 3).

    Prerequisites enforced server-side:
      - Registration must exist.
      - Agreement must have been accepted (checked in agreement_acceptances table).
      - No successful payment may already exist.
      - Amount (rupees) must be within the allowed range (_AMOUNT_MIN_RUPEES.._AMOUNT_MAX_RUPEES).

    The student-supplied amount is validated here, stored on the registration row,
    and used to create the Razorpay order. Razorpay Checkout reads the amount
    from the order object directly via the order_id.
    """
    registration = (
        db.query(CourseRegistration)
        .filter(CourseRegistration.registration_id == payload.registration_id)
        .first()
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    # Guard: already paid
    if registration.payment_status == "paid":
        raise HTTPException(
            status_code=409,
            detail=(
                "Payment already completed for this registration. "
                f"Registration ID: {registration.registration_id}"
            ),
        )

    # Guard: agreement must be accepted
    # Check both the denormalised flag on the registration row AND the
    # authoritative agreement_acceptances table so that a network race
    # between /agreements/accept and /create-order is handled correctly.
    if not registration.agreement_accepted:
        acceptance = (
            db.query(AgreementAcceptance)
            .filter(
                AgreementAcceptance.registration_id == payload.registration_id,
                AgreementAcceptance.agreement_accepted == True,  # noqa: E712
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
        # Sync the denormalised flag so future requests skip this lookup
        registration.agreement_accepted = True
        registration.agreement_version = acceptance.agreement_version

    # Validate the student-supplied amount server-side
    amount_rupees = payload.amount_rupees
    if not (_AMOUNT_MIN_RUPEES <= amount_rupees <= _AMOUNT_MAX_RUPEES):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment amount must be between ₹{_AMOUNT_MIN_RUPEES:,} "
                f"and ₹{_AMOUNT_MAX_RUPEES:,}."
            ),
        )

    # Reuse an existing open order (idempotent re-submission)
    if (
        registration.razorpay_order_id
        and registration.payment_status in ("order_created", "agreement_accepted")
    ):
        logger.info(
            "Reusing existing Razorpay order | registration_id=%s order_id=%s",
            registration.registration_id,
            registration.razorpay_order_id,
        )
        return CreateOrderResponse(
            registration_id=registration.registration_id,
            course_title=registration.course_title,
            currency="INR",
            razorpay_order_id=registration.razorpay_order_id,
            razorpay_key_id=settings.RAZORPAY_KEY_ID,
        )

    # Create a new Razorpay order using the student-supplied amount
    try:
        order = create_order(
            amount_rupees=amount_rupees,
            receipt=registration.registration_id,
            notes={
                "registration_id": registration.registration_id,
                "course_slug": registration.course_slug,
                "agreement_version": AGREEMENT_VERSION_V1,
            },
        )
    except RuntimeError as exc:
        # Credentials not configured
        logger.error("Razorpay credentials missing: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Payment service is not configured. Please contact support.",
        ) from exc
    except Exception as exc:
        logger.error("Razorpay order creation failed: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Unable to create the payment order. Please try again.",
        ) from exc

    # Persist the chosen amount on the registration row
    registration.amount = amount_rupees
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


# ──────────────────────────────────────────────────────────────────────────────
# STEP 4 — Verify Razorpay payment
# ──────────────────────────────────────────────────────────────────────────────

@router.post(
    "/verify",
    response_model=RegistrationSuccessResponse,
)
def verify_registration_payment(
    payload: RegistrationVerifyRequest,
    db: Session = Depends(get_db),
):
    """
    Verify a Razorpay payment and mark the registration as paid (Step 4).

    Verification chain (all must pass):
      1. Registration exists and belongs to this order.
      2. UTR is provided, non-empty, and not already used.
      3. HMAC-SHA256 signature matches (key_secret × order_id|payment_id).
      4. Razorpay API confirms payment is captured.
      5. Razorpay API confirms amount matches the stored registration amount.
      6. UTR matches a reference value returned by Razorpay (when available).

    Idempotent: returns success immediately if already paid.
    """
    registration = (
        db.query(CourseRegistration)
        .filter(CourseRegistration.registration_id == payload.registration_id)
        .first()
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    # Idempotent: already paid — return success without re-processing
    if registration.payment_status == "paid":
        return RegistrationSuccessResponse(
            success=True,
            registration_id=registration.registration_id,
            course_title=registration.course_title,
            payment_status="paid",
            message="Registration is already confirmed.",
        )

    # 1. Order cross-check
    if payload.razorpay_order_id != registration.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Payment order does not match this registration.",
        )

    # 2. UTR presence and uniqueness
    normalized_utr = payload.utr.strip().upper()
    if not normalized_utr:
        raise HTTPException(
            status_code=400,
            detail="Please enter the UTR / transaction reference number.",
        )

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

    # 3 + 4 + 5 + 6 — Signature, fetch, amount, and UTR cross-check
    try:
        # 3. HMAC-SHA256 signature verification
        if not verify_signature(
            registration.razorpay_order_id,
            payload.razorpay_payment_id,
            payload.razorpay_signature,
        ):
            raise HTTPException(
                status_code=400,
                detail="Payment signature verification failed.",
            )

        # 4. Fetch payment details from Razorpay API
        payment = fetch_payment(payload.razorpay_payment_id)

    except HTTPException:
        raise
    except RuntimeError as exc:
        # Credentials not configured
        logger.error("Razorpay credentials missing during verify: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Payment service is not configured. Please contact support.",
        ) from exc
    except Exception as exc:
        logger.error("Razorpay verification error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Razorpay payment verification is temporarily unavailable.",
        ) from exc

    # 4b. Payment must belong to this order (cross-check via Razorpay API)
    if payment.get("order_id") != registration.razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Payment is not linked to this registration order.",
        )

    # 5. Amount must match the registration's stored amount (converted to paise)
    expected_paise = int(registration.amount) * 100
    try:
        razorpay_amount = int(payment.get("amount", 0))
    except (TypeError, ValueError):
        razorpay_amount = 0

    if razorpay_amount != expected_paise:
        logger.error(
            "Amount mismatch | registration_id=%s expected_paise=%s got=%s",
            registration.registration_id,
            expected_paise,
            razorpay_amount,
        )
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match the registered amount.",
        )

    # 5b. Payment status must be 'captured'
    if payment.get("status") != "captured" or not payment.get("captured"):
        raise HTTPException(
            status_code=400,
            detail="Payment is not captured yet. Please wait and try again.",
        )

    # 6. UTR must match a reference Razorpay reports (when available)
    razorpay_refs = payment_reference_values(payment)
    if razorpay_refs and normalized_utr not in razorpay_refs:
        raise HTTPException(
            status_code=400,
            detail="The UTR / transaction reference does not match the Razorpay payment.",
        )

    # All checks passed — persist paid state
    _mark_paid(
        db=db,
        registration=registration,
        payment_id=payload.razorpay_payment_id,
        signature=payload.razorpay_signature,
        utr=normalized_utr,
    )

    # Non-fatal post-commit side effects
    try:
        export_all_data(db)
    except Exception as export_exc:
        logger.warning("Excel export failed (non-fatal): %s", export_exc)

    # Send confirmation email
    subject, body = _build_confirmation_email(registration)
    email_sent = send_email(registration.email, subject, body)

    logger.info(
        "Payment verified and confirmed | registration_id=%s payment_id=%s",
        registration.registration_id,
        payload.razorpay_payment_id,
    )

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


# ──────────────────────────────────────────────────────────────────────────────
# WEBHOOK — Razorpay webhook (idempotent backup confirmation path)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/webhook", include_in_schema=False)
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay webhook endpoint (Step 5 — backup path).

    The webhook fires independently of the browser session, so it acts as a
    safety net when the student's browser closes before /verify completes.

    Security:
      - Webhook signature is verified with RAZORPAY_WEBHOOK_SECRET (not key_secret).
      - Handler is idempotent: re-delivery of a captured event has no effect.
      - Amount is validated server-side against the fixed ₹8,550 constant.
      - razorpay_signature is NOT set by this path because Razorpay does not
        include the payment signature in webhook payloads; only /verify sets it.

    Configure this URL in the Razorpay Dashboard:
      https://qodekraft.onrender.com/api/v1/course-registrations/webhook
    Event to subscribe: payment.captured
    """
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # Verify webhook signature — reject unsigned / incorrectly signed requests
    if not verify_webhook_signature(raw_body, signature):
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET.get_secret_value()
        if not webhook_secret:
            # Secret not yet configured — log and ignore rather than 400
            # so that Razorpay does not disable the webhook for repeated failures
            logger.warning(
                "Webhook: RAZORPAY_WEBHOOK_SECRET not set — request ignored."
            )
            return {"status": "ignored", "reason": "webhook secret not configured"}
        # Secret IS configured but signature did not match — reject
        raise HTTPException(status_code=400, detail="Webhook signature invalid.")

    try:
        event_data = json.loads(raw_body)
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    event = event_data.get("event", "")
    logger.info("Webhook: received event=%s", event)

    if event == "payment.captured":
        payment_entity = (
            event_data.get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )
        payment_id = payment_entity.get("id")
        order_id = payment_entity.get("order_id")

        # Safely parse amount — Razorpay always sends paise as int, but guard anyway
        try:
            captured_amount = int(payment_entity.get("amount", 0))
        except (TypeError, ValueError):
            captured_amount = 0

        if not payment_id or not order_id:
            logger.warning("Webhook: missing payment_id or order_id in payload")
            return {"status": "ignored", "reason": "missing payment or order id"}

        registration = (
            db.query(CourseRegistration)
            .filter(CourseRegistration.razorpay_order_id == order_id)
            .first()
        )

        if not registration:
            logger.info("Webhook: no registration found for order_id=%s", order_id)
            return {"status": "ignored", "reason": "registration not found"}

        # Idempotent — already processed by /verify or a previous webhook delivery
        if registration.payment_status == "paid":
            logger.info(
                "Webhook: already paid | registration_id=%s",
                registration.registration_id,
            )
            return {"status": "already_processed"}

        # Amount guard — compare against the stored registration amount (paise)
        expected_paise = int(registration.amount) * 100
        if captured_amount != expected_paise:
            logger.error(
                "Webhook: amount mismatch | order_id=%s expected_paise=%s got=%s",
                order_id,
                expected_paise,
                captured_amount,
            )
            return {"status": "ignored", "reason": "amount mismatch"}

        # Mark paid — razorpay_signature is None here (not in webhook payload)
        _mark_paid(
            db=db,
            registration=registration,
            payment_id=payment_id,
            signature=None,
            utr=None,
        )

        # Confirmation email
        subject, body = _build_confirmation_email(registration)
        send_email(registration.email, subject, body)

        logger.info(
            "Webhook: payment captured | registration_id=%s payment_id=%s",
            registration.registration_id,
            payment_id,
        )

    return {"status": "ok"}


# ──────────────────────────────────────────────────────────────────────────────
# LEGACY — /start kept for backward compatibility with older frontends
# ──────────────────────────────────────────────────────────────────────────────

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
    Legacy endpoint — superseded by /init → /agreements/accept → /create-order.

    This endpoint is no longer active.  It previously created a registration +
    Razorpay order in one step with a fixed fee, but that fixed fee has been
    removed.  Callers must migrate to the current three-step flow so that the
    student can supply the payment amount explicitly.

    Returns HTTP 410 Gone to signal deprecation without creating a zero-value
    Razorpay order or an orphaned DB row.
    """
    raise HTTPException(
        status_code=410,
        detail=(
            "This endpoint is no longer supported. "
            "Please use POST /course-registrations/init → "
            "POST /agreements/accept → "
            "POST /course-registrations/create-order."
        ),
    )
