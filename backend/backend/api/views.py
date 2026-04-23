"""
Upload API: single endpoint that accepts a file and returns analytics JSON.
"""

import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from backend.analytics import read_uploaded_file
from backend.analytics.pipeline import build_analytics_payload

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def upload_dataset(request):
    """
    POST with multipart/form-data: "file" (CSV or Excel), optional "start_date" and "end_date".
    When start_date/end_date are provided, KPIs and all charts use only rows in that date range.
    """
    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    start_date = request.POST.get("start_date") or request.GET.get("start_date") or None
    end_date = request.POST.get("end_date") or request.GET.get("end_date") or None
    if start_date and isinstance(start_date, str):
        start_date = start_date.strip() or None
    if end_date and isinstance(end_date, str):
        end_date = end_date.strip() or None

    try:
        df = read_uploaded_file(file)
        payload, _ = build_analytics_payload(df, start_date, end_date)
        return JsonResponse(payload)

    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        logger.exception("Upload processing failed")
        return JsonResponse({"error": str(e)}, status=500)
