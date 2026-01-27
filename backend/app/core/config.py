"""
Application configuration and environment variables
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OAuth - Google
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # OAuth - GitHub
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    
    # OAuth - Apple
    APPLE_CLIENT_ID: Optional[str] = None
    APPLE_TEAM_ID: Optional[str] = None
    APPLE_KEY_ID: Optional[str] = None
    APPLE_PRIVATE_KEY: Optional[str] = None
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

