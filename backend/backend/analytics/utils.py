"""
Shared utilities: column detection, JSON serialization, type checks.
"""

import pandas as pd

from .constants import (
    NUMERIC_OR_DATE_LIKE,
    GEOGRAPHY_KEYWORDS,
    PAYMENT_KEYWORDS,
)


def filter_df_by_date(df, start_date=None, end_date=None, date_column=None):
    """
    Filter DataFrame to rows within the optional date range (inclusive).
    Returns a copy. If date_column is None, uses find_date_col(df).
    """
    if start_date is None and end_date is None:
        return df.copy()
    date_col = date_column if (date_column and date_column in df.columns) else find_date_col(df)
    if date_col is None:
        return df.copy()
    df = df.copy()
    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    if start_date is not None:
        df = df[df[date_col] >= pd.to_datetime(start_date)]
    if end_date is not None:
        df = df[df[date_col] <= pd.to_datetime(end_date)]
    return df


def find_date_col(df):
    """Return the first date-like column name found in df (columns already lowercased)."""
    priority = [
        "date", "order date", "order_date", "orderdate",
        "ship date", "ship_date", "transaction date",
    ]
    for c in priority:
        if c in df.columns:
            return c
    for c in df.columns:
        if "date" in c:
            return c
    return None


def to_json_value(val):
    """Convert a pandas/cell value to a JSON-serializable value."""
    if pd.isna(val):
        return None
    if hasattr(val, "item"):
        return val.item()
    if isinstance(val, pd.Timestamp):
        return str(val)
    if isinstance(val, float):
        return float(val)
    if isinstance(val, int):
        return int(val)
    return str(val)


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
    return numeric_parsed.notna().mean() >= 0.8


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
    """True if col looks like a good categorical for a pie chart (text categories only)."""
    if col in NUMERIC_OR_DATE_LIKE:
        return False
    if "date" in col.lower():
        return False
    if is_numeric_column(df, col):
        return False
    s = df[col].dropna().astype(str).str.strip()
    s = s[s != ""]
    n = s.nunique()
    return min_categories <= n <= max_categories


def dataframe_to_rows(df, columns=None):
    """Convert DataFrame to list of dicts with JSON-serializable values."""
    columns = columns or list(df.columns)
    rows = []
    for _, row in df.iterrows():
        rows.append({col: to_json_value(row[col]) for col in columns})
    return rows
