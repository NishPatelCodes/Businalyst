from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from backend.api.auth_views import register, login, me
from backend.api.dataset_views import (
    upload_dataset,
    get_active_dataset,
    dataset_history,
    activate_dataset,
    delete_dataset,
)
from backend.api.waitlist_views import join_waitlist

urlpatterns = [
    path("admin/", admin.site.urls),

    # Public waitlist
    path("api/waitlist/", join_waitlist, name="waitlist-join"),

    # Auth
    path("api/auth/register/", register, name="auth-register"),
    path("api/auth/login/", login, name="auth-login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("api/auth/me/", me, name="auth-me"),

    # Dataset (authenticated)
    path("api/upload/", upload_dataset, name="dataset-upload"),
    path("api/dataset/", get_active_dataset, name="dataset-active"),
    path("api/datasets/", dataset_history, name="dataset-history"),
    path("api/datasets/<int:dataset_id>/activate/", activate_dataset, name="dataset-activate"),
    path("api/datasets/<int:dataset_id>/", delete_dataset, name="dataset-delete"),
]
