"""
Security middleware for CSRF protection and security headers
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Only add HSTS in production (HTTPS)
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}  # In production, use Redis
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Clean old entries
        current_time = time.time()
        self.requests = {
            ip: timestamps
            for ip, timestamps in self.requests.items()
            if any(current_time - ts < self.window_seconds for ts in timestamps)
        }
        
        # Check rate limit
        if client_ip in self.requests:
            # Remove old timestamps
            self.requests[client_ip] = [
                ts for ts in self.requests[client_ip]
                if current_time - ts < self.window_seconds
            ]
            
            if len(self.requests[client_ip]) >= self.max_requests:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded"}
                )
        
        # Add current request
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        self.requests[client_ip].append(current_time)
        
        response = await call_next(request)
        return response

