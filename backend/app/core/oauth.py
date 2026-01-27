"""
OAuth2 client configurations for Google, GitHub, and Apple
"""
from httpx_oauth import OAuth2
from app.core.config import settings
from typing import Optional


class OAuthClients:
    """OAuth2 clients for different providers"""
    
    google: Optional[OAuth2] = None
    github: Optional[OAuth2] = None
    
    @classmethod
    def init_google(cls):
        """Initialize Google OAuth client"""
        if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
            cls.google = OAuth2(
                settings.GOOGLE_CLIENT_ID,
                settings.GOOGLE_CLIENT_SECRET,
                "https://accounts.google.com/o/oauth2/v2/auth",
                "https://oauth2.googleapis.com/token",
            )
    
    @classmethod
    def init_github(cls):
        """Initialize GitHub OAuth client"""
        if settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET:
            cls.github = OAuth2(
                settings.GITHUB_CLIENT_ID,
                settings.GITHUB_CLIENT_SECRET,
                "https://github.com/login/oauth/authorize",
                "https://github.com/login/oauth/access_token",
            )
    
    @classmethod
    def init_all(cls):
        """Initialize all OAuth clients"""
        cls.init_google()
        cls.init_github()


# Initialize OAuth clients
oauth_clients = OAuthClients()
oauth_clients.init_all()

