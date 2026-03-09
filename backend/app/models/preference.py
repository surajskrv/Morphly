from typing import List, Optional
from beanie import Document
from pydantic import Field

class Preference(Document):
    user_id: str
    desired_role: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None
    location: Optional[str] = None
    remote_only: bool = False
    salary_min: Optional[float] = None
    preferred_companies: List[str] = Field(default_factory=list)

    class Settings:
        name = "preferences"
