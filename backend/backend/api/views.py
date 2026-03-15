"""
Upload API: single endpoint that accepts a file and returns analytics JSON.
"""

import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from backend.analytics import (
    read_uploaded_file,
    calculate_kpis,
    linechart,
    comparison_bar_chart,
    multiline_chart,
    top_products_by_revenue_chart,
    profit_by_product_chart,
    pie_chart_column,
    map_orders_by_region,
    table_component,
    orders_list_component,
    orders_trend_daily,
    orders_by_status_component,
    orders_by_channel_component,
    orders_by_region_component,
    top_products_by_orders_component,
)
from backend.analytics.utils import find_date_col, filter_df_by_date

logger = logging.getLogger(__name__)


def _merge_component(payload, df, name, fn, merge_keys=None):
    """
    Run a component function; on success merge result into payload.
    On exception log and leave payload unchanged for that part.
    """
    try:
        result = fn(df)
        if result is None:
            return
        if merge_keys is None:
            merge_keys = list(result.keys())
        for key in merge_keys:
            if key in result:
                payload[key] = result[key]
    except Exception as e:
        logger.warning("Analytics component %s failed: %s", name, e, exc_info=True)


@csrf_exempt
@require_http_methods(["POST"])
def upload_dataset(request):
    """
    POST with multipart/form-data: "file" (CSV or Excel), optional "start_date" and "end_date".
    When start_date/end_date are provided, KPIs and all charts use only rows in that date range.
    """
    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "No file uploaded"}, status=400)

    start_date = request.POST.get("start_date") or request.GET.get("start_date") or None
    end_date = request.POST.get("end_date") or request.GET.get("end_date") or None
    if start_date and isinstance(start_date, str):
        start_date = start_date.strip() or None
    if end_date and isinstance(end_date, str):
        end_date = end_date.strip() or None

    try:
        df = read_uploaded_file(file)
        date_col = find_date_col(df)
        if (start_date or end_date) and date_col:
            df = filter_df_by_date(df, start_date=start_date, end_date=end_date, date_column=date_col)
        kpis = calculate_kpis(df, start_date=start_date, end_date=end_date, date_column=date_col or "date")
        payload = {"message": "File processed successfully", **kpis}

        # Line chart (revenue, profit, date_data, product_data)
        try:
            chart = linechart(df)
            payload["revenue_data"] = chart["revenue_data"]
            payload["profit_data"] = chart["profit_data"]
            payload["date_data"] = chart["date_data"]
            if "product_data" in chart:
                payload["product_data"] = chart["product_data"]
        except Exception as e:
            logger.warning("Line chart failed: %s", e, exc_info=True)

        _merge_component(payload, df, "table", table_component, ["top5_profit", "top5_columns"])
        _merge_component(payload, df, "orders_list", orders_list_component, ["orders_list", "orders_columns"])
        _merge_component(payload, df, "orders_trend", orders_trend_daily, ["orders_trend"])
        _merge_component(payload, df, "orders_by_status", orders_by_status_component, ["orders_by_status"])
        _merge_component(payload, df, "orders_by_channel", orders_by_channel_component, ["orders_by_channel"])
        _merge_component(payload, df, "orders_by_region", orders_by_region_component, ["orders_by_region"])
        _merge_component(payload, df, "top_products", top_products_by_orders_component, ["top_products_by_orders"])
        _merge_component(payload, df, "pie", pie_chart_column, ["pie_column", "pie_data"])
        # Comparing Bar Chart — current vs previous period sales
        _merge_component(
            payload, df, "comparison_bar",
            comparison_bar_chart,
            ["comparison_bar_labels", "comparison_bar_current",
             "comparison_bar_previous", "comparison_bar_has_previous"],
        )
        # Multi-Line Chart — Revenue, Orders, AOV (server-side AOV calculation)
        _merge_component(
            payload, df, "multiline",
            multiline_chart,
            ["multiline_labels", "multiline_revenue", "multiline_orders", "multiline_aov"],
        )
        # Top 6 Products by Revenue bar chart
        _merge_component(payload, df, "bar", top_products_by_revenue_chart, ["bar_column", "bar_data"])
        # Top 6 Products by Profit (used by Profit Composition chart)
        _merge_component(payload, df, "profit_by_product", profit_by_product_chart, ["profit_by_product_column", "profit_by_product_data"])
        # Geographic Map — Orders by region
        _merge_component(payload, df, "map", map_orders_by_region, ["map_column", "map_data"])

        return JsonResponse(payload)

    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        logger.exception("Upload processing failed")
        return JsonResponse({"error": str(e)}, status=500)
