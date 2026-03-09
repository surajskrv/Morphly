import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)

# Standard OAuth2 scheme for FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode token using PyJWT with strict verification
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_signature": True, "verify_exp": True, "verify_iat": True}
        )
        
        # 2. Extract and validate subject (user email)
        email: str = payload.get("sub")
        if not email:
            logger.warning("Token payload is missing the 'sub' subject claim")
            raise credentials_exception
            
    except ExpiredSignatureError:
        logger.info("Token validation failed: Signature has expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenError as e:
        logger.warning(f"Token validation failed: Invalid token - {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Unexpected error during token decoding: {e}", exc_info=True)
        raise credentials_exception
    
    # 3. Fetch user from database
    user = await User.find_one(User.email == email)
    
    # 4. Validate user exists
    if not user:
        logger.warning(f"Token validation failed: User with email {email} not found")
        raise credentials_exception
        
    return user
