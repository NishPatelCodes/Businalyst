"""
Minimal FastAPI application for deployment
"""
from fastapi import FastAPI

app = FastAPI(
    title="Businalyst API",
    description="Businalyst Backend API",
    version="1.0.0"
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Businalyst API is running",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Businalyst API"
    }
