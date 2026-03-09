# Businalyst - Simple Run Guide

Quick guide to get the Businalyst application up and running locally.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Database Migrations

```bash
cd backend
python manage.py migrate
```

### 3. Start the Backend Server

```bash
cd backend
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

- Upload endpoint: `POST http://localhost:8000/upload/`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Running Both Services

### Option 1: Two Terminal Windows

**Terminal 1 (Backend):**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option 2: Using Background Processes

**Windows PowerShell:**
```powershell
# Start backend
cd backend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "python manage.py runserver"

# Start frontend
cd frontend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

## Testing with Postman

The backend exposes a single endpoint:

- **Method**: `POST`
- **URL**: `http://127.0.0.1:8000/upload/`
- **Body**: `form-data`

| Key | Type | Description |
|-----|------|-------------|
| `file` | File | CSV or Excel file with your business data |
| `start_date` | Text | (Optional) Filter start date, e.g. `2024-01-01` |
| `end_date` | Text | (Optional) Filter end date, e.g. `2024-12-31` |

**Example response:**
```json
{
  "message": "File processed successfully",
  "revenue_sum": 123456.78,
  "profit_sum": 45678.90,
  "orders_sum": 500,
  ...
}
```

A sample data file (`demo_chart_data.csv`) is included in the root of the repository for testing.

## Verify Installation

1. Backend is running: the terminal shows `Starting development server at http://127.0.0.1:8000/`
2. Frontend is running: Visit `http://localhost:5173`

## Troubleshooting

### Backend Issues

- **Module not found**: Make sure you're in the `backend` directory and dependencies are installed
- **Port already in use**: Change the port with `python manage.py runserver 8001`

### Frontend Issues

- **npm install fails**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **Port already in use**: Vite will automatically use the next available port

## Production Build

### Backend
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

**Need Help?** Check the main README.md for more details.

