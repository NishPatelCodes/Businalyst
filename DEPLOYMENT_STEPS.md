# Complete Deployment Guide - Step by Step

This guide will walk you through deploying your Businalyst application with detailed explanations for each step.

---

## Step 1: Set Up OAuth Credentials

### 1.1 Google OAuth Setup

#### What is OAuth?
OAuth allows users to log in using their Google account instead of creating a new password. Google handles authentication and provides user information to your app.

#### Detailed Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Project name: `Businalyst` (or any name you prefer)
   - Click "Create"
   - Wait for project creation (takes a few seconds)

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on "Google+ API" or "Google Identity API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: "External" (unless you have Google Workspace)
     - App name: "Businalyst"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue"
     - Scopes: Click "Save and Continue" (default is fine)
     - Test users: Add your email, click "Save and Continue"
     - Click "Back to Dashboard"

5. **Create OAuth Client ID**
   - Application type: "Web application"
   - Name: "Businalyst Web Client"
   - Authorized JavaScript origins:
     - Add: `http://localhost:5173` (for local development)
     - Add: `https://www.businalyst.com` (your production domain)
   - Authorized redirect URIs:
     - Add: `http://localhost:8000/api/auth/google/callback` (local backend)
     - Add: `https://your-backend-url.railway.app/api/auth/google/callback` (production - you'll get this URL after deploying)
   - Click "Create"
   - **IMPORTANT**: Copy the "Client ID" and "Client Secret" - you'll need these later!

#### What to Save:
- `GOOGLE_CLIENT_ID`: The Client ID you just copied
- `GOOGLE_CLIENT_SECRET`: The Client Secret you just copied

---

### 1.2 GitHub OAuth Setup

#### What is GitHub OAuth?
Similar to Google, this allows users to log in with their GitHub account.

#### Detailed Steps:

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/developers
   - Sign in to your GitHub account

2. **Create OAuth App**
   - Click "OAuth Apps" in the left sidebar
   - Click "New OAuth App"

3. **Fill in OAuth App Details**
   - Application name: "Businalyst"
   - Homepage URL: `https://www.businalyst.com` (or your domain)
   - Application description: "Businalyst Analytics Platform"
   - Authorization callback URL:
     - For local: `http://localhost:8000/api/auth/github/callback`
     - For production: `https://your-backend-url.railway.app/api/auth/github/callback`
   - Click "Register application"

4. **Get Credentials**
   - You'll see the "Client ID" immediately
   - Click "Generate a new client secret"
   - **IMPORTANT**: Copy both the Client ID and Client Secret - the secret is only shown once!

#### What to Save:
- `GITHUB_CLIENT_ID`: The Client ID
- `GITHUB_CLIENT_SECRET`: The Client Secret (save it immediately!)

---

## Step 2: Configure PostgreSQL Database

### 2.1 Understanding PostgreSQL
PostgreSQL is a database that stores user information (emails, names, OAuth provider data, etc.). You have two options:

### Option A: Use Railway PostgreSQL (Recommended - Easiest)

#### Why Railway?
- Free tier available
- Automatically managed
- Easy to set up
- Works seamlessly with Railway backend deployment

#### Detailed Steps:

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up/Login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" (if you've connected GitHub)
   - OR click "New Project" → "Empty Project"

3. **Add PostgreSQL Database**
   - In your project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically create a PostgreSQL database

4. **Get Database Connection String**
   - Click on the PostgreSQL service
   - Go to the "Variables" tab
   - Find `DATABASE_URL` - this is your connection string
   - It looks like: `postgresql://postgres:password@hostname:port/railway`
   - **Copy this entire string** - you'll need it!

### Option B: Use External PostgreSQL (Alternative)

If you prefer to use a different PostgreSQL provider (like Supabase, Neon, or your own server):

1. **Set up your PostgreSQL database** (follow your provider's instructions)
2. **Get the connection string** from your provider
3. **Format**: `postgresql://username:password@hostname:port/database_name`

---

## Step 3: Run Database Migrations

### 3.1 What are Migrations?
Migrations create the database tables (like the `users` table) based on your code. Think of it as setting up the structure of your database.

### 3.2 Detailed Steps:

#### Option A: Run Locally (Before Deployment)

1. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set Environment Variables Locally**
   - Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost/dbname
   SECRET_KEY=your-secret-key-here-make-it-long-and-random
   ```
   - Generate a secret key: You can use Python:
     ```python
     import secrets
     print(secrets.token_urlsafe(32))
     ```

3. **Run Migration**
   ```bash
   cd backend
   alembic upgrade head
   ```
   - This creates the `users` table in your database
   - You should see: `INFO  [alembic.runtime.migration] Running upgrade -> 001_initial, Initial migration - create users table`

#### Option B: Run on Railway (After Deployment)

1. **Deploy your backend first** (see Step 5)
2. **Use Railway CLI**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Link to your project
   railway link
   
   # Run migration
   railway run alembic upgrade head
   ```

#### Option C: Run via Railway Dashboard

1. After deploying, go to your Railway backend service
2. Click on the service → "Deployments" → "View Logs"
3. You can run commands in the Railway shell (if available)

---

## Step 4: Set Environment Variables

### 4.1 What are Environment Variables?
These are configuration values that your application needs but shouldn't be hardcoded (like API keys, database URLs). They're stored securely and can be different for development vs production.

### 4.2 Backend Environment Variables (Railway)

#### Detailed Steps:

1. **Go to Railway Dashboard**
   - Navigate to your backend service
   - Click on the service

2. **Open Variables Tab**
   - Click on "Variables" tab
   - You'll see a list of environment variables

3. **Add Each Variable**
   Click "New Variable" for each of these:

   | Variable Name | Value | Where to Get It |
   |--------------|-------|----------------|
   | `DATABASE_URL` | Your PostgreSQL connection string | From Step 2 (Railway PostgreSQL service) |
   | `SECRET_KEY` | A long random string | Generate using: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
   | `GOOGLE_CLIENT_ID` | Your Google Client ID | From Step 1.1 |
   | `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | From Step 1.1 |
   | `GITHUB_CLIENT_ID` | Your GitHub Client ID | From Step 1.2 |
   | `GITHUB_CLIENT_SECRET` | Your GitHub Client Secret | From Step 1.2 |
   | `FRONTEND_URL` | `https://www.businalyst.com` | Your frontend domain (or Vercel URL) |
   | `BACKEND_URL` | Your Railway backend URL | You'll get this after deployment (e.g., `https://businalyst-api.railway.app`) |

4. **Important Notes:**
   - **SECRET_KEY**: Must be a long, random string. Never share this!
   - **FRONTEND_URL**: Use your production domain or Vercel preview URL
   - **BACKEND_URL**: Update this after you deploy and get your Railway URL
   - Railway will automatically restart your service when you add variables

### 4.3 Frontend Environment Variables (Vercel)

#### Detailed Steps:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Navigate to your project

2. **Open Project Settings**
   - Click on your project
   - Go to "Settings" → "Environment Variables"

3. **Add Environment Variables**
   Click "Add New" for each:

   | Variable Name | Value | Example |
   |--------------|-------|---------|
   | `VITE_API_URL` | Your backend API URL | `https://businalyst-api.railway.app` |

4. **Set for All Environments**
   - Make sure to select: "Production", "Preview", and "Development"
   - Click "Save"

5. **Redeploy**
   - After adding variables, go to "Deployments"
   - Click the three dots on the latest deployment → "Redeploy"
   - This ensures the new variables are loaded

---

## Step 5: Deploy to Railway (Backend)

### 5.1 What is Railway?
Railway is a platform that hosts your backend application. It automatically builds and deploys your code.

### 5.2 Detailed Steps:

1. **Prepare Your Repository**
   - Make sure your code is pushed to GitHub
   - Ensure `backend/` directory has:
     - `Procfile` (already created)
     - `requirements.txt` (already created)
     - All your code files

2. **Create Railway Account**
   - Visit: https://railway.app
   - Click "Start a New Project"
   - Sign up with GitHub (recommended)

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Businalyst repository
   - Railway will detect it's a Python project

4. **Configure Service**
   - Railway should auto-detect your backend
   - If not, click "+ New" → "GitHub Repo" → Select your repo
   - Set "Root Directory" to: `backend`
   - Railway will automatically:
     - Detect Python
     - Install dependencies from `requirements.txt`
     - Run the command from `Procfile`

5. **Set Up PostgreSQL (If Not Done)**
   - In the same project, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - This creates a PostgreSQL database
   - Copy the `DATABASE_URL` from the Variables tab

6. **Configure Environment Variables**
   - Go to your backend service → "Variables" tab
   - Add all variables from Step 4.2
   - **Important**: Add `DATABASE_URL` from your PostgreSQL service

7. **Get Your Backend URL**
   - After deployment, Railway will provide a URL
   - It looks like: `https://your-service-name.railway.app`
   - Click on your service → "Settings" → "Generate Domain"
   - Copy this URL - you'll need it for:
     - Frontend `VITE_API_URL`
     - OAuth redirect URIs (update in Google/GitHub)

8. **Update OAuth Redirect URIs**
   - Go back to Google Cloud Console
   - Update the redirect URI to: `https://your-railway-url.railway.app/api/auth/google/callback`
   - Do the same for GitHub OAuth App

9. **Verify Deployment**
   - Visit: `https://your-railway-url.railway.app/health`
   - You should see: `{"status": "healthy", "service": "Businalyst API"}`
   - Visit: `https://your-railway-url.railway.app/docs`
   - You should see the FastAPI documentation

10. **Run Migrations**
    - Use Railway CLI (see Step 3.2, Option B)
    - OR wait and we'll set up automatic migrations

---

## Step 6: Deploy to Vercel (Frontend)

### 6.1 What is Vercel?
Vercel is a platform that hosts your React frontend. It's optimized for frontend applications and provides fast global CDN.

### 6.2 Detailed Steps:

1. **Prepare Your Repository**
   - Ensure `frontend/` directory has:
     - `package.json`
     - `vercel.json` (already created)
     - All React code

2. **Create Vercel Account**
   - Visit: https://vercel.com
   - Click "Sign Up"
   - Sign up with GitHub (recommended)

3. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select your Businalyst repository

4. **Configure Project Settings**
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (should auto-fill)
   - **Output Directory**: `dist` (should auto-fill)
   - **Install Command**: `npm install` (should auto-fill)

5. **Set Environment Variables**
   - Before deploying, click "Environment Variables"
   - Add `VITE_API_URL` = Your Railway backend URL
   - Example: `https://businalyst-api.railway.app`
   - Make sure it's set for: Production, Preview, Development

6. **Deploy**
   - Click "Deploy"
   - Vercel will:
     - Install dependencies
     - Build your React app
     - Deploy to a URL like: `https://businalyst-xyz.vercel.app`

7. **Configure Custom Domain (Optional)**
   - After deployment, go to "Settings" → "Domains"
   - Click "Add Domain"
   - Enter: `www.businalyst.com`
   - Follow DNS configuration instructions
   - Add the DNS records at your domain registrar

8. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` environment variable to your Vercel URL or domain
   - Railway will restart the service

9. **Verify Deployment**
   - Visit your Vercel URL
   - You should see the login page
   - Try logging in (it should work!)

---

## Step 7: Final Configuration & Testing

### 7.1 Update All URLs

After both deployments, make sure all URLs are consistent:

1. **Backend (Railway)**
   - Update `FRONTEND_URL` to your Vercel domain
   - Update `BACKEND_URL` to your Railway URL

2. **Frontend (Vercel)**
   - Update `VITE_API_URL` to your Railway backend URL

3. **OAuth Providers**
   - **Google**: Update redirect URIs in Google Cloud Console
   - **GitHub**: Update callback URL in GitHub OAuth App settings

### 7.2 Test Everything

1. **Test Backend**
   - Visit: `https://your-backend.railway.app/health` → Should return healthy
   - Visit: `https://your-backend.railway.app/docs` → Should show API docs

2. **Test Frontend**
   - Visit your Vercel URL
   - Should show login page

3. **Test Authentication**
   - Try email/password registration
   - Try email/password login
   - Try Google OAuth (click "Log in with Google")
   - Try GitHub OAuth (click "Log in with GitHub")

4. **Test Protected Routes**
   - After login, should redirect to dashboard
   - Try logging out
   - Should redirect back to login

### 7.3 Common Issues & Solutions

**Issue: CORS errors**
- Solution: Make sure `FRONTEND_URL` in backend matches your frontend URL exactly

**Issue: OAuth redirect not working**
- Solution: Check that redirect URIs in Google/GitHub match your backend URL exactly

**Issue: Database connection errors**
- Solution: Verify `DATABASE_URL` is correct and database is accessible

**Issue: Environment variables not loading**
- Solution: Redeploy after adding environment variables

---

## Quick Reference Checklist

- [ ] Google OAuth credentials created
- [ ] GitHub OAuth credentials created
- [ ] PostgreSQL database set up (Railway or external)
- [ ] Database migrations run (`alembic upgrade head`)
- [ ] Backend environment variables set in Railway
- [ ] Frontend environment variables set in Vercel
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] OAuth redirect URIs updated
- [ ] Custom domain configured (optional)
- [ ] All URLs updated and consistent
- [ ] Tested email/password authentication
- [ ] Tested Google OAuth
- [ ] Tested GitHub OAuth
- [ ] Tested protected routes

---

## Need Help?

If you encounter issues:
1. Check Railway logs: Railway Dashboard → Your Service → "Deployments" → "View Logs"
2. Check Vercel logs: Vercel Dashboard → Your Project → "Deployments" → Click deployment → "View Function Logs"
3. Verify all environment variables are set correctly
4. Make sure all URLs match exactly (no trailing slashes, correct protocol)

---

**Congratulations!** Your Businalyst application should now be fully deployed and functional! 🎉

