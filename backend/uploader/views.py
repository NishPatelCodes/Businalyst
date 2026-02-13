from django.shortcuts import render
from django.http import JsonResponse
import pandas as pd
from django.views.decorators.csrf import csrf_exempt


# Create your views here.
@csrf_exempt   # ← only for development/testing — remove in production!
def upload_file(request):
    if request.method == 'POST':
        if 'file' not in request.FILES:
            return JsonResponse({"error": "No file uploaded"}, status=400)
        
        uploaded_file = request.FILES['file']
        
        result = {
                "message": "File received!"
            }
        
        return JsonResponse(result)
        
    # Allow GET so /upload/ URL works when visited in browser (e.g. for testing)
    if request.method == 'GET':
        return JsonResponse({
            "message": "Upload API ready. Use POST with form field 'file' to upload CSV or Excel.",
            "allowed_methods": ["POST"],
        })

    return JsonResponse({"error": "Only GET or POST allowed"}, status=405)


