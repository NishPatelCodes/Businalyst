"""
Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from pydantic import EmailStr, constr
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    generate_csrf_token
)
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.rate_limit import rate_limit
from app.models.user import User, AuthProvider
from app.schemas.user import (
    UserLogin,
    UserRegister,
    UserResponse,
    Token
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def set_auth_cookie(response: Response, token: str):
    """Set HTTP-only cookie with access token"""
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,  # Only send over HTTPS
        samesite="lax",  # CSRF protection
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user with email and password"""
    # Validate email format (Pydantic handles this, but explicit check)
    if not user_data.email or "@" not in user_data.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password strength
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name or user_data.email.split("@")[0],
        provider=AuthProvider.EMAIL,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    # Validate input
    if not user_credentials.email or not user_credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    # Set HTTP-only cookie
    set_auth_cookie(response, access_token)
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing auth cookie"""
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return {"message": "Logged out successfully"}


@router.get("/csrf")
async def get_csrf_token():
    """Get CSRF token for form submissions"""
    csrf_token = generate_csrf_token()
    return {"csrf_token": csrf_token}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user

