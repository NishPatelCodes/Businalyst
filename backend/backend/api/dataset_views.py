"""
Dataset API: authenticated upload, retrieve saved analytics, delete dataset.
"""

import logging

from django.core.files.base import ContentFile
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
from backend.models import UserDataset

logger = logging.getLogger(__name__)


def _merge_component(payload, df, name, fn, merge_keys=None):
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
    except Exception as e:
        logger.warning("Analytics component %s failed: %s", name, e, exc_info=True)


def _build_analytics_payload(df, start_date=None, end_date=None):
    """Run the full analytics pipeline on a DataFrame, return the JSON-ready dict."""
    date_col = find_date_col(df)
    if (start_date or end_date) and date_col:
        df = filter_df_by_date(df, start_date=start_date, end_date=end_date, date_column=date_col)

    kpis = calculate_kpis(
        df,
        start_date=None if (start_date or end_date) and date_col else start_date,
        end_date=None if (start_date or end_date) and date_col else end_date,
        date_column=date_col or "date",
    )
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
    _merge_component(
        payload, df, "comparison_bar",
        comparison_bar_chart,
        ["comparison_bar_labels", "comparison_bar_current",
         "comparison_bar_previous", "comparison_bar_has_previous"],
    )
    _merge_component(
        payload, df, "multiline",
        multiline_chart,
        ["multiline_labels", "multiline_revenue", "multiline_orders", "multiline_aov"],
    )
    _merge_component(payload, df, "bar", top_products_by_revenue_chart, ["bar_column", "bar_data"])
    _merge_component(payload, df, "profit_by_product", profit_by_product_chart, ["profit_by_product_column", "profit_by_product_data"])
    _merge_component(payload, df, "map", map_orders_by_region, ["map_column", "map_data"])

    return payload, len(df)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_dataset(request):
    """
    Authenticated CSV/Excel upload.
    Processes the file, stores analytics JSON in DB tied to the user,
    and returns the analytics payload immediately.
    """
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    start_date = request.POST.get("start_date") or request.GET.get("start_date") or None
    end_date = request.POST.get("end_date") or request.GET.get("end_date") or None
    if start_date and isinstance(start_date, str):
        start_date = start_date.strip() or None
    if end_date and isinstance(end_date, str):
        end_date = end_date.strip() or None

    try:
        df = read_uploaded_file(file)
        payload, row_count = _build_analytics_payload(df, start_date, end_date)

        file.seek(0)
        dataset = UserDataset(
            user=request.user,
            name=file.name,
            source_currency=payload.get("source_currency", "USD"),
            analytics_json=payload,
            row_count=row_count,
            is_active=True,
        )
        dataset.csv_file.save(file.name, ContentFile(file.read()), save=False)
        dataset.save()

        payload["dataset_id"] = dataset.id
        payload["dataset_name"] = dataset.name
        payload["uploaded_at"] = dataset.uploaded_at.isoformat()
        return Response(payload, status=status.HTTP_201_CREATED)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Upload processing failed")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_active_dataset(request):
    """Return the user's currently active dataset analytics (auto-load on login)."""
    dataset = UserDataset.objects.filter(user=request.user, is_active=True).first()
    if not dataset:
        return Response({"has_dataset": False}, status=status.HTTP_200_OK)

    payload = dataset.analytics_json or {}
    payload["has_dataset"] = True
    payload["dataset_id"] = dataset.id
    payload["dataset_name"] = dataset.name
    payload["source_currency"] = dataset.source_currency
    payload["uploaded_at"] = dataset.uploaded_at.isoformat()
    return Response(payload)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dataset_history(request):
    """Return a list of all datasets uploaded by this user."""
    datasets = UserDataset.objects.filter(user=request.user).values(
        "id", "name", "source_currency", "row_count", "is_active", "uploaded_at"
    )
    return Response({"datasets": list(datasets)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def activate_dataset(request, dataset_id):
    """Switch the user's active dataset."""
    try:
        dataset = UserDataset.objects.get(id=dataset_id, user=request.user)
    except UserDataset.DoesNotExist:
        return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

    dataset.is_active = True
    dataset.save()
    payload = dataset.analytics_json or {}
    payload["dataset_id"] = dataset.id
    payload["dataset_name"] = dataset.name
    payload["source_currency"] = dataset.source_currency
    payload["uploaded_at"] = dataset.uploaded_at.isoformat()
    return Response(payload)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_dataset(request, dataset_id):
    """Delete a specific dataset."""
    try:
        dataset = UserDataset.objects.get(id=dataset_id, user=request.user)
    except UserDataset.DoesNotExist:
        return Response({"error": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND)

    if dataset.csv_file:
        dataset.csv_file.delete(save=False)
    dataset.delete()
    return Response({"message": "Dataset deleted"}, status=status.HTTP_200_OK)
