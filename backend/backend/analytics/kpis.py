"""
KPI calculation: profit, revenue, orders, expense sums and row count.
Supports optional date-range filtering so KPIs react to the selected timeline.
"""

import pandas as pd
from google import genai
import ast

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

    # The client automatically loads the GEMINI_API_KEY environment variable
    client = genai.Client()

    # Recommended flagship model: gemini-3.6-flash
    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=f"return a list containing 5 most important numeric columns from this list {df.columns} , make sure you return the valid python list only"
    )

    required_cols = ast.literal_eval(interaction.output_text)    

    # Resolve date column for filtering; apply date range when provided
    date_col = date_column if (date_column and date_column in df.columns) else find_date_col(df)
    if start_date is not None or end_date is not None:
        if date_col is None:
            raise ValueError("Date column required for date range filter but none found in the data")
        df = filter_df_by_date(df, start_date=start_date, end_date=end_date, date_column=date_col)
    else:
        df = df.copy()

    kpis = {"kpi_col":required_cols}
    count = 1
    for col in required_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        kpis[col] = float(df[col].sum(skipna=True))
    print(kpis)
    return kpis
