from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional

class PreferenceBase(BaseModel):
    desired_role: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None
    location: Optional[str] = None
    remote_only: bool = False
    salary_min: Optional[float] = None
    preferred_companies: List[str] = Field(default_factory=list)

class PreferenceCreate(PreferenceBase):
    pass

class PreferenceResponse(PreferenceBase):
    id: str | None = None
    user_id: str

    model_config = ConfigDict(from_attributes=True)
