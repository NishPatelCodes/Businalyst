"""
Django views for the backend project.

The main API is in backend.api.views. This module re-exports the upload endpoint
so existing URL config (path('upload/', views.upload_dataset)) continues to work.
"""

from backend.api.views import upload_dataset

__all__ = ["upload_dataset"]
