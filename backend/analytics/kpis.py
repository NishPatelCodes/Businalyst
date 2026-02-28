"""
KPI calculation from DataFrame (profit, revenue, orders, expense, customers).
"""
import pandas as pd


def calculate_kpis(df):
    """Calculate profit/revenue/orders/expense sums and row count (customers_sum)."""
    required_cols = ["profit", "revenue", "orders", "expense"]
    missing = [col for col in required_cols if col not in df.columns]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

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
