from pydantic import BaseModel, ConfigDict, Field
from typing import Literal, Optional
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
    status: Literal["saved", "ready", "applied"] = "saved"
    resume_path: Optional[str] = None
    resume_sections: list[dict[str, str]] = Field(default_factory=list)
    resume_grounding: list[str] = Field(default_factory=list)
    cover_letter_content: Optional[str] = None
    cover_letter_grounding: list[str] = Field(default_factory=list)

class ApplicationCreate(ApplicationBase):
    pass


class ApplicationStatusUpdate(BaseModel):
    status: Literal["saved", "ready", "applied"]


class ApplicationUpdate(BaseModel):
    status: Literal["saved", "ready", "applied"] | None = None
    resume_path: Optional[str] = None
    resume_sections: list[dict[str, str]] | None = None
    resume_grounding: list[str] | None = None
    cover_letter_content: Optional[str] = None
    cover_letter_grounding: list[str] | None = None

class ApplicationResponse(ApplicationBase):
    id: str | None = None
    user_id: str
    applied_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    job: Optional[ApplicationJobSummary] = None

    model_config = ConfigDict(from_attributes=True)
