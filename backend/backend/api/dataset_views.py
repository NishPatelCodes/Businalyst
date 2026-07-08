"""
Dataset API: authenticated upload, retrieve saved analytics, delete dataset.
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from backend.analytics import read_uploaded_file
from backend.analytics.pipeline import (
    build_analytics_payload,
    trim_payload_for_scope,
    SCOPE_FULL,
    SCOPE_BOOTSTRAP,
)
from backend.models import UserDataset

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_dataset(request):
    """
    Authenticated CSV/Excel upload.
    Processes the file, stores analytics JSON in DB tied to the user,
    and returns the analytics payload immediately.
    """
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    start_date = request.POST.get("start_date") or request.GET.get("start_date") or None
    end_date = request.POST.get("end_date") or request.GET.get("end_date") or None
    scope = request.POST.get("scope") or request.GET.get("scope") or SCOPE_FULL
    if start_date and isinstance(start_date, str):
        start_date = start_date.strip() or None
    if end_date and isinstance(end_date, str):
        end_date = end_date.strip() or None

    try:
        df = read_uploaded_file(file)
        payload, row_count = build_analytics_payload(df, start_date, end_date, scope=SCOPE_FULL)

        file.seek(0)
        dataset = UserDataset(
            user=request.user,
            name=file.name,
            source_currency=payload.get("source_currency", "USD"),
            analytics_json=payload,
            row_count=row_count,
            is_active=True,
        )
        dataset.csv_file.save(file.name, file, save=False)
        dataset.save()

        payload["dataset_id"] = dataset.id
        payload["dataset_name"] = dataset.name
        payload["uploaded_at"] = dataset.uploaded_at.isoformat()
        response_payload = trim_payload_for_scope(payload, scope)
        return Response(response_payload, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Upload processing failed")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_active_dataset(request):
    """Return the user's currently active dataset analytics (auto-load on login)."""
    scope = request.GET.get("scope") or SCOPE_FULL
    if scope not in {SCOPE_FULL, SCOPE_BOOTSTRAP}:
        scope = SCOPE_FULL
    dataset = UserDataset.objects.filter(user=request.user, is_active=True).first()
    if not dataset:
        return Response({"has_dataset": False}, status=status.HTTP_200_OK)

    payload = trim_payload_for_scope(dataset.analytics_json or {}, scope)
    payload["has_dataset"] = True
    payload["dataset_id"] = dataset.id
    payload["dataset_name"] = dataset.name
    payload["source_currency"] = dataset.source_currency
    payload["uploaded_at"] = dataset.uploaded_at.isoformat()
    return Response(payload)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dataset_history(request):
    """Return a list of all datasets uploaded by this user."""
    datasets = UserDataset.objects.filter(user=request.user).values(
        "id", "name", "source_currency", "row_count", "is_active", "uploaded_at"
    )
    return Response({"datasets": list(datasets)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def activate_dataset(request, dataset_id):
    """Switch the user's active dataset."""
    try:
        dataset = UserDataset.objects.get(id=dataset_id, user=request.user)
    except UserDataset.DoesNotExist:
        return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

    dataset.is_active = True
    dataset.save()
    payload = dataset.analytics_json or {}
    payload["dataset_id"] = dataset.id
    payload["dataset_name"] = dataset.name
    payload["source_currency"] = dataset.source_currency
    payload["uploaded_at"] = dataset.uploaded_at.isoformat()
    return Response(payload)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_dataset(request, dataset_id):
    """Delete a specific dataset."""
    try:
        dataset = UserDataset.objects.get(id=dataset_id, user=request.user)
    except UserDataset.DoesNotExist:
        return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

    if dataset.csv_file:
        dataset.csv_file.delete(save=False)
    dataset.delete()
    return Response({"message": "Dataset deleted"}, status=status.HTTP_200_OK)
