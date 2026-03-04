# Businalyst Backend — Beginner's Guide

This document explains the **Businalyst backend** for someone new to Django. You'll learn what the project does, how it's structured, and how to run and extend it.

---

## What does this backend do?

The backend is a **Django project** that provides one main feature:

- **Upload a data file** (CSV or Excel) and get back **analytics as JSON**.

There is **no database** for your data: each time the frontend sends a file, the server reads it, computes KPIs and chart/table data in memory, and returns a single JSON response. The frontend uses that response to render dashboards and charts.

---

## Tech stack (in simple terms)

| Piece | Role |
|-------|------|
| **Django** | Web framework: handles HTTP, URLs, settings, security. |
| **django-cors-headers** | Allows the React/Vite frontend (different port) to call this API. |
| **pandas** | Reads CSV/Excel and does aggregations (sums, groupby, etc.). |
| **openpyxl** | Lets pandas read `.xlsx` Excel files. |

---

## Project layout (high level)

```
backend/
├── manage.py              # Django’s CLI (run server, migrations, etc.)
├── requirements.txt      # Python dependencies
├── BACKEND_README.md      # This file
├── backend/               # Django “project” package (config + app code)
│   ├── settings.py        # Database, apps, CORS, secret key, etc.
│   ├── urls.py            # Root URL routing: /admin/, /upload/
│   ├── views.py           # Thin: re-exports upload_dataset for URLs
│   ├── api/               # HTTP layer
│   │   └── views.py       # upload_dataset: receives file, returns JSON
│   └── analytics/         # All “business logic” (no HTTP here)
│       ├── io.py          # Read CSV/Excel → DataFrame
│       ├── kpis.py        # Compute profit/revenue/orders/expense sums
│       ├── utils.py       # Column detection, JSON helpers
│       ├── constants.py   # Chart limits, colors, map coordinates
│       ├── charts.py      # Line, bar, pie, map data
│       ├── orders.py      # Orders trend, by status/channel/region, top products
│       └── tables.py      # Top-5-by-profit table, orders list
└── Data/                  # Optional sample CSVs (not part of Django)
```

- **`backend/`** is both the Django “project” and the only “app” in `INSTALLED_APPS`. All API and analytics code lives under this package.
- **`api/`** = HTTP only (request/response, status codes).
- **`analytics/`** = pure logic: takes a pandas DataFrame, returns dicts. No request/response.

---

## How a request is handled (flow)

1. **Frontend** sends `POST /upload/` with a file (e.g. `file=@data.csv`).
2. **`backend/urls.py`** routes `/upload/` to `views.upload_dataset` (which comes from `backend.api.views`).
3. **`api/views.py` — `upload_dataset`**:
   - Checks that the request is POST and has a file.
   - Calls **`read_uploaded_file(file)`** → gets a pandas **DataFrame** (columns lowercased).
   - Calls **`calculate_kpis(df)`** → gets `profit_sum`, `revenue_sum`, etc., and puts them in the response.
   - Calls each analytics component (line chart, bar, pie, map, tables, orders components). If one fails, it’s **logged** and that part is omitted from the JSON; the rest still runs.
   - Returns **JSON** with everything that succeeded.

So: **one endpoint, one big JSON payload** per upload.

---

## Main pieces explained (for beginners)

### 1. `backend/settings.py`

- **`INSTALLED_APPS`**: Includes `corsheaders` and `backend`. No separate “upload” app.
- **`CORS_ALLOWED_ORIGINS`**: Lists frontend origins (e.g. `http://localhost:5173`) so the browser allows API calls.
- **`SECRET_KEY` / `DEBUG`**: Can be overridden with environment variables (`DJANGO_SECRET_KEY`, `DJANGO_DEBUG`) for production.
- **`DATABASES`**: SQLite by default (used by Django admin/auth; your analytics data is not stored here).

### 2. `backend/urls.py`

- **`admin/`** → Django admin.
- **`upload/`** → `upload_dataset` in `backend.api.views` (exposed via `backend.views` for backward compatibility).

### 3. `backend/api/views.py`

- **`upload_dataset`**:
  - Only accepts **POST**.
  - Reads file with **`read_uploaded_file`**, computes **`calculate_kpis`**, then runs all chart/table/orders components.
  - Uses a small helper **`_merge_component`** so each component can fail independently and be logged without breaking the whole response.
  - Returns **400** for “no file” or validation errors, **500** for unexpected errors, **200** with JSON on success.

### 4. `backend/analytics/` (the “brain”)

- **`io.py`**  
  - **`read_uploaded_file(file)`**: Dispatches on file extension (`.csv` / `.xlsx` / `.xls`), uses pandas to read, lowercases column names. Raises `ValueError` for unsupported type.

- **`kpis.py`**  
  - **`calculate_kpis(df)`**: Expects columns `profit`, `revenue`, `orders`, `expense`. Converts them to numeric, sums them, adds row count as `customers_sum`. Raises if a required column is missing.

- **`utils.py`**  
  - **`find_date_col(df)`**: Finds a date-like column (e.g. `date`, `order date`).  
  - **`to_json_value(val)`**: Converts a cell value to something JSON-serializable (handles NaN, Timestamp, int, float).  
  - **`find_column_by_keywords(df, keywords)`**: Picks first column whose name contains any of the keywords (e.g. “status”, “channel”).  
  - **`is_numeric_column`**, **`is_geography_column`**, **`is_payment_column`**, **`is_bar_chart_categorical`**, **`is_good_categorical`**: Used to choose which columns to use for charts.  
  - **`dataframe_to_rows(df, columns)`**: Turns a DataFrame into a list of dicts with JSON-safe values (used by tables).

- **`constants.py`**  
  - Chart limits (`BAR_CHART_MAX_BARS`, `PIE_MAX_SEGMENTS`, `ORDERS_LIST_MAX`), keyword sets for column detection, colors for status/channel, and **map coordinates** (region/state/country → `[lng, lat]`) for the map chart.

- **`charts.py`**  
  - **`linechart(df)`**: Needs date + revenue + profit; returns `revenue_data`, `profit_data`, `date_data`.
  - **`bar_chart(df)`**: Picks a categorical column (e.g. product, category), aggregates by profit/revenue, returns top N bars.  
  - **`pie_chart_column(df)`**: Picks a categorical column (e.g. category, campaign), returns segment counts (top N + “Other”).  
  - **`map_data(df)`**: Picks region/state/country, aggregates revenue/profit per place, attaches coordinates from `constants`; returns list of `{name, value, coordinates}`.

- **`orders.py`**  
  - **`orders_trend_daily(df)`**: Orders (or row count) by day for line chart.  
  - **`orders_by_status_component`**, **`orders_by_channel_component`**, **`orders_by_region_component`**: For donut/bar/progress by status, channel, region.  
  - **`top_products_by_orders_component`**: Top products (or category) by orders and revenue for the orders overview table.

- **`tables.py`**  
  - **`table_component(df)`**: Top 5 rows by profit.  
  - **`orders_list_component(df)`**: Up to `ORDERS_LIST_MAX` rows, sorted by date or profit, for the orders list view.

---

## Expected data shape (for uploads)

- **Required columns** (for KPIs): `profit`, `revenue`, `orders`, `expense`.  
- **Useful for charts**: a **date** column (e.g. `date`, `order date`), and optional categorical columns like `product name`, `category`, `region`, `state`, `country`, `status`, `channel`, etc.  
- Column names are **lowercased** after read; the code looks for names like `product name`, `product_name`, `order date`, etc.

---

## How to run the backend

1. **Create a virtual environment** (recommended):
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate   # Windows
   # source .venv/bin/activate   # macOS/Linux
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the development server**:
   ```bash
   python manage.py runserver
   ```
   By default the API is at **http://127.0.0.1:8000/**.

4. **Test the upload endpoint** (example with curl):
   ```bash
   curl -X POST http://127.0.0.1:8000/upload/ -F "file=@Data/demo_data.csv"
   ```

---

## Optional: environment variables

For production (or to avoid hardcoding secrets):

- **`DJANGO_SECRET_KEY`**: Overrides the default secret key in `settings.py`.
- **`DJANGO_DEBUG`**: Set to `False`, `0`, or `no` to turn off debug mode.

You can use a `.env` file and load it with `python-dotenv` (not required for local dev).

---

## Where to add new features

| Goal | Where to change |
|------|------------------|
| New URL (e.g. `/api/health/`) | `backend/urls.py`; add a view in `api/views.py` (or new app). |
| New chart type | Add a function in `backend/analytics/charts.py` (or new module under `analytics/`), then call it from `upload_dataset` in `api/views.py` and merge the result into the payload. |
| New KPI | Extend `calculate_kpis` in `analytics/kpis.py` and include the new keys in the payload. |
| Support another file type | Extend `read_uploaded_file` in `analytics/io.py`. |
| New “column detection” rule | Add helpers in `analytics/utils.py` and use them in the relevant chart/table logic. |

---

## Summary

- **One main endpoint**: `POST /upload/` with a file → one JSON response with KPIs and all chart/table data.
- **No DB for your data**: Everything is computed from the uploaded file in memory.
- **Structure**: `api/` = HTTP; `analytics/` = file I/O, KPIs, charts, orders, tables; shared helpers and constants in `utils.py` and `constants.py`.
- **Errors**: File/KPI validation returns 400; component failures are logged and omitted from the response; other errors return 500.

This layout keeps the backend organized and easier to test and extend as you add more analytics or endpoints.
