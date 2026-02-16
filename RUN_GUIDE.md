# Businalyst - Simple Run Guide

Quick guide to get the Businalyst application up and running locally.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ and npm installed
- PostgreSQL database (or use a cloud database)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Create Environment File

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/businalyst

# Security
SECRET_KEY=your-secret-key-here-generate-a-random-string

# OAuth (Optional - only if using OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Frontend URL (default)
FRONTEND_URL=http://localhost:5173
```

**Note:** Generate a secure `SECRET_KEY` using:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

### 4. Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

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
uvicorn app.main:app --reload
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
cd backend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "uvicorn app.main:app --reload"

# Start frontend
cd frontend; Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
```

## Verify Installation

1. Backend is running: Visit `http://localhost:8000/health`
2. Frontend is running: Visit `http://localhost:5173`
3. API Docs: Visit `http://localhost:8000/docs`

## Troubleshooting

### Backend Issues

- **Database connection error**: Check your `DATABASE_URL` in `.env` file
- **Module not found**: Make sure you're in the `backend` directory and dependencies are installed
- **Port already in use**: Change the port with `--port 8001` flag

### Frontend Issues

- **npm install fails**: Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **Port already in use**: Vite will automatically use the next available port

## Production Build

### Backend
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

**Need Help?** Check the main README.md or IMPLEMENTATION_SUMMARY.md for more details.
