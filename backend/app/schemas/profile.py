from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExtractedProfileSchema(BaseModel):
    desired_role: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience_level: str | None = None
    location: str | None = None
    summary: str | None = None
    past_companies: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)
    extracted_at: datetime | None = None


class UserPreferencesSchema(BaseModel):
    desired_role: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience_level: str | None = None
    location: str | None = None
    remote_only: bool = False
    salary_min: float | None = None
    preferred_companies: list[str] = Field(default_factory=list)


class MergedProfileSchema(UserPreferencesSchema):
    summary: str | None = None
    past_companies: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)


class FetchStatusSchema(BaseModel):
    in_progress: bool = False
    last_requested_at: datetime | None = None
    last_completed_at: datetime | None = None
    last_error: str | None = None


class ProfileReviewRequest(UserPreferencesSchema):
    pass


class ProfileResponse(BaseModel):
    id: str | None = None
    user_id: str
    extracted_profile: ExtractedProfileSchema = Field(default_factory=ExtractedProfileSchema)
    user_preferences: UserPreferencesSchema = Field(default_factory=UserPreferencesSchema)
    merged_profile: MergedProfileSchema = Field(default_factory=MergedProfileSchema)
    fetch_status: FetchStatusSchema = Field(default_factory=FetchStatusSchema)

    model_config = ConfigDict(from_attributes=True)
