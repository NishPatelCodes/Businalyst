import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


# 1️⃣ Function: read uploaded CSV/Excel and return DataFrame
def read_uploaded_file(file):
    filename = file.name.lower()

    if filename.endswith(".csv"):
        df = pd.read_csv(file)
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(file)
    else:
        raise ValueError("Unsupported file type")

    # Normalize column names
    df.columns = df.columns.str.lower().str.strip()

    return df


# 2️⃣ Function: calculate profit/revenue/orders sums
def calculate_kpis(df):
    required_cols = ["profit", "revenue", "orders", "expense"]
    missing = [col for col in required_cols if col not in df.columns]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
    df["orders"] = pd.to_numeric(df["orders"], errors="coerce")
    df["expense"] = pd.to_numeric(df["expense"], errors="coerce")
    

    return {
        "profit_sum": float(df["profit"].sum(skipna=True)),
        "revenue_sum": float(df["revenue"].sum(skipna=True)),
        "orders_sum": float(df["orders"].sum(skipna=True)),
        "expense_sum": float(df["expense"].sum(skipna=True)),
        "customers_sum": df.shape[0],
    }

def linechart(df):
    required_cols = ["revenue", "profit", "date"]
    missing = [col for col in required_cols if col not in df.columns]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    # Ensure dates are JSON-serializable strings
    date_series = df["date"].astype(str)
    return {
        "revenue_data": df["revenue"].tolist(),
        "profit_data": df["profit"].tolist(),
        "date_data": date_series.tolist(),
    }
    






# 3️⃣ Django view: API endpoint
@csrf_exempt
def upload_dataset(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    try:
        df = read_uploaded_file(file)
        kpis = calculate_kpis(df)
        payload = {"message": "File processed successfully", **kpis}
        try:
            chart = linechart(df)
            payload["revenue_data"] = chart["revenue_data"]
            payload["profit_data"] = chart["profit_data"]
            payload["date_data"] = chart["date_data"]
        except ValueError:
            pass  # file has no date column; skip chart data
        return JsonResponse(payload)

    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
