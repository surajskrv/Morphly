from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field, model_validator

class Application(Document):
    user_id: str
    job_id: str
    status: str = "saved"
    resume_path: Optional[str] = None
    resume_sections: list[dict[str, str]] = Field(default_factory=list)
    resume_grounding: list[str] = Field(default_factory=list)
    cover_letter_content: Optional[str] = None
    cover_letter_grounding: list[str] = Field(default_factory=list)
    applied_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="before")
    @classmethod
    def migrate_legacy_status(cls, data):
        if isinstance(data, dict) and data.get("status") == "pending":
            data["status"] = "saved"
        return data

    class Settings:
        name = "applications"
