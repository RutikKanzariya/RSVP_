from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class InviteeModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    externalId: Optional[str] = None
    name: str
    phone: str
    email: str
    company: Optional[str] = None
    raw_row_valid: bool = True
    validation_errors: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CampaignModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    campaignName: str
    eventName: str
    eventDate: str
    location: str
    objective: str
    status: str = "draft"  # draft | running | completed
    totalInvitees: int = 0
    invalidRows: int = 0
    startedAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CampaignInviteeModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    campaignId: str
    inviteeId: str
    name: str
    phone: str
    email: str
    company: Optional[str] = None
    status: str = "pending"  # pending | calling | confirmed | declined | undecided | failed
    attemptCount: int = 0
    maxAttempts: int = 3
    lastAttemptAt: Optional[datetime] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class CallResultModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    campaignId: str
    inviteeId: str
    campaignInviteeId: str
    attempt: int
    callStatus: str  # completed | no_answer | invalid_number | error
    rsvpStatus: Optional[str] = None  # confirmed | declined | undecided | null
    duration: int = 0  # seconds
    error: Optional[str] = None
    rawResponse: Optional[dict] = None
    transcript: Optional[List[dict]] = None
    startedAt: datetime = Field(default_factory=datetime.utcnow)
    completedAt: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
