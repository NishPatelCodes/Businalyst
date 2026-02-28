"""Upload app URL configuration."""
from django.urls import path

from . import views

urlpatterns = [
    path("upload/", views.upload_dataset, name="upload"),
]
