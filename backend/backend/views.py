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

# Geography and payment columns to exclude when picking pie column from right side
_GEOGRAPHY_KEYWORDS = {"region", "country", "state", "city", "postal", "address", "location", "latitude", "longitude", "lat", "lng"}
_PAYMENT_KEYWORDS = {"payment", "method", "pay_type", "pay type", "billing", "card"}


def _is_geography_column(col):
    """True if column appears to be geography-related."""
    key = col.lower().strip()
    return any(kw in key for kw in _GEOGRAPHY_KEYWORDS)


def _is_payment_column(col):
    """True if column appears to be payment-method related."""
    key = col.lower().strip()
    return any(kw in key for kw in _PAYMENT_KEYWORDS)


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
    Pick a categorical column for pie chart:
    1. If "category" exists and is good categorical, use it.
    2. Else if "campaign" exists and is good categorical, use it.
    3. Else scan columns from right (last) to left, use first good categorical
       excluding geography-related and payment-method columns.
    Returns column name and value counts. Max PIE_MAX_SEGMENTS segments + "Other".
    """
    df = df.copy()
    best_col = None

    # 1. Prefer "category"
    for candidate in ["category", "campaign"]:
        if candidate in df.columns and _is_good_categorical(df, candidate):
            best_col = candidate
            break

    # 2. Fallback: scan from right (last column) to left
    if best_col is None:
        cols_reversed = list(df.columns)[::-1]
        for col in cols_reversed:
            if _is_geography_column(col) or _is_payment_column(col):
                continue
            if _is_good_categorical(df, col):
                best_col = col
                break

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


# ---------- Map: [lng, lat] for geographic columns (lowercase key) ----------
# US regions (Superstore-style)
_REGION_COORDS = {
    "south": [-86.9, 32.4],
    "west": [-119.4, 36.8],
    "east": [-75.5, 43.0],
    "central": [-98.0, 39.5],
    "northeast": [-74.0, 41.5],
    "southeast": [-84.4, 33.7],
    "north": [-98.0, 47.5],
    "midwest": [-93.1, 42.0],
    "northwest": [-120.7, 47.0],
    "southwest": [-111.0, 34.0],
}
# US states – approximate center [lng, lat] for map markers
_STATE_COORDS = {
    "alabama": [-86.9, 32.4], "alaska": [-153.5, 64.8], "arizona": [-111.4, 34.3],
    "arkansas": [-92.4, 34.9], "california": [-119.4, 36.8], "colorado": [-105.3, 38.9],
    "connecticut": [-72.8, 41.6], "delaware": [-75.5, 38.9], "florida": [-81.5, 27.7],
    "georgia": [-83.6, 32.2], "hawaii": [-155.6, 19.7], "idaho": [-114.4, 44.4],
    "illinois": [-89.2, 40.0], "indiana": [-86.1, 40.3], "iowa": [-93.1, 42.0],
    "kansas": [-98.5, 38.5], "kentucky": [-84.3, 37.7], "louisiana": [-91.9, 31.2],
    "maine": [-69.4, 45.4], "maryland": [-76.6, 39.0], "massachusetts": [-71.4, 42.4],
    "michigan": [-84.5, 43.3], "minnesota": [-94.7, 46.3], "mississippi": [-89.6, 32.7],
    "missouri": [-91.8, 37.9], "montana": [-110.4, 47.0], "nebraska": [-99.9, 41.1],
    "nevada": [-116.4, 39.3], "new hampshire": [-71.6, 43.2], "new jersey": [-74.4, 40.2],
    "new mexico": [-105.8, 34.5], "new york": [-75.5, 43.0], "north carolina": [-79.0, 35.5],
    "north dakota": [-100.4, 47.5], "ohio": [-82.9, 40.4], "oklahoma": [-97.5, 35.5],
    "oregon": [-120.6, 43.9], "pennsylvania": [-77.2, 40.9], "rhode island": [-71.5, 41.6],
    "south carolina": [-81.2, 33.8], "south dakota": [-99.9, 44.4], "tennessee": [-86.6, 35.8],
    "texas": [-99.2, 31.4], "utah": [-111.6, 39.3], "vermont": [-72.6, 44.1],
    "virginia": [-78.7, 37.5], "washington": [-120.7, 47.0], "west virginia": [-80.5, 38.6],
    "wisconsin": [-89.6, 44.3], "wyoming": [-107.6, 43.0], "district of columbia": [-77.0, 38.9],
    "washington d.c.": [-77.0, 38.9], "dc": [-77.0, 38.9],
}
# Countries
_COUNTRY_COORDS = {
    "united states": [-98.0, 38.0], "usa": [-98.0, 38.0], "canada": [-106.3, 56.1],
    "united kingdom": [-2.6, 54.5], "uk": [-2.6, 54.5], "germany": [10.5, 51.2],
    "france": [2.2, 46.2], "australia": [133.8, -25.3], "india": [78.0, 21.0],
    "china": [105.2, 35.9], "japan": [138.3, 36.2], "brazil": [-55.0, -10.8],
    "mexico": [-102.6, 23.6], "spain": [-3.7, 40.4], "italy": [12.6, 42.8],
    "netherlands": [5.3, 52.1], "russia": [105.3, 61.5], "south korea": [127.8, 36.4],
}


def _coords_for_place(name):
    """Return [lng, lat] for a place name (state, region, or country). Normalize to lowercase key."""
    if not name or not isinstance(name, str):
        return None
    key = name.strip().lower()
    if not key or key in ("nan", ""):
        return None
    if key in _STATE_COORDS:
        return _STATE_COORDS[key]
    if key in _REGION_COORDS:
        return _REGION_COORDS[key]
    if key in _COUNTRY_COORDS:
        return _COUNTRY_COORDS[key]
    return None


def map_data(df):
    """
    Pick a geographic column (state, region, country) and return aggregated
    revenue (or profit) per value with correct [lng, lat] for map markers.
    Prefer state for granularity, then region, then country.
    """
    df = df.copy()
    geo_col = None
    for col in ["state", "region", "country"]:
        if col in df.columns:
            geo_col = col
            break
    if geo_col is None:
        return None

    value_col = "revenue" if "revenue" in df.columns else "profit"
    if value_col not in df.columns:
        return None
    df[value_col] = pd.to_numeric(df[value_col], errors="coerce")
    agg = df.groupby(df[geo_col].astype(str).str.strip(), dropna=True)[value_col].sum()

    out = []
    for name, value in agg.items():
        if not name or str(name).strip().lower() in ("nan", ""):
            continue
        coords = _coords_for_place(name)
        if coords is None:
            continue  # skip places we can't map (no random positions)
        out.append({
            "name": str(name).strip(),
            "value": float(value),
            "coordinates": list(coords),
        })

    out.sort(key=lambda x: x["value"], reverse=True)
    out = out[:15]
    if not out:
        return None
    return {"map_column": geo_col, "map_data": out}


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
        try:
            map_result = map_data(df)
            if map_result:
                payload["map_column"] = map_result["map_column"]
                payload["map_data"] = map_result["map_data"]
        except Exception:
            pass
        return JsonResponse(payload)

    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
