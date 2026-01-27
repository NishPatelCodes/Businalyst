"""
Pydantic schemas for user data validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user creation"""
    password: Optional[str] = None
    provider: Optional[str] = "email"
    provider_id: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    provider: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"


class UserRegister(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str
    name: Optional[str] = None

