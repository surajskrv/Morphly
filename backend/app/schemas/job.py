from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    apply_url: str
    source: str
    posted_at: Optional[datetime] = None
    fingerprint: str

    # Optional enrichment fields.
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_level: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    match_score: Optional[float] = None
    relevance_score: Optional[float] = None

    # Backward-compatible aliases for older frontend clients.
    url: Optional[str] = None
    external_id: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
