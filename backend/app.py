"""
Minimal FastAPI application for deployment testing.
This is a placeholder - replace with your actual application code later.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Businalyst API",
    description="Businalyst Backend API",
    version="1.0.0"
)

# Configure CORS - Update allowed_origins with your frontend URL in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

