"""
Chart data builders: line, bar, pie, map.
"""

import pandas as pd

from .utils import find_date_col
from .constants import (
    BAR_CHART_MAX_BARS,
    PIE_MAX_SEGMENTS,
    NUMERIC_OR_DATE_LIKE,
    REGION_COORDS,
    STATE_COORDS,
    COUNTRY_COORDS,
)
from . import utils as analytics_utils


def linechart(df):
    """
    Build line chart data: revenue_data, profit_data, date_data.
    """
    date_col = find_date_col(df)
    missing = []
    if date_col is None:
        missing.append("date")
    if "revenue" not in df.columns:
        missing.append("revenue")
    if "profit" not in df.columns:
        missing.append("profit")
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df = df.copy()
    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    date_series = df[date_col].astype(str)
    return {
        "revenue_data": df["revenue"].tolist(),
        "profit_data": df["profit"].tolist(),
        "date_data": date_series.tolist(),
    }


def bar_chart(df):
    """
    Pick a categorical column and aggregate by profit (or revenue).
    Returns {"bar_column": str, "bar_data": [{"name": str, "value": float}, ...]} or None.
    """
    df = df.copy()
    value_col = "profit" if "profit" in df.columns else "revenue"
    if value_col not in df.columns:
        return None

    df[value_col] = pd.to_numeric(df[value_col], errors="coerce")
    bar_col = None

    for c in ["product name", "product_name", "productname"]:
        if c in df.columns and analytics_utils.is_bar_chart_categorical(df, c):
            bar_col = c
            break

    if bar_col is None:
        fallbacks = [
            "category", "sub-category", "sub_category", "subcategory",
            "product id", "product_id", "productid",
            "customer name", "customer_name", "customername",
            "segment", "region", "sales_rep", "sales rep", "campaign",
        ]
        for c in fallbacks:
            if c in df.columns and analytics_utils.is_bar_chart_categorical(df, c):
                bar_col = c
                break

    if bar_col is None:
        for col in df.columns:
            if analytics_utils.is_geography_column(col) or analytics_utils.is_payment_column(col):
                continue
            if analytics_utils.is_bar_chart_categorical(df, col):
                bar_col = col
                break

    if bar_col is None:
        return None

    agg = df.groupby(df[bar_col].astype(str).str.strip(), dropna=True)[value_col].sum()
    agg = agg[agg.index.str.strip().str.lower() != "nan"]
    agg = agg.sort_values(ascending=False).head(BAR_CHART_MAX_BARS)

    if len(agg) < 2:
        return None

    bar_data = [{"name": str(n).strip(), "value": float(v)} for n, v in agg.items()]
    return {"bar_column": bar_col, "bar_data": bar_data}


def pie_chart_column(df):
    """
    Pick a categorical column for pie chart; return column name and value counts.
    Max PIE_MAX_SEGMENTS segments + "Other".
    """
    df = df.copy()
    best_col = None

    for candidate in ["category", "campaign"]:
        if candidate in df.columns and analytics_utils.is_good_categorical(df, candidate):
            best_col = candidate
            break

    if best_col is None:
        cols_reversed = list(df.columns)[::-1]
        for col in cols_reversed:
            if analytics_utils.is_geography_column(col) or analytics_utils.is_payment_column(col):
                continue
            if analytics_utils.is_good_categorical(df, col):
                best_col = col
                break

    if best_col is None:
        return None

    counts = df[best_col].dropna().astype(str).str.strip()
    counts = counts[counts != ""].value_counts()

    items = [{"name": str(label), "value": int(count)} for label, count in counts.items()]
    if len(items) > PIE_MAX_SEGMENTS:
        top = items[:PIE_MAX_SEGMENTS]
        other_sum = sum(d["value"] for d in items[PIE_MAX_SEGMENTS:])
        top.append({"name": "Other", "value": other_sum})
        pie_data = top
    else:
        pie_data = items

    return {"pie_column": best_col, "pie_data": pie_data}


def _coords_for_place(name):
    """Return [lng, lat] for a place name (state, region, or country)."""
    if not name or not isinstance(name, str):
        return None
    key = name.strip().lower()
    if not key or key in ("nan", ""):
        return None
    if key in STATE_COORDS:
        return STATE_COORDS[key]
    if key in REGION_COORDS:
        return REGION_COORDS[key]
    if key in COUNTRY_COORDS:
        return COUNTRY_COORDS[key]
    return None


def map_data(df):
    """
    Pick a geographic column (state, region, country) and return aggregated
    revenue (or profit) per value with [lng, lat] for map markers.
    """
    geo_col = None
    for col in ["state", "region", "country"]:
        if col in df.columns:
            geo_col = col
            break
    if geo_col is None:
        return None

    df = df.copy()
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
            continue
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
