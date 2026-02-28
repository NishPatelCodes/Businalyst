"""
Build the full dashboard payload from a DataFrame.
Orchestrates analytics components and merges results (same contract as original upload view).
"""
from analytics.charts import bar_chart, linechart, map_data, pie_chart_column
from analytics.kpis import calculate_kpis
from analytics.orders import (
    orders_by_channel_component,
    orders_by_region_component,
    orders_by_status_component,
    orders_list_component,
    orders_trend_daily,
    top_products_by_orders_component,
)
from analytics.table import table_component
from analytics.utils.columns import aggregate_sparkline


def build_payload(df):
    """
    Given a DataFrame from an uploaded file, compute KPIs and all chart/table/orders
    components and return a single dict suitable for JsonResponse.
    Non-fatal component failures are skipped (payload may omit optional keys).
    """
    kpis = calculate_kpis(df)
    payload = {"message": "File processed successfully", **kpis}

    try:
        chart = linechart(df)
        payload["revenue_data"] = chart["revenue_data"]
        payload["profit_data"] = chart["profit_data"]
        payload["date_data"] = chart["date_data"]
        if "orders_data" in chart:
            payload["orders_data"] = chart["orders_data"]
    except Exception:
        pass

    if "orders_data" not in payload and "orders" in df.columns:
        try:
            spark = aggregate_sparkline(df, value_col="orders")
            if spark:
                payload["orders_data"] = spark
        except Exception:
            pass

    if "orders_data" not in payload:
        try:
            val_col = next((c for c in ["revenue", "profit"] if c in df.columns), None)
            if val_col:
                spark = aggregate_sparkline(df, value_col=val_col)
                if spark:
                    payload["orders_data"] = spark
        except Exception:
            pass

    try:
        table = table_component(df)
        payload["top5_profit"] = table["top5_profit"]
        payload["top5_columns"] = table["top5_columns"]
    except Exception:
        pass

    try:
        orders = orders_list_component(df)
        payload["orders_list"] = orders["orders_list"]
        payload["orders_columns"] = orders["orders_columns"]
    except Exception:
        pass

    try:
        trend = orders_trend_daily(df)
        if trend:
            payload["orders_trend"] = trend["orders_trend"]
    except Exception:
        pass

    try:
        status = orders_by_status_component(df)
        if status:
            payload["orders_by_status"] = status["orders_by_status"]
    except Exception:
        pass

    try:
        channel = orders_by_channel_component(df)
        if channel:
            payload["orders_by_channel"] = channel["orders_by_channel"]
    except Exception:
        pass

    try:
        region = orders_by_region_component(df)
        if region:
            payload["orders_by_region"] = region["orders_by_region"]
    except Exception:
        pass

    try:
        top_prod = top_products_by_orders_component(df)
        if top_prod:
            payload["top_products_by_orders"] = top_prod["top_products_by_orders"]
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
        bar = bar_chart(df)
        if bar:
            payload["bar_column"] = bar["bar_column"]
            payload["bar_data"] = bar["bar_data"]
    except Exception:
        pass

    try:
        map_result = map_data(df)
        if map_result:
            payload["map_column"] = map_result["map_column"]
            payload["map_data"] = map_result["map_data"]
    except Exception:
        pass

    return payload
