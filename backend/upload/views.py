"""
Upload API: single endpoint that accepts a file and returns dashboard payload.
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .services.file_reader import read_uploaded_file
from .services.pipeline import build_payload


@csrf_exempt
def upload_dataset(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    try:
        df = read_uploaded_file(file)
        payload = build_payload(df)
        return JsonResponse(payload)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
