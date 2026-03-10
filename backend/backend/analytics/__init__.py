"""
Analytics package: file I/O, KPIs, charts, orders, and tables.

Import from submodules, e.g.:
  from backend.analytics.io import read_uploaded_file
  from backend.analytics.kpis import calculate_kpis
"""

from .io import read_uploaded_file
from .kpis import calculate_kpis
from .charts import (
    linechart,
    comparison_bar_chart,
    multiline_chart,
    top_products_by_revenue_chart,
    pie_chart_column,
    map_orders_by_region,
)
from .orders import (
    orders_trend_daily,
    orders_by_status_component,
    orders_by_channel_component,
    orders_by_region_component,
    top_products_by_orders_component,
)
from .tables import table_component, orders_list_component

__all__ = [
    "read_uploaded_file",
    "calculate_kpis",
    "linechart",
    "comparison_bar_chart",
    "multiline_chart",
    "top_products_by_revenue_chart",
    "pie_chart_column",
    "map_orders_by_region",
    "orders_trend_daily",
    "orders_by_status_component",
    "orders_by_channel_component",
    "orders_by_region_component",
    "top_products_by_orders_component",
    "table_component",
    "orders_list_component",
]
