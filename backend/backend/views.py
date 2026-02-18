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
    
def _to_json_value(val):
    """Convert a pandas/cell value to a JSON-serializable value."""
    if pd.isna(val):
        return None
    if hasattr(val, "item"):
        return val.item()
    if isinstance(val, (pd.Timestamp,)):
        return str(val)
    if isinstance(val, (float,)):
        return float(val)
    if isinstance(val, (int,)):
        return int(val)
    return str(val)


def table_component(df):
    if "profit" not in df.columns:
        raise ValueError("Missing column: profit")
    df = df.copy()
    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    df_sorted = df.sort_values(by="profit", ascending=False).reset_index(drop=True).head(5)
    columns = list(df_sorted.columns)

    rows = []
    for _, row in df_sorted.iterrows():
        rows.append({col: _to_json_value(row[col]) for col in columns})
    return {"top5_profit": rows, "top5_columns": columns}


# Columns we treat as numeric / not categorical for pie
_NUMERIC_OR_DATE_LIKE = {"profit", "revenue", "orders", "expense", "order date", "date"}


def _is_numeric_column(df, col):
    """True if the column is numeric dtype or its values are mostly numeric when parsed."""
    if pd.api.types.is_numeric_dtype(df[col]):
        return True
    s = df[col].dropna().astype(str).str.strip()
    s = s[s != ""]
    if len(s) == 0:
        return True
    numeric_parsed = pd.to_numeric(s, errors="coerce")
    # If most non-null values are valid numbers, treat as numeric
    pct_numeric = numeric_parsed.notna().mean()
    return pct_numeric >= 0.8


def _is_good_categorical(df, col, min_categories=2, max_categories=50):
    """Return True if col looks like a good categorical for a pie chart (text categories only)."""
    if col in _NUMERIC_OR_DATE_LIKE:
        return False
    if "date" in col.lower():
        return False
    if _is_numeric_column(df, col):
        return False
    s = df[col].dropna().astype(str).str.strip()
    s = s[s != ""]
    n = s.nunique()
    if n < min_categories or n > max_categories:
        return False
    return True


# Max segments to show in the pie (top N by count; rest merged into "Other")
PIE_MAX_SEGMENTS = 5


def pie_chart_column(df):
    """
    Pick a good categorical column for a pie chart: 2–50 categories, not numeric/date.
    Returns column name and value counts. If column has more than PIE_MAX_SEGMENTS
    categories, returns top PIE_MAX_SEGMENTS by count plus "Other".
    """
    df = df.copy()
    best_col = None
    best_n = 0

    for col in df.columns:
        if not _is_good_categorical(df, col):
            continue
        n = df[col].dropna().astype(str).str.strip().replace("", pd.NA).dropna().nunique()
        if min(best_n, n) == 0 or n > best_n:
            best_col = col
            best_n = n

    if best_col is None:
        return None

    counts = df[best_col].dropna().astype(str).str.strip()
    counts = counts[counts != ""].value_counts()

    # Build full list; if more than PIE_MAX_SEGMENTS, keep top PIE_MAX_SEGMENTS and add "Other"
    items = [{"name": str(label), "value": int(count)} for label, count in counts.items()]
    if len(items) > PIE_MAX_SEGMENTS:
        top = items[:PIE_MAX_SEGMENTS]
        other_sum = sum(d["value"] for d in items[PIE_MAX_SEGMENTS:])
        top.append({"name": "Other", "value": other_sum})
        pie_data = top
    else:
        pie_data = items

    return {"pie_column": best_col, "pie_data": pie_data}

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
        except Exception:
            pass
        try:
            table = table_component(df)
            payload["top5_profit"] = table["top5_profit"]
            payload["top5_columns"] = table["top5_columns"]
        except Exception:
            pass
        try:
            pie = pie_chart_column(df)
            if pie:
                payload["pie_column"] = pie["pie_column"]
                payload["pie_data"] = pie["pie_data"]
        except Exception:
            pass
        return JsonResponse(payload)

    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
