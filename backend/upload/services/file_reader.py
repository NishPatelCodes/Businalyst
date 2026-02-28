"""
Read uploaded CSV/Excel file and return a normalized DataFrame.
"""
import pandas as pd


def read_uploaded_file(file):
    """Read CSV or Excel upload; normalize column names to lowercase stripped."""
    filename = file.name.lower()

    if filename.endswith(".csv"):
        df = pd.read_csv(file)
    elif filename.endswith(".xlsx") or filename.endswith(".xls"):
        df = pd.read_excel(file)
    else:
        raise ValueError("Unsupported file type")

    df.columns = df.columns.str.lower().str.strip()
    return df
