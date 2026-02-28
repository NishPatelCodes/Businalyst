"""
Chart components: line chart data, bar chart, pie chart, map data.
"""
import pandas as pd

from .utils.columns import (
    aggregate_sparkline,
    find_date_col,
    is_bar_chart_categorical,
    is_geography_column,
    is_good_categorical,
    is_payment_column,
    is_numeric_column,
)
from .utils.geo import coords_for_place

BAR_CHART_MAX_BARS = 7
PIE_MAX_SEGMENTS = 5


def linechart(df):
    """Revenue/profit/date series and optional orders sparkline for line chart."""
    required_cols = ["revenue", "profit", "date"]
    missing = [col for col in required_cols if col not in df.columns]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    date_series = df["date"].astype(str)
    out = {
        "revenue_data": df["revenue"].tolist(),
        "profit_data": df["profit"].tolist(),
        "date_data": date_series.tolist(),
    }
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce")
        orders_spark = aggregate_sparkline(df, value_col="orders", date_col="date")
        if orders_spark:
            out["orders_data"] = orders_spark
    return out


def bar_chart(df):
    """
    Pick a categorical column for bar chart; aggregate by profit (or revenue).
    Returns {"bar_column": str, "bar_data": [{"name": str, "value": float}, ...]} or None.
    """
    df = df.copy()
    value_col = "profit" if "profit" in df.columns else "revenue"
    if value_col not in df.columns:
        return None

    df[value_col] = pd.to_numeric(df[value_col], errors="coerce")
    bar_col = None

    for c in ["product name", "product_name", "productname"]:
        if c in df.columns and is_bar_chart_categorical(df, c):
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
            if c in df.columns and is_bar_chart_categorical(df, c):
                bar_col = c
                break

    if bar_col is None:
        for col in df.columns:
            if is_geography_column(col) or is_payment_column(col):
                continue
            if is_bar_chart_categorical(df, col):
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
    Pick a categorical column for pie chart; return value counts.
    Max PIE_MAX_SEGMENTS segments + "Other".
    """
    df = df.copy()
    best_col = None

    for candidate in ["category", "campaign"]:
        if candidate in df.columns and is_good_categorical(df, candidate):
            best_col = candidate
            break

    if best_col is None:
        cols_reversed = list(df.columns)[::-1]
        for col in cols_reversed:
            if is_geography_column(col) or is_payment_column(col):
                continue
            if is_good_categorical(df, col):
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


def map_data(df):
    """
    Pick a geographic column and return aggregated revenue (or profit) per value
    with [lng, lat] for map markers.
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
        coords = coords_for_place(name)
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
