from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field

class Application(Document):
    user_id: str
    job_id: str
    status: str = "pending"
    resume_path: Optional[str] = None
    cover_letter_content: Optional[str] = None
    applied_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "applications"
