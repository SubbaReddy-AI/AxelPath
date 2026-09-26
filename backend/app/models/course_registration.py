from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class CourseRegistration(Base):
    __tablename__ = "course_registrations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    registration_id: Mapped[str] = mapped_column(
        String(40), unique=True, index=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    referral_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    course_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    course_slug: Mapped[str] = mapped_column(String(200), nullable=False)
    course_title: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)

    razorpay_order_id: Mapped[str | None] = mapped_column(
        String(80), unique=True, index=True, nullable=True
    )
    razorpay_payment_id: Mapped[str | None] = mapped_column(
        String(80), unique=True, index=True, nullable=True
    )
    razorpay_signature: Mapped[str | None] = mapped_column(String(128), nullable=True)
    utr: Mapped[str | None] = mapped_column(
        String(100), unique=True, index=True, nullable=True
    )

    payment_status: Mapped[str] = mapped_column(
        String(30), default="pending_agreement", index=True, nullable=False
    )

    # Agreement acceptance (denormalised for quick lookup)
    agreement_accepted: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    agreement_version: Mapped[str | None] = mapped_column(String(120), nullable=True)

    # Enrollment
    enrollment_status: Mapped[str] = mapped_column(
        String(50), default="pending", nullable=False
    )

    # Google Drive future-ready fields (NULL until configured)
    google_drive_folder_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    google_drive_folder_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    google_drive_status: Mapped[str | None] = mapped_column(
        String(50), nullable=True, default="pending"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
