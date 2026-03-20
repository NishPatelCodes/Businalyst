"""
Table components: top 5 by profit, orders list.
"""

import pandas as pd

from .utils import find_date_col, dataframe_to_rows
from .constants import ORDERS_LIST_MAX


def table_component(df):
    """
    Top 5 rows by profit for dashboard table.
    Returns {"top5_profit": list of row dicts, "top5_columns": list of column names}.
    """
    if "profit" not in df.columns:
        return None
    df = df.copy()
    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    df_sorted = df.sort_values(by="profit", ascending=False).reset_index(drop=True).head(5)
    columns = list(df_sorted.columns)
    rows = dataframe_to_rows(df_sorted, columns)
    return {"top5_profit": rows, "top5_columns": columns}


def orders_list_component(df):
    """
    List of order rows (up to ORDERS_LIST_MAX) for the Orders page.
    Sort by date descending if a date column exists, else by profit descending.
    Returns {"orders_list": list of row dicts, "orders_columns": list of column names}.
    """
    df = df.copy()
    columns = list(df.columns)
    date_col = find_date_col(df)
    if date_col and date_col in df.columns:
        df["_sort_date"] = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True)
        df = df.dropna(subset=["_sort_date"]).sort_values(by="_sort_date", ascending=False)
    elif "profit" in df.columns:
        df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
        df = df.dropna(subset=["profit"]).sort_values(by="profit", ascending=False)
    else:
        df = df.head(ORDERS_LIST_MAX)
    df = df.head(ORDERS_LIST_MAX).reset_index(drop=True)
    rows = dataframe_to_rows(df, columns)
    return {"orders_list": rows, "orders_columns": columns}
