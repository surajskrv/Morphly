from typing import Optional

from pydantic import ConfigDict, Field

from app.schemas.profile import UserPreferencesSchema


class PreferenceBase(UserPreferencesSchema):
    pass

class PreferenceCreate(PreferenceBase):
    pass

class PreferenceResponse(PreferenceBase):
    id: str | None = None
    user_id: str
    summary: Optional[str] = None
    past_companies: list[str] = Field(default_factory=list)
    education: list[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
