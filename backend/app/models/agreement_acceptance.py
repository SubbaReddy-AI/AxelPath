from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base

AGREEMENT_VERSION_V1 = (
    "AXELPATH-Student-Training-Evaluation-Career-Support-Agreement-v1"
)


class AgreementAcceptance(Base):
    __tablename__ = "agreement_acceptances"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    registration_id: Mapped[str] = mapped_column(
        String(40), index=True, nullable=False
    )

    agreement_version: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        default=AGREEMENT_VERSION_V1,
    )

    agreement_accepted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    ip_address: Mapped[str | None] = mapped_column(String(60), nullable=True)

    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
