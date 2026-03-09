from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

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

    model_config = ConfigDict(from_attributes=True)
