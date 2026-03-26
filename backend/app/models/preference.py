from datetime import datetime, timezone

from beanie import Document
from pydantic import BaseModel, Field, model_validator


class ExtractedProfile(BaseModel):
    desired_role: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience_level: str | None = None
    location: str | None = None
    summary: str | None = None
    past_companies: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    extracted_at: datetime | None = None


class UserPreferences(BaseModel):
    desired_role: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience_level: str | None = None
    location: str | None = None
    remote_only: bool = False
    salary_min: float | None = None
    preferred_companies: list[str] = Field(default_factory=list)


class FetchStatus(BaseModel):
    in_progress: bool = False
    last_requested_at: datetime | None = None
    last_completed_at: datetime | None = None
    last_error: str | None = None


class Preference(Document):
    user_id: str
    extracted_profile: ExtractedProfile = Field(default_factory=ExtractedProfile)
    user_preferences: UserPreferences = Field(default_factory=UserPreferences)
    fetch_status: FetchStatus = Field(default_factory=FetchStatus)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="before")
    @classmethod
    def migrate_legacy_shape(cls, data):
        if not isinstance(data, dict):
            return data

        if "user_preferences" not in data:
            legacy_preferences = {
                "desired_role": data.get("desired_role"),
                "skills": data.get("skills", []),
                "experience_level": data.get("experience_level"),
                "location": data.get("location"),
                "remote_only": data.get("remote_only", False),
                "salary_min": data.get("salary_min"),
                "preferred_companies": data.get("preferred_companies", []),
            }
            data["user_preferences"] = legacy_preferences

        data.setdefault("extracted_profile", {})
        data.setdefault("fetch_status", {})
        return data

    def merged_preferences(self) -> UserPreferences:
        extracted = self.extracted_profile
        manual = self.user_preferences
        return UserPreferences(
            desired_role=manual.desired_role or extracted.desired_role,
            skills=manual.skills or extracted.skills,
            experience_level=manual.experience_level or extracted.experience_level,
            location=manual.location or extracted.location,
            remote_only=manual.remote_only,
            salary_min=manual.salary_min,
            preferred_companies=manual.preferred_companies,
        )

    class Settings:
        name = "preferences"
