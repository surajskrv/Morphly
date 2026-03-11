from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from app.core.config import settings

import bcrypt
import hashlib

def verify_password(plain_password: str, hashed_password: str) -> bool:
    b_plain_password = plain_password.encode('utf-8')
    b_hashed_password = hashed_password.encode('utf-8')
    
    # Check for backward compatibility (in case there are existing users)
    try:
        if len(b_plain_password) <= 72:
            if bcrypt.checkpw(b_plain_password, b_hashed_password):
                return True
    except (ValueError, TypeError):
        pass

    # New method (sha256 then bcrypt)
    try:
        password_hash = hashlib.sha256(b_plain_password).hexdigest().encode('utf-8')
        return bcrypt.checkpw(password_hash, b_hashed_password)
    except (ValueError, TypeError):
        return False

def get_password_hash(password: str) -> str:
    # Hash password with SHA-256 to bypass bcrypt's 72 byte limit
    b_password = password.encode('utf-8')
    password_hash = hashlib.sha256(b_password).hexdigest().encode('utf-8')
    hashed = bcrypt.hashpw(password_hash, bcrypt.gensalt())
    return hashed.decode('utf-8')

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"iat": now, "exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
