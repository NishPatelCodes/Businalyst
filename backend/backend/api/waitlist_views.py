"""
Public waitlist signup endpoint for the Coming Soon page.
"""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import IntegrityError

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from backend.models import WaitlistEmail


@api_view(["POST"])
@permission_classes([AllowAny])
def join_waitlist(request):
    """
    Add an email to the launch waitlist.
    Expects: { email }
    """
    email = (request.data.get("email") or "").strip().lower()

    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_email(email)
    except DjangoValidationError:
        return Response(
            {"error": "Please enter a valid email address."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        WaitlistEmail.objects.get_or_create(email=email)
    except IntegrityError:
        pass  # already on the list — treat as success

    return Response({"message": "You're on the list."}, status=status.HTTP_201_CREATED)
