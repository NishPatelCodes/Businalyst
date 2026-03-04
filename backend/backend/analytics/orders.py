"""
Orders overview: trend, by status, by channel, by region, top products.
"""

import pandas as pd

from .utils import find_date_col, find_column_by_keywords
from .constants import STATUS_COLORS, CHANNEL_COLORS


def orders_trend_daily(df):
    """
    Aggregate orders by date for the Orders Overview line chart.
    Returns {"orders_trend": [{"date": str, "orders": number}, ...]} or None.
    """
    df = df.copy()
    date_col = find_date_col(df)
    if date_col is None or date_col not in df.columns:
        return None
    df["_dt"] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
    df = df.dropna(subset=["_dt"])
    if len(df) == 0:
        return None
    df["_date_str"] = df["_dt"].dt.strftime("%Y-%m-%d")
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce").fillna(0)
        agg = df.groupby("_date_str")["orders"].sum()
    else:
        agg = df.groupby("_date_str").size()
    agg = agg.sort_index()
    if len(agg) > 60:
        agg = agg.tail(60)
    return {
        "orders_trend": [
            {"date": str(d), "orders": int(v) if getattr(v, "item", None) else int(v)}
            for d, v in agg.items()
        ]
    }


def orders_by_status_component(df):
    """
    Find a status-like column and return value counts for donut chart.
    Returns {"orders_by_status": [{"name": str, "value": int, "color": str}, ...]} or None.
    """
    col = find_column_by_keywords(
        df, ["status", "order status", "state", "order state", "fulfillment"]
    )
    if col is None:
        col = "category" if "category" in df.columns else None
    if col is None:
        return None
    s = df[col].dropna().astype(str).str.strip()
    s = s[s.str.lower() != "nan"]
    counts = s.value_counts()
    if len(counts) == 0:
        return None
    out = []
    for i, (name, value) in enumerate(counts.items()):
        if not name:
            continue
        out.append({
            "name": str(name).strip(),
            "value": int(value),
            "color": STATUS_COLORS[i % len(STATUS_COLORS)],
        })
    return {"orders_by_status": out[:10]} if out else None


def orders_by_channel_component(df):
    """
    Find a channel/source column and return order counts for horizontal bar chart.
    Returns {"orders_by_channel": [{"name": str, "orders": int, "fill": str}, ...]} or None.
    """
    col = find_column_by_keywords(
        df, ["channel", "source", "sales channel", "platform", "payment_method", "payment method"]
    )
    if col is None:
        return None
    df = df.copy()
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce").fillna(0)
        agg = df.groupby(df[col].astype(str).str.strip(), dropna=True)["orders"].sum()
    else:
        agg = df.groupby(df[col].astype(str).str.strip(), dropna=True).size()
    agg = agg[agg.index.str.strip().str.lower() != "nan"]
    agg = agg.sort_values(ascending=True)
    if len(agg) == 0:
        return None
    out = []
    for i, (name, value) in enumerate(agg.items()):
        out.append({
            "name": str(name).strip(),
            "orders": int(value),
            "fill": CHANNEL_COLORS[i % len(CHANNEL_COLORS)],
        })
    return {"orders_by_channel": out[-15:]}


def orders_by_region_component(df):
    """
    Aggregate orders by region (or state/country) for progress bars.
    Returns {"orders_by_region": [{"name": str, "orders": int}, ...]} or None.
    """
    geo_col = None
    for c in ["region", "state", "country"]:
        if c in df.columns:
            geo_col = c
            break
    if geo_col is None:
        return None
    df = df.copy()
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce").fillna(0)
        agg = df.groupby(df[geo_col].astype(str).str.strip(), dropna=True)["orders"].sum()
    else:
        agg = df.groupby(df[geo_col].astype(str).str.strip(), dropna=True).size()
    agg = agg[agg.index.str.strip().str.lower() != "nan"]
    agg = agg.sort_values(ascending=False)
    if len(agg) == 0:
        return None
    out = [{"name": str(n).strip(), "orders": int(v)} for n, v in agg.items()][:10]
    return {"orders_by_region": out}


def top_products_by_orders_component(df):
    """
    Top products (or category) by order count and revenue for Orders Overview table.
    Returns {"top_products_by_orders": [{"product": str, "orders": int, "revenue": float, "avgQty": float}, ...]} or None.
    """
    product_col = None
    for c in ["product name", "product_name", "productname", "category", "product id", "product_id"]:
        if c in df.columns:
            product_col = c
            break
    if product_col is None:
        return None
    df = df.copy()
    df[product_col] = df[product_col].astype(str).str.strip()
    df = df[df[product_col].str.lower() != "nan"]
    if "orders" in df.columns:
        df["orders"] = pd.to_numeric(df["orders"], errors="coerce").fillna(0)
        orders_agg = df.groupby(product_col)["orders"].sum()
    else:
        orders_agg = df.groupby(product_col).size()
    if "revenue" in df.columns:
        df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce").fillna(0)
        revenue_agg = df.groupby(product_col)["revenue"].sum()
    else:
        revenue_agg = pd.Series(dtype=float)
    count_agg = df.groupby(product_col).size()
    result = []
    for name in orders_agg.index:
        orders_val = int(orders_agg[name])
        revenue_val = float(revenue_agg[name]) if name in revenue_agg.index else 0
        cnt = int(count_agg[name])
        avg_qty = round(orders_val / cnt, 1) if cnt else 0
        result.append({
            "product": str(name).strip(),
            "orders": orders_val,
            "revenue": revenue_val,
            "avgQty": avg_qty,
        })
    result.sort(key=lambda x: x["orders"], reverse=True)
    return {"top_products_by_orders": result[:10]}
