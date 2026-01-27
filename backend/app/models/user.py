"""
User database model
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
import enum
from app.core.database import Base


class AuthProvider(str, enum.Enum):
    """Authentication provider enum"""
    GOOGLE = "google"
    GITHUB = "github"
    APPLE = "apple"
    EMAIL = "email"


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    provider = Column(Enum(AuthProvider), nullable=False, default=AuthProvider.EMAIL)
    provider_id = Column(String(255), nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, provider={self.provider})>"

