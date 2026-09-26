from datetime import datetime
from typing import Optional

from pydantic import BaseModel


AGREEMENT_VERSION_V1 = (
    "AXELPATH-Student-Training-Evaluation-Career-Support-Agreement-v1"
)


class AgreementAcceptRequest(BaseModel):
    registration_id: str
    agreement_version: str = AGREEMENT_VERSION_V1


class AgreementAcceptResponse(BaseModel):
    success: bool
    registration_id: str
    agreement_version: str
    accepted_at: datetime
    message: str


class AgreementStatusResponse(BaseModel):
    registration_id: str
    agreement_accepted: bool
    agreement_version: Optional[str] = None
    accepted_at: Optional[datetime] = None
