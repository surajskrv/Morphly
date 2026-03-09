from datetime import datetime, timezone
from typing import Optional
from beanie import Document
from pydantic import Field

class User(Document):
    email: str
    hashed_password: str
    full_name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
