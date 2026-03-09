from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field

class Job(Document):
    external_id: str
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    url: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    relevance_score: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "jobs"
