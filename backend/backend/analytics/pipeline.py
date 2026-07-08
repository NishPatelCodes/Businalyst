"""
Canonical analytics pipeline orchestration shared by API endpoints.
"""

import logging

import pandas as pd

from backend.analytics import (
    calculate_kpis,
    comparison_bar_chart,
    linechart,
    map_orders_by_region,
    multiline_chart,
    orders_by_channel_component,
    orders_by_region_component,
    orders_by_status_component,
    orders_list_component,
    orders_trend_daily,
    pie_chart_column,
    profit_by_product_chart,
    table_component,
    top_products_by_orders_component,
    top_products_by_revenue_chart,
)
from backend.analytics.utils import find_date_col, filter_df_by_date, parse_datetime_series

logger = logging.getLogger(__name__)
SCOPE_FULL = "full"
SCOPE_BOOTSTRAP = "bootstrap"
BOOTSTRAP_KEYS = {
    "message",
    "source_currency",
    "profit_sum",
    "revenue_sum",
    "orders_sum",
    "expense_sum",
    "customers_sum",
    "revenue_data",
    "profit_data",
    "date_data",
    "orders_data",
    "product_data",
}


def merge_component(payload, df, name, fn, merge_keys=None):
    """Run a component builder and merge successful keys into payload."""
    try:
        result = fn(df)
        if result is None or not isinstance(result, dict):
            return
        if merge_keys is None:
            merge_keys = [k for k in result.keys() if k != "error"]
        if "error" in result and merge_keys and not any(k in result for k in merge_keys):
            msg = result.get("error", "unknown")
            logger.warning("Analytics component %s returned error: %s", name, msg)
            payload.setdefault("analytics_warnings", []).append(
                {"component": name, "error": str(msg)}
            )
            return
        for key in merge_keys:
            if key in result and key != "error":
                payload[key] = result[key]
    except Exception as exc:
        logger.warning("Analytics component %s failed: %s", name, exc, exc_info=True)


def _preprocess_for_pipeline(df):
    """Normalize high-frequency numeric/date fields once per request."""
    out = df.copy()
    for col in ("profit", "revenue", "orders", "expense"):
        if col in out.columns:
            out[col] = pd.to_numeric(out[col], errors="coerce")
    date_col = find_date_col(out)
    if date_col and date_col in out.columns:
        out[date_col] = parse_datetime_series(out[date_col])
    return out


def trim_payload_for_scope(payload, scope):
    if scope != SCOPE_BOOTSTRAP:
        return payload
    return {k: v for k, v in payload.items() if k in BOOTSTRAP_KEYS}


def build_analytics_payload(df, start_date=None, end_date=None, scope=SCOPE_FULL):
    """Run full analytics pipeline on a DataFrame and return (payload, row_count)."""
    scope = scope if scope in {SCOPE_FULL, SCOPE_BOOTSTRAP} else SCOPE_FULL
    df = _preprocess_for_pipeline(df)
    date_col = find_date_col(df)
    if start_date or end_date:
        if date_col is None:
            raise ValueError("Date column required for date range filter but none found in the data")
        df = filter_df_by_date(df, start_date=start_date, end_date=end_date, date_column=date_col)

    kpis = calculate_kpis(df, start_date=None, end_date=None, date_column=date_col or "date")
    payload = {
        "message": "File processed successfully",
        "source_currency": df.attrs.get("source_currency", "USD"),
        **kpis,
    }

    try:
        chart = linechart(df)
        payload["revenue_data"] = chart["revenue_data"]
        payload["profit_data"] = chart["profit_data"]
        payload["date_data"] = chart["date_data"]
        if "orders_data" in chart:
            payload["orders_data"] = chart["orders_data"]
        if "product_data" in chart:
            payload["product_data"] = chart["product_data"]
    except Exception as exc:
        logger.warning("Line chart failed: %s", exc, exc_info=True)

    if scope == SCOPE_FULL:
        merge_component(payload, df, "table", table_component, ["top5_profit", "top5_columns"])
        merge_component(payload, df, "orders_list", orders_list_component, ["orders_list", "orders_columns"])
        merge_component(payload, df, "orders_trend", orders_trend_daily, ["orders_trend"])
        merge_component(payload, df, "orders_by_status", orders_by_status_component, ["orders_by_status"])
        merge_component(payload, df, "orders_by_channel", orders_by_channel_component, ["orders_by_channel"])
        merge_component(payload, df, "orders_by_region", orders_by_region_component, ["orders_by_region"])
        merge_component(payload, df, "top_products", top_products_by_orders_component, ["top_products_by_orders"])
        merge_component(payload, df, "pie", pie_chart_column, ["pie_column", "pie_data"])
        merge_component(
            payload,
            df,
            "comparison_bar",
            comparison_bar_chart,
            [
                "comparison_bar_labels",
                "comparison_bar_current",
                "comparison_bar_previous",
                "comparison_bar_has_previous",
            ],
        )
        merge_component(
            payload,
            df,
            "multiline",
            multiline_chart,
            ["multiline_labels", "multiline_revenue", "multiline_orders", "multiline_aov"],
        )
        merge_component(payload, df, "bar", top_products_by_revenue_chart, ["bar_column", "bar_data"])
        merge_component(
            payload,
            df,
            "profit_by_product",
            profit_by_product_chart,
            ["profit_by_product_column", "profit_by_product_data"],
        )
        merge_component(payload, df, "map", map_orders_by_region, ["map_column", "map_data"])

    return trim_payload_for_scope(payload, scope), len(df)
