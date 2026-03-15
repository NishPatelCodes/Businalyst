"""
KPI calculation: profit, revenue, orders, expense sums and row count.
Supports optional date-range filtering so KPIs react to the selected timeline.
"""

import pandas as pd

from .utils import find_date_col, filter_df_by_date


def calculate_kpis(df, start_date=None, end_date=None, date_column="date"):
    """
    Compute summary KPIs from the dataset, optionally filtered by date range.

    Requires columns: profit, revenue, orders, expense.
    If start_date or end_date is provided, a date column is required (by name or auto-detected).

    Args:
        df: DataFrame with lowercased column names.
        start_date: Optional start of range (inclusive). Parsed with pd.to_datetime.
        end_date: Optional end of range (inclusive). Parsed with pd.to_datetime.
        date_column: Name of date column (default "date"). If not found, auto-detected.

    Returns:
        dict with profit_sum, revenue_sum, orders_sum, expense_sum, customers_sum (row count).
    """
    required_cols = ["profit", "revenue", "orders", "expense"]
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    # Resolve date column for filtering; apply date range when provided
    date_col = date_column if (date_column and date_column in df.columns) else find_date_col(df)
    if start_date is not None or end_date is not None:
        if date_col is None:
            raise ValueError("Date column required for date range filter but none found in the data")
        df = filter_df_by_date(df, start_date=start_date, end_date=end_date, date_column=date_col)
    else:
        df = df.copy()

    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce")
    df["orders"] = pd.to_numeric(df["orders"], errors="coerce")
    df["expense"] = pd.to_numeric(df["expense"], errors="coerce")

    return {
        "profit_sum": float(df["profit"].sum(skipna=True)),
        "revenue_sum": float(df["revenue"].sum(skipna=True)),
        "orders_sum": float(df["orders"].sum(skipna=True)),
        "expense_sum": float(df["expense"].sum(skipna=True)),
        "customers_sum": df.shape[0],
    }
