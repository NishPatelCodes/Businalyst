"""
OAuth2 endpoints for Google, GitHub, and Apple
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import timedelta
import httpx
from urllib.parse import urlencode
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.core.oauth import oauth_clients
from app.models.user import User, AuthProvider
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/auth", tags=["oauth"])


def get_or_create_user(
    db: Session,
    email: str,
    name: str,
    provider: AuthProvider,
    provider_id: str
) -> User:
    """Get existing user or create new one from OAuth"""
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update provider info if needed
        if not user.provider_id:
            user.provider_id = provider_id
            user.provider = provider
            if not user.name:
                user.name = name
            db.commit()
            db.refresh(user)
        return user
    
    # Create new user
    new_user = User(
        email=email,
        name=name,
        provider=provider,
        provider_id=provider_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/google")
async def google_oauth(request: Request):
    """Initiate Google OAuth flow"""
    if not oauth_clients.google:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )
    
    # Get backend URL from settings or construct from request
    backend_url = getattr(settings, 'BACKEND_URL', None) or str(request.base_url).rstrip('/')
    redirect_uri = f"{backend_url}/api/auth/google/callback"
    
    authorization_url = await oauth_clients.google.get_authorization_url(
        redirect_uri=redirect_uri,
        scope=["openid", "email", "profile"],
        state="google_oauth_state"  # In production, use a secure random state
    )
    
    return {"authorization_url": authorization_url}


@router.get("/google/callback")
async def google_oauth_callback(
    code: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback"""
    if not oauth_clients.google:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )
    
    try:
        # Get backend URL for callback
        backend_url = getattr(settings, 'BACKEND_URL', None) or str(request.base_url).rstrip('/')
        redirect_uri = f"{backend_url}/api/auth/google/callback"
        
        # Exchange code for token
        token = await oauth_clients.google.get_access_token(
            code,
            redirect_uri=redirect_uri
        )
        
        # Get user info from Google
        async with httpx.AsyncClient() as client:
            user_info_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {token.access_token}"}
            )
            user_info = user_info_response.json()
        
        # Get or create user
        user = get_or_create_user(
            db=db,
            email=user_info["email"],
            name=user_info.get("name", user_info["email"].split("@")[0]),
            provider=AuthProvider.GOOGLE,
            provider_id=user_info["id"]
        )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        # Create redirect response
        redirect_response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/",
            status_code=status.HTTP_302_FOUND
        )
        
        # Set HTTP-only cookie
        redirect_response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/"
        )
        
        return redirect_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth error: {str(e)}"
        )


@router.get("/github")
async def github_oauth(request: Request):
    """Initiate GitHub OAuth flow"""
    if not oauth_clients.github:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth not configured"
        )
    
    # Get backend URL for callback
    backend_url = getattr(settings, 'BACKEND_URL', None) or str(request.base_url).rstrip('/')
    redirect_uri = f"{backend_url}/api/auth/github/callback"
    
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "user:email",
        "state": "github_oauth_state"  # In production, use secure random state
    }
    
    authorization_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    
    return {"authorization_url": authorization_url}


@router.get("/github/callback")
async def github_oauth_callback(
    code: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle GitHub OAuth callback"""
    if not oauth_clients.github:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub OAuth not configured"
        )
    
    try:
        # Exchange code for token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET,
                    "code": code
                },
                headers={"Accept": "application/json"}
            )
            token_data = token_response.json()
            access_token_github = token_data.get("access_token")
            
            if not access_token_github:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get access token from GitHub"
                )
            
            # Get user info from GitHub
            user_info_response = await client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"token {access_token_github}"}
            )
            user_info = user_info_response.json()
            
            # Get user email (may need separate call)
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"token {access_token_github}"}
            )
            emails = email_response.json()
            email = next((e["email"] for e in emails if e.get("primary")), emails[0]["email"] if emails else user_info.get("login"))
        
        # Get or create user
        user = get_or_create_user(
            db=db,
            email=email,
            name=user_info.get("name", user_info.get("login", email.split("@")[0])),
            provider=AuthProvider.GITHUB,
            provider_id=str(user_info["id"])
        )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        # Create redirect response
        redirect_response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/",
            status_code=status.HTTP_302_FOUND
        )
        
        # Set HTTP-only cookie
        redirect_response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/"
        )
        
        return redirect_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth error: {str(e)}"
        )


@router.get("/apple")
async def apple_oauth():
    """Initiate Apple OAuth flow"""
    # Apple OAuth requires more complex setup with JWT signing
    # This is a simplified version - full implementation would require
    # Apple's private key and proper JWT generation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth not yet implemented. Requires Apple Developer account setup."
    )


@router.get("/apple/callback")
async def apple_oauth_callback():
    """Handle Apple OAuth callback"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth not yet implemented"
    )

