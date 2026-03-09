from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    external_id: str
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    url: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    relevance_score: Optional[float] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
