"""
Rate limiting utilities
"""
from functools import wraps
from fastapi import HTTPException, status
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple

# Simple in-memory rate limiter (for production, use Redis)
rate_limit_store: Dict[str, Tuple[int, datetime]] = defaultdict(lambda: (0, datetime.utcnow()))


def rate_limit(max_requests: int = 5, window_seconds: int = 60):
    """
    Simple rate limiter decorator
    In production, use Redis or a dedicated rate limiting service
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get client identifier (IP address or user ID)
            request = kwargs.get('request') or args[0] if args else None
            if request:
                client_id = request.client.host if hasattr(request, 'client') else 'unknown'
            else:
                client_id = 'unknown'
            
            # Clean old entries
            current_time = datetime.utcnow()
            for key in list(rate_limit_store.keys()):
                count, last_reset = rate_limit_store[key]
                if (current_time - last_reset).total_seconds() > window_seconds:
                    del rate_limit_store[key]
            
            # Check rate limit
            count, last_reset = rate_limit_store[client_id]
            if (current_time - last_reset).total_seconds() > window_seconds:
                # Reset window
                rate_limit_store[client_id] = (1, current_time)
            elif count >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {max_requests} requests per {window_seconds} seconds."
                )
            else:
                rate_limit_store[client_id] = (count + 1, last_reset)
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

