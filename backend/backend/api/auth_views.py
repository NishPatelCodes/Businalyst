"""
Auth API: register, login (JWT), current-user profile.
"""

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    Create a new user account.
    Expects: { name, email, password }
    Returns: JWT access + refresh tokens.
    """
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password", "")
    name = (request.data.get("name") or "").strip()

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "An account with this email already exists."},
            status=status.HTTP_409_CONFLICT,
        )

    try:
        validate_password(password)
    except DjangoValidationError as e:
        return Response(
            {"error": " ".join(e.messages)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    username = email
    first_name = name.split()[0] if name else ""
    last_name = " ".join(name.split()[1:]) if name else ""

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.get_full_name() or user.username,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Authenticate with email + password.
    Returns: JWT access + refresh tokens + user info + has_dataset flag.
    """
    from django.contrib.auth import authenticate

    from backend.models import UserDataset

    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    has_dataset = UserDataset.objects.filter(user=user, is_active=True).exists()

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.get_full_name() or user.username,
            },
            "has_dataset": has_dataset,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """Return the authenticated user's profile + dataset metadata."""
    from backend.models import UserDataset

    user = request.user
    active_ds = UserDataset.objects.filter(user=user, is_active=True).first()
    dataset_info = None
    if active_ds:
        dataset_info = {
            "id": active_ds.id,
            "name": active_ds.name,
            "source_currency": active_ds.source_currency,
            "row_count": active_ds.row_count,
            "uploaded_at": active_ds.uploaded_at.isoformat(),
        }

    return Response(
        {
            "id": user.id,
            "email": user.email,
            "name": user.get_full_name() or user.username,
            "has_dataset": active_ds is not None,
            "dataset": dataset_info,
        }
    )
