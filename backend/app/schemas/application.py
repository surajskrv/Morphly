from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ApplicationJobSummary(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = None
    apply_url: Optional[str] = None
    url: Optional[str] = None
    source: Optional[str] = None


class ApplicationBase(BaseModel):
    job_id: str
    status: Optional[str] = "pending"
    resume_path: Optional[str] = None
    cover_letter_content: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: str | None = None
    user_id: str
    applied_at: Optional[datetime] = None
    created_at: datetime
    job: Optional[ApplicationJobSummary] = None

    model_config = ConfigDict(from_attributes=True)
