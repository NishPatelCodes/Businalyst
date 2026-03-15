"""
File I/O: read uploaded CSV/Excel and return a normalized DataFrame.
"""

import pandas as pd
from .currency import detect_source_currency, normalize_money_columns


def read_uploaded_file(file):
    """
    Read uploaded CSV or Excel file and return a DataFrame.

    - Supports .csv, .xlsx, .xls.
    - Column names are lowercased and stripped.

    Raises:
        ValueError: If file type is not supported.
    """
    filename = file.name.lower()

    if filename.endswith(".csv"):
        df = pd.read_csv(file)
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(file)
    else:
        raise ValueError("Unsupported file type")

    df.columns = df.columns.str.lower().str.strip()
    source_currency = detect_source_currency(df)
    df = normalize_money_columns(df)
    df.attrs['source_currency'] = source_currency
    return df
