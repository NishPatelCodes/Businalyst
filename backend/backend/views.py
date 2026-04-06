"""
Django views for the backend project.

The main API is in backend.api. This module re-exports the legacy upload endpoint
so the old URL config (path('upload/', views.upload_dataset)) continues to work.
"""

from backend.api.views import upload_dataset

__all__ = ["upload_dataset"]
