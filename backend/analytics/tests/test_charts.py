"""Tests for analytics.charts."""
import pandas as pd
from django.test import TestCase

from analytics.charts import linechart


class LinechartTestCase(TestCase):
    """Test linechart with minimal DataFrame."""

    def test_linechart_returns_revenue_profit_date(self):
        df = pd.DataFrame({
            "revenue": [100, 200],
            "profit": [10, 20],
            "date": ["2024-01-01", "2024-01-02"],
        })
        result = linechart(df)
        self.assertEqual(result["revenue_data"], [100.0, 200.0])
        self.assertEqual(result["profit_data"], [10.0, 20.0])
        self.assertEqual(result["date_data"], ["2024-01-01", "2024-01-02"])

    def test_linechart_missing_columns_raises(self):
        df = pd.DataFrame({"revenue": [1], "profit": [2]})
        with self.assertRaises(ValueError) as ctx:
            linechart(df)
        self.assertIn("Missing columns", str(ctx.exception))
