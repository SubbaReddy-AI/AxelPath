from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.agreement_acceptance import AgreementAcceptance
from app.models.course_registration import CourseRegistration
from app.schemas.agreement import (
    AGREEMENT_VERSION_V1,
    AgreementAcceptRequest,
    AgreementAcceptResponse,
    AgreementStatusResponse,
)

router = APIRouter(prefix="/agreements", tags=["Agreements"])


@router.post("/accept", response_model=AgreementAcceptResponse)
def accept_agreement(
    payload: AgreementAcceptRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Record that the student has read and accepted the AxelPath agreement.
    Must be called before a Razorpay order can be created.
    """
    # 1. Verify the registration exists
    registration = (
        db.query(CourseRegistration)
        .filter(CourseRegistration.registration_id == payload.registration_id)
        .first()
    )
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    # 2. Block if already fully paid (no re-acceptance needed)
    if registration.payment_status == "paid":
        raise HTTPException(
            status_code=409,
            detail="Payment already completed for this registration.",
        )

    # 3. Validate agreement version — only the canonical version is accepted
    if payload.agreement_version != AGREEMENT_VERSION_V1:
        raise HTTPException(
            status_code=400,
            detail="Invalid or unrecognised agreement version.",
        )

    now = datetime.utcnow()
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")

    # 4. Upsert agreement acceptance record
    existing = (
        db.query(AgreementAcceptance)
        .filter(
            AgreementAcceptance.registration_id == payload.registration_id
        )
        .first()
    )

    if existing:
        existing.agreement_accepted = True
        existing.accepted_at = now
        existing.agreement_version = AGREEMENT_VERSION_V1
        existing.ip_address = ip_address
        existing.user_agent = user_agent
        existing.updated_at = now
    else:
        db.add(
            AgreementAcceptance(
                registration_id=payload.registration_id,
                agreement_version=AGREEMENT_VERSION_V1,
                agreement_accepted=True,
                accepted_at=now,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        )

    # 5. Denormalise onto the registration row for fast queries
    registration.agreement_accepted = True
    registration.agreement_version = AGREEMENT_VERSION_V1
    if registration.payment_status == "pending_agreement":
        registration.payment_status = "agreement_accepted"

    db.commit()

    return AgreementAcceptResponse(
        success=True,
        registration_id=payload.registration_id,
        agreement_version=AGREEMENT_VERSION_V1,
        accepted_at=now,
        message="Agreement accepted. You may now proceed to payment.",
    )


@router.get("/status/{registration_id}", response_model=AgreementStatusResponse)
def get_agreement_status(
    registration_id: str,
    db: Session = Depends(get_db),
):
    """Return the current agreement acceptance status for a registration."""
    acceptance = (
        db.query(AgreementAcceptance)
        .filter(AgreementAcceptance.registration_id == registration_id)
        .first()
    )

    if not acceptance:
        return AgreementStatusResponse(
            registration_id=registration_id,
            agreement_accepted=False,
        )

    return AgreementStatusResponse(
        registration_id=registration_id,
        agreement_accepted=acceptance.agreement_accepted,
        agreement_version=acceptance.agreement_version,
        accepted_at=acceptance.accepted_at,
    )
