"""Tests for analytics.kpis."""
import pandas as pd
from django.test import TestCase

from analytics.kpis import calculate_kpis


class CalculateKpisTestCase(TestCase):
    """Test calculate_kpis with minimal DataFrame."""

    def test_required_columns_return_sums(self):
        df = pd.DataFrame({
            "profit": [10, 20, 30],
            "revenue": [100, 200, 300],
            "orders": [1, 2, 3],
            "expense": [5, 10, 15],
        })
        result = calculate_kpis(df)
        self.assertEqual(result["profit_sum"], 60.0)
        self.assertEqual(result["revenue_sum"], 600.0)
        self.assertEqual(result["orders_sum"], 6.0)
        self.assertEqual(result["expense_sum"], 30.0)
        self.assertEqual(result["customers_sum"], 3)

    def test_missing_columns_raises(self):
        df = pd.DataFrame({"profit": [1], "revenue": [2]})
        with self.assertRaises(ValueError) as ctx:
            calculate_kpis(df)
        self.assertIn("Missing columns", str(ctx.exception))
