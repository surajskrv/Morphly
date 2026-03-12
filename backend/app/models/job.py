import hashlib
from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field, model_validator

class Job(Document):
    title: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    apply_url: str = ""
    source: str = "unknown"
    posted_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Optional enrichment fields used for ranking/matching.
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_level: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    match_score: Optional[float] = None
    relevance_score: Optional[float] = None

    # Internal deduplication fingerprint: sha256(title + company + location).
    fingerprint: str = ""

    # Backward-compatible fields for older API consumers.
    url: Optional[str] = None
    external_id: Optional[str] = None

    @model_validator(mode="after")
    def sync_legacy_fields(self) -> "Job":
        if not self.apply_url and self.url:
            self.apply_url = self.url
        if not self.url:
            self.url = self.apply_url
        if not self.fingerprint:
            base = f"{self.title.lower()}::{self.company.lower()}::{(self.location or '').lower()}"
            self.fingerprint = hashlib.sha256(base.encode("utf-8")).hexdigest()
        if not self.external_id:
            self.external_id = self.fingerprint
        if self.match_score is None and self.relevance_score is not None:
            self.match_score = self.relevance_score
        if self.relevance_score is None and self.match_score is not None:
            self.relevance_score = self.match_score
        return self

    class Settings:
        name = "jobs"
