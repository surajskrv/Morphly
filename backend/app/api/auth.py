from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_refresh_token
from app.core.token_blacklist import blacklist_token
from app.api.deps import get_current_user, oauth2_scheme

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
async def register_user(request: Request, user: UserCreate):
    db_user = await User.find_one(User.email == user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, full_name=user.full_name, hashed_password=hashed_password)
    
    await new_user.insert()
    
    res = new_user.model_dump()
    res["id"] = str(new_user.id)
    return res

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/refresh")
@limiter.limit("20/minute")
async def refresh_token(request: Request, refresh_token: str = ""):
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token is required")
    email = verify_refresh_token(refresh_token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    user = await User.find_one(User.email == email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    return {"access_token": new_access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    res = current_user.model_dump()
    res["id"] = str(current_user.id)
    return res

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
):
    # Blacklist for remaining lifetime (max 30 min for access tokens)
    blacklist_token(token, ttl_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    return {"message": "Successfully logged out"}
