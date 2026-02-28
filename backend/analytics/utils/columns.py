"""
Column detection and aggregation helpers for analytics.
"""
import pandas as pd

# Columns we treat as numeric / not categorical for pie
NUMERIC_OR_DATE_LIKE = {"profit", "revenue", "orders", "expense", "order date", "date"}

# Geography and payment columns to exclude when picking pie column from right side
GEOGRAPHY_KEYWORDS = {"region", "country", "state", "city", "postal", "address", "location", "latitude", "longitude", "lat", "lng"}
PAYMENT_KEYWORDS = {"payment", "method", "pay_type", "pay type", "billing", "card"}


def find_date_col(df):
    """Return the first date-like column name found in df (already lowercased)."""
    priority = ["date", "order date", "order_date", "orderdate", "ship date", "ship_date", "transaction date"]
    for c in priority:
        if c in df.columns:
            return c
    for c in df.columns:
        if "date" in c:
            return c
    return None


def aggregate_sparkline(df, value_col, date_col=None):
    """
    Aggregate value_col by calendar month. Returns a list of floats (monthly sums)
    suitable for a sparkline, or None if not enough data.
    """
    df = df.copy()
    if date_col is None or date_col not in df.columns:
        date_col = find_date_col(df)
    if date_col is None or date_col not in df.columns:
        return None
    df[value_col] = pd.to_numeric(df[value_col], errors="coerce")
    df["_date"] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
    df = df.dropna(subset=["_date", value_col])
    if len(df) == 0:
        return None
    df["_period"] = df["_date"].dt.to_period("M")
    monthly = df.groupby("_period")[value_col].sum().sort_index()
    if len(monthly) < 2:
        return None
    return [float(v) for v in monthly.values]


def find_column_by_keywords(df, keywords):
    """Return first column name that contains any of the keywords (lowercase)."""
    cols_lower = {c.lower(): c for c in df.columns}
    for kw in keywords:
        for col_lower, col in cols_lower.items():
            if kw in col_lower:
                return col
    return None


def is_geography_column(col):
    """True if column appears to be geography-related."""
    key = col.lower().strip()
    return any(kw in key for kw in GEOGRAPHY_KEYWORDS)


def is_payment_column(col):
    """True if column appears to be payment-method related."""
    key = col.lower().strip()
    return any(kw in key for kw in PAYMENT_KEYWORDS)


def is_numeric_column(df, col):
    """True if the column is numeric dtype or its values are mostly numeric when parsed."""
    if pd.api.types.is_numeric_dtype(df[col]):
        return True
    s = df[col].dropna().astype(str).str.strip()
    s = s[s != ""]
    if len(s) == 0:
        return True
    numeric_parsed = pd.to_numeric(s, errors="coerce")
    pct_numeric = numeric_parsed.notna().mean()
    return pct_numeric >= 0.8


def is_bar_chart_categorical(df, col):
    """True if col is suitable for bar chart: categorical, not numeric, not date."""
    if col in NUMERIC_OR_DATE_LIKE:
        return False
    if "date" in col.lower():
        return False
    if is_numeric_column(df, col):
        return False
    s = df[col].dropna().astype(str).str.strip()
    s = s[s != ""]
    if s.nunique() < 2:
        return False
    return True


def is_good_categorical(df, col, min_categories=2, max_categories=50):
    """Return True if col looks like a good categorical for a pie chart (text categories only)."""
    if col in NUMERIC_OR_DATE_LIKE:
        return False
    if "date" in col.lower():
        return False
    if is_numeric_column(df, col):
        return False
    s = df[col].dropna().astype(str).str.strip()
    s = s[s != ""]
    n = s.nunique()
    if n < min_categories or n > max_categories:
        return False
    return True
