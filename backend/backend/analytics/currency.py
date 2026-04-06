"""
Currency detection and numeric parsing helpers for uploaded datasets.
"""
import re
import pandas as pd

CURRENCY_SYMBOL_PATTERNS = {
    "INR": re.compile(r"\u20b9|\binr\b", re.IGNORECASE),
    "EUR": re.compile(r"\u20ac|\beur\b", re.IGNORECASE),
    "GBP": re.compile(r"\u00a3|\bgbp\b", re.IGNORECASE),
    "JPY": re.compile(r"\u00a5|\bjpy\b", re.IGNORECASE),
    "CAD": re.compile(r"c\$|\bcad\b", re.IGNORECASE),
    "AUD": re.compile(r"a\$|\baud\b", re.IGNORECASE),
    "USD": re.compile(r"\$|\busd\b", re.IGNORECASE),
}

MONEY_COLUMN_HINTS = {
    "profit",
    "revenue",
    "expense",
    "sales",
    "amount",
    "cost",
    "price",
    "total",
    "income",
}



def _is_money_like_column(col_name):
    key = str(col_name).lower()
    return any(hint in key for hint in MONEY_COLUMN_HINTS)



def detect_source_currency(df):
    """
    Detect the dominant source currency code from text in money-like columns.
    Defaults to USD when no signal is found.
    """
    scores = {code: 0 for code in CURRENCY_SYMBOL_PATTERNS}

    for col in df.columns:
        header = str(col)
        for code, pattern in CURRENCY_SYMBOL_PATTERNS.items():
            if pattern.search(header):
                scores[code] += 2

        if not _is_money_like_column(col):
            continue
        series = df[col].dropna().astype(str)
        if series.empty:
            continue
        sample = series.head(500)
        for value in sample:
            text = value.strip()
            if not text:
                continue
            for code, pattern in CURRENCY_SYMBOL_PATTERNS.items():
                if pattern.search(text):
                    scores[code] += 1

    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    if ranked[0][1] == 0:
        return "USD"
    return ranked[0][0]



def parse_currency_number(value):
    """
    Parse a numeric value that may include currency symbols, labels, and separators.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None

    text = str(value).strip()
    if not text:
        return None

    negative = text.startswith("(") and text.endswith(")")
    if negative:
        text = text[1:-1]

    # Keep digits and common decimal/thousand separators only.
    text = re.sub(r"[^0-9,.-]", "", text)
    if not text:
        return None

    # Common case: both separators present -> commas are thousands separators.
    if "," in text and "." in text:
        text = text.replace(",", "")
    # If only commas exist, treat as thousands separators for this dataset profile.
    elif "," in text:
        text = text.replace(",", "")

    try:
        number = float(text)
    except ValueError:
        return None

    return -number if negative else number



def normalize_money_columns(df):
    """
    Coerce money-like columns to numeric values where possible.
    """
    out = df.copy()
    for col in out.columns:
        if not _is_money_like_column(col):
            continue
        out[col] = out[col].apply(parse_currency_number)
    return out
