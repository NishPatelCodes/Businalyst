"""
Auth API: register, login (JWT), current-user profile.
"""

from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


def _user_payload(user):
    return {
        "id": user.id,
        "email": user.email,
        "name": user.get_full_name() or user.username,
    }


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
            "user": _user_payload(user),
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
            "user": _user_payload(user),
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
            **_user_payload(user),
            "has_dataset": active_ds is not None,
            "dataset": dataset_info,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update the authenticated user's profile fields."""
    user = request.user
    name = request.data.get("name")
    email = request.data.get("email")

    if name is not None:
        normalized_name = str(name).strip()
        if normalized_name:
            parts = normalized_name.split()
            user.first_name = parts[0]
            user.last_name = " ".join(parts[1:])
        else:
            user.first_name = ""
            user.last_name = ""

    if email is not None:
        normalized_email = str(email).strip().lower()
        if not normalized_email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if (
            User.objects.filter(email=normalized_email)
            .exclude(pk=user.pk)
            .exists()
        ):
            return Response(
                {"error": "An account with this email already exists."},
                status=status.HTTP_409_CONFLICT,
            )
        user.email = normalized_email
        # Username remains email in this app's auth flow.
        user.username = normalized_email

    user.save(update_fields=["first_name", "last_name", "email", "username"])
    return Response({"user": _user_payload(user)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password for the authenticated user."""
    user = request.user
    current_password = request.data.get("current_password", "")
    new_password = request.data.get("new_password", "")

    if not current_password or not new_password:
        return Response(
            {"error": "Current password and new password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as e:
        return Response(
            {"error": " ".join(e.messages)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save(update_fields=["password"])
    update_session_auth_hash(request, user)
    return Response({"detail": "Password changed successfully."})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """Delete the authenticated user account."""
    from backend.models import UserDataset

    user = request.user
    for dataset in UserDataset.objects.filter(user=user):
        if dataset.csv_file:
            dataset.csv_file.delete(save=False)
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
