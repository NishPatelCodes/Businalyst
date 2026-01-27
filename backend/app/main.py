"""
FastAPI application main file
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, oauth
from app.middleware.security import SecurityHeadersMiddleware, RateLimitMiddleware

# Create database tables (in production, use Alembic migrations)
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Businalyst API",
    description="Businalyst Backend API",
    version="1.0.0"
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add rate limiting middleware (only for auth endpoints in production)
# app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + [settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(oauth.router)


@app.get("/")
async def root():
    """Root endpoint - basic health check"""
    return {
        "message": "Businalyst API is running",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment platforms"""
    return {
        "status": "healthy",
        "service": "Businalyst API"
    }

