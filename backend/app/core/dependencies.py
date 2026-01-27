"""
FastAPI dependencies for authentication and database
"""
from fastapi import Depends, HTTPException, status, Cookie
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.schemas.user import UserResponse

security = HTTPBearer()


async def get_current_user(
    db: Session = Depends(get_db),
    access_token: Optional[str] = Cookie(None)
) -> User:
    """Get current authenticated user from JWT token"""
    # Get token from cookie (HTTP-only cookie is primary auth method)
    token = access_token
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_user_optional(
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if not access_token:
        return None
    
    try:
        payload = decode_access_token(access_token)
        if payload is None:
            return None
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except Exception:
        return None

