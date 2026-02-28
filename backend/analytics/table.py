"""
Table component: top 5 by profit and JSON serialization helper.
"""
import pandas as pd


def to_json_value(val):
    """Convert a pandas/cell value to a JSON-serializable value."""
    if pd.isna(val):
        return None
    if hasattr(val, "item"):
        return val.item()
    if isinstance(val, (pd.Timestamp,)):
        return str(val)
    if isinstance(val, (float,)):
        return float(val)
    if isinstance(val, (int,)):
        return int(val)
    return str(val)


def table_component(df):
    """Top 5 rows by profit for table display."""
    if "profit" not in df.columns:
        raise ValueError("Missing column: profit")
    df = df.copy()
    df["profit"] = pd.to_numeric(df["profit"], errors="coerce")
    df_sorted = df.sort_values(by="profit", ascending=False).reset_index(drop=True).head(5)
    columns = list(df_sorted.columns)

    rows = []
    for _, row in df_sorted.iterrows():
        rows.append({col: to_json_value(row[col]) for col in columns})
    return {"top5_profit": rows, "top5_columns": columns}
