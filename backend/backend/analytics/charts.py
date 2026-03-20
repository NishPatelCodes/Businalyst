"""
Chart data builders: line, bar, pie, map, comparison, multiline, top-products, map-orders.
"""

import pandas as pd

from .utils import find_date_col, find_column_by_keywords
from .constants import (
    PIE_MAX_SEGMENTS,
    REGION_COORDS,
    STATE_COORDS,
    COUNTRY_COORDS,
)
from . import utils as analytics_utils

# Maximum products returned by top_products_by_revenue_chart
TOP_PRODUCTS_MAX = 6


def _find_product_col(df):
    """Return the first product/category column found in df."""
    for c in ("product name", "product_name", "productname", "product"):
        if c in df.columns:
            return c
    for c in ("category", "sub-category", "sub_category"):
        if c in df.columns:
            return c
    return None


def linechart(df):
    """
    Build line chart data: revenue_data, profit_data, date_data,
    and optionally product_data (per-row product name for client-side
    composition filtering by date range).
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
    # Orders are optional for the line chart (used by some client-side comparisons).
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce").fillna(0)
    date_series = df[date_col].astype(str)

    result = {
        "revenue_data": df["revenue"].tolist(),
        "profit_data": df["profit"].tolist(),
        "date_data": date_series.tolist(),
    }

    product_col = _find_product_col(df)
    if product_col is not None:
        result["product_data"] = df[product_col].astype(str).str.strip().tolist()

    if "orders" in df.columns:
        result["orders_data"] = df["orders"].tolist()

    return result


# ---------------------------------------------------------------------------
# Comparing Bar Chart — Current vs Previous Period Sales
# ---------------------------------------------------------------------------

def _find_sales_col(df):
    """Return the best column representing sales/revenue values."""
    for c in ("revenue", "sales", "amount", "total", "net_sales", "net sales"):
        if c in df.columns:
            return c
    return None


def _find_dimension_col(df):
    """Return the best grouping dimension: product > category > location."""
    for c in ("product name", "product_name", "productname", "product"):
        if c in df.columns:
            return c
    for c in ("category", "sub-category", "sub_category", "subcategory"):
        if c in df.columns:
            return c
    for c in ("region", "state", "country", "location", "city"):
        if c in df.columns:
            return c
    # Fallback: first bar-chart-suitable column
    for col in df.columns:
        if analytics_utils.is_bar_chart_categorical(df, col):
            return col
    return None


def comparison_bar_chart(df):
    """
    Compare total sales between two equal-length consecutive time periods.

    The dataset's date range is split into two halves:
      - Previous period: first half (chronologically)
      - Current period:  second half

    Groups by the best available dimension (product / category / location).

    Returns:
        {
          "comparison_bar_labels":   [str, ...],
          "comparison_bar_current":  [float, ...],
          "comparison_bar_previous": [float, ...],   # only when has_previous=True
          "comparison_bar_has_previous": bool,
        }
    or None if required columns are missing.
    """
    date_col = find_date_col(df)
    if date_col is None:
        return {"error": "Date column missing or not detected"}

    sales_col = _find_sales_col(df)
    if sales_col is None:
        return {"error": "Sales / revenue column missing or not detected"}

    dim_col = _find_dimension_col(df)
    if dim_col is None:
        return {"error": "No suitable grouping dimension (product / category / location) found"}

    df = df.copy()
    df["_dt"] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
    df[sales_col] = pd.to_numeric(df[sales_col], errors="coerce")
    df[dim_col] = df[dim_col].astype(str).str.strip()

    # Drop rows with invalid dates, null/NaN dimension, or non-positive sales
    df = df.dropna(subset=["_dt", sales_col])
    df = df[df[dim_col].str.lower() != "nan"]
    df = df[df[sales_col] > 0]

    if df.empty:
        return {"error": "No valid rows after cleaning"}

    date_min = df["_dt"].min()
    date_max = df["_dt"].max()
    mid_point = date_min + (date_max - date_min) / 2

    current_df = df[df["_dt"] > mid_point]
    previous_df = df[df["_dt"] <= mid_point]

    current_agg = (
        current_df.groupby(dim_col)[sales_col]
        .sum()
        .sort_index()
    )
    has_previous = not previous_df.empty

    # Build label union from current (and previous if available)
    if has_previous:
        previous_agg = (
            previous_df.groupby(dim_col)[sales_col]
            .sum()
            .sort_index()
        )
        all_labels = sorted(set(current_agg.index) | set(previous_agg.index))
    else:
        all_labels = sorted(current_agg.index.tolist())

    current_values = [float(current_agg.get(label, 0.0)) for label in all_labels]

    result = {
        "comparison_bar_labels": all_labels,
        "comparison_bar_current": current_values,
        "comparison_bar_has_previous": has_previous,
    }

    if has_previous:
        previous_values = [float(previous_agg.get(label, 0.0)) for label in all_labels]
        # Never return previous period if all values are zero (no real data)
        if any(v > 0 for v in previous_values):
            result["comparison_bar_previous"] = previous_values
        else:
            result["comparison_bar_has_previous"] = False

    return result


# ---------------------------------------------------------------------------
# Multi-Line Line Chart — Revenue, Orders, AOV
# ---------------------------------------------------------------------------

def _find_order_id_col(df):
    """Return an order-ID column if present."""
    for c in ("order id", "order_id", "orderid", "order number", "order_number", "transaction_id"):
        if c in df.columns:
            return c
    return None


def multiline_chart(df, granularity="monthly"):
    """
    Aggregate data over time into Revenue, Orders, and AOV (Average Order Value).

    AOV = Revenue / Orders (per bucket); 0 when orders == 0.

    Granularity options: 'daily', 'weekly', 'monthly' (default).

    Sparse time periods are filled with 0 (not fabricated).

    Returns:
        {
          "multiline_labels":  [str, ...],
          "multiline_revenue": [float, ...],
          "multiline_orders":  [int, ...],
          "multiline_aov":     [float, ...],
        }
    or {"error": str} if required columns are missing.
    """
    date_col = find_date_col(df)
    if date_col is None:
        return {"error": "Date column missing or not detected"}

    revenue_col = find_column_by_keywords(df, ["revenue", "sales", "amount", "total"])
    if revenue_col is None:
        return {"error": "Revenue / sales column missing or not detected"}

    df = df.copy()
    df["_dt"] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
    df[revenue_col] = pd.to_numeric(df[revenue_col], errors="coerce").fillna(0)
    df = df.dropna(subset=["_dt"])

    if df.empty:
        return {"error": "No valid date rows found"}

    # Granularity → (pandas period alias, label format string)
    granularity_map = {
        "daily":   ("D", "%Y-%m-%d"),
        "weekly":  ("W", "W%W %Y"),
        "monthly": ("M", "%b %Y"),
    }
    period_alias, label_fmt = granularity_map.get(granularity, ("M", "%b %Y"))

    df["_bucket"] = df["_dt"].dt.to_period(period_alias)

    revenue_agg = df.groupby("_bucket")[revenue_col].sum()

    # Count orders per bucket
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce").fillna(0)
        orders_agg = df.groupby("_bucket")["orders"].sum()
    else:
        order_id_col = _find_order_id_col(df)
        if order_id_col is not None:
            orders_agg = df.groupby("_bucket")[order_id_col].nunique()
        else:
            orders_agg = df.groupby("_bucket").size()

    # Build full period range so sparse gaps are represented with 0
    all_periods = revenue_agg.index.union(orders_agg.index).sort_values()
    revenue_agg = revenue_agg.reindex(all_periods, fill_value=0)
    orders_agg = orders_agg.reindex(all_periods, fill_value=0)

    labels = [str(p.start_time.strftime(label_fmt)) for p in all_periods]
    revenues = [float(v) for v in revenue_agg.values]
    orders = [int(v) for v in orders_agg.values]

    # AOV: server-side calculation; 0.0 when orders == 0 to avoid division error
    aov = [
        float(round(rev / ord_cnt, 2)) if ord_cnt > 0 else 0.0
        for rev, ord_cnt in zip(revenues, orders)
    ]

    return {
        "multiline_labels": labels,
        "multiline_revenue": revenues,
        "multiline_orders": orders,
        "multiline_aov": aov,
    }


# ---------------------------------------------------------------------------
# Normal Bar Chart — Top 6 Products by Revenue
# ---------------------------------------------------------------------------

def profit_by_product_chart(df):
    """
    Group by product, aggregate total profit, sort descending, return top 6.

    Products with zero or negative profit are excluded.
    Duplicate product names are merged (summed) consistently.

    Returns:
        {"profit_by_product_column": str, "profit_by_product_data": [{"name": str, "value": float}, ...]}
    or None if no product or profit column found.
    """
    # Find product column (same priority order as top_products_by_revenue_chart)
    product_col = None
    for c in ("product name", "product_name", "productname", "product"):
        if c in df.columns:
            product_col = c
            break
    if product_col is None:
        for c in ("category", "sub-category", "sub_category"):
            if c in df.columns:
                product_col = c
                break
    if product_col is None:
        return None

    if "profit" not in df.columns:
        return None

    df = df.copy()
    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    df[product_col] = df[product_col].astype(str).str.strip()

    # Drop rows with invalid/null profit or empty product names
    df = df.dropna(subset=["profit"])
    df = df[df[product_col].str.lower() != "nan"]
    df = df[df[product_col] != ""]

    agg = df.groupby(product_col, sort=False)["profit"].sum()

    # Exclude products with zero or negative profit
    agg = agg[agg > 0]
    if agg.empty:
        return None

    # Sort descending; stable sort (mergesort) preserves insertion order for products with equal profit
    agg = agg.sort_values(ascending=False, kind="mergesort")
    agg = agg.head(TOP_PRODUCTS_MAX)

    if len(agg) < 1:
        return None

    data = [{"name": str(n), "value": float(v)} for n, v in agg.items()]
    return {"profit_by_product_column": product_col, "profit_by_product_data": data}


def top_products_by_revenue_chart(df):
    """
    Group by product, aggregate total revenue, sort descending, return top 6.

    Products with zero or null revenue are excluded.
    Duplicate product names are merged (summed) consistently.

    Returns:
        {"bar_column": str, "bar_data": [{"name": str, "value": float}, ...]}
    or None if no product or revenue column found.
    """
    # Find product column
    product_col = None
    for c in ("product name", "product_name", "productname", "product"):
        if c in df.columns:
            product_col = c
            break
    if product_col is None:
        for c in ("category", "sub-category", "sub_category"):
            if c in df.columns:
                product_col = c
                break
    if product_col is None:
        return None

    # Find revenue column
    revenue_col = None
    for c in ("revenue", "sales", "amount", "total"):
        if c in df.columns:
            revenue_col = c
            break
    if revenue_col is None:
        return None

    df = df.copy()
    df[revenue_col] = pd.to_numeric(df[revenue_col], errors="coerce")
    df[product_col] = df[product_col].astype(str).str.strip()

    # Drop rows with invalid/null revenue or empty product names
    df = df.dropna(subset=[revenue_col])
    df = df[df[product_col].str.lower() != "nan"]
    df = df[df[product_col] != ""]

    agg = df.groupby(product_col, sort=False)[revenue_col].sum()

    # Exclude products with zero or negative revenue
    agg = agg[agg > 0]
    if agg.empty:
        return None

    # Sort descending; stable sort preserves insertion order for equal values
    agg = agg.sort_values(ascending=False, kind="mergesort")
    agg = agg.head(TOP_PRODUCTS_MAX)

    if len(agg) < 1:
        return None

    bar_data = [{"name": str(n), "value": float(v)} for n, v in agg.items()]
    return {"bar_column": product_col, "bar_data": bar_data}


# ---------------------------------------------------------------------------
# Geographic Map — Orders by Region
# ---------------------------------------------------------------------------

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


def map_orders_by_region(df):
    """
    Group data by region (country / state / province) and count total orders
    per region.  Returns order count and percentage contribution per region.

    Region values are normalised (trimmed, lowercased for matching, original
    case preserved in output).

    Returns:
        {
          "map_column": str,
          "map_data": [
            {
              "name":        str,
              "value":       int,   # order count
              "percentage":  float, # % of total orders
              "coordinates": [lng, lat],
            },
            ...
          ],
        }
    or {"error": str} if region column is missing.
    """
    geo_col = None
    for col in ("region", "state", "country", "location", "city", "province"):
        if col in df.columns:
            geo_col = col
            break
    if geo_col is None:
        return {"error": "Region / geographic column missing or not detected"}

    df = df.copy()
    # Normalise region values: trim and remove extra internal spaces
    df[geo_col] = df[geo_col].astype(str).str.strip().str.replace(r"\s+", " ", regex=True)

    # Count orders per region
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce").fillna(0)
        agg = df.groupby(df[geo_col], dropna=True)["orders"].sum()
    elif any(c in df.columns for c in ("order id", "order_id", "orderid")):
        order_id_col = _find_order_id_col(df)
        agg = df.groupby(df[geo_col], dropna=True)[order_id_col].nunique()
    else:
        agg = df.groupby(df[geo_col], dropna=True).size()

    # Remove empty / nan labels
    agg = agg[~agg.index.str.lower().isin({"nan", ""})]
    if agg.empty:
        return {"error": "No valid region data found"}

    total_orders = int(agg.sum())
    if total_orders == 0:
        return {"error": "Total order count is zero"}

    out = []
    for name, count in agg.items():
        coords = _coords_for_place(str(name))
        if coords is None:
            continue
        pct = round(float(count) / total_orders * 100, 1)
        out.append({
            "name": str(name),
            "value": int(count),
            "percentage": pct,
            "coordinates": list(coords),
        })

    if not out:
        return {"error": "No mappable regions found (no coordinate data for given region names)"}

    out.sort(key=lambda x: x["value"], reverse=True)
    out = out[:15]
    return {"map_column": geo_col, "map_data": out}
