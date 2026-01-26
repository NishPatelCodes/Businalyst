# Deployment Guide for Businalyst

This guide will walk you through deploying your frontend and backend, and connecting your domain www.businalyst.com.

## Prerequisites

Before starting, make sure you have:
- [ ] A GitHub account (for version control)
- [ ] A Vercel account (for frontend deployment)
- [ ] A Railway or Render account (for backend deployment)
- [ ] Access to your domain DNS settings (www.businalyst.com)

---

## Step 1: Backend Deployment (FastAPI)

### Option A: Railway (Recommended - Easy Setup)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the `backend/` directory as the root

3. **Configure Deployment**
   - Railway will auto-detect the `Procfile`
   - It will automatically install dependencies from `requirements.txt`
   - The app will deploy automatically

4. **Get Your Backend URL**
   - After deployment, Railway will provide a URL like: `https://your-app-name.up.railway.app`
   - Copy this URL - you'll need it for frontend configuration

5. **Set Environment Variables (if needed)**
   - Go to your project settings
   - Add any environment variables from `backend/.env.example`

### Option B: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set:
     - **Name**: businalyst-api
     - **Root Directory**: `backend`
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

3. **Deploy**
   - Click "Create Web Service"
   - Render will deploy your backend

4. **Get Your Backend URL**
   - Render will provide a URL like: `https://businalyst-api.onrender.com`
   - Copy this URL

---

## Step 2: Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = Your backend URL from Step 1
   - Example: `VITE_API_URL=https://your-app-name.up.railway.app`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - You'll get a URL like: `https://your-project.vercel.app`

---

## Step 3: Domain Configuration

### 3.1 Connect Domain to Vercel (Frontend)

1. **In Vercel Dashboard**
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter: `www.businalyst.com`
   - Click "Add"

2. **Configure DNS (At Your Domain Registrar)**
   - Vercel will show you DNS records to add
   - Typically you need to add:
     - **Type**: A or CNAME
     - **Name**: www
     - **Value**: Vercel's provided value
   - Save the DNS records

3. **Wait for DNS Propagation**
   - This can take 5 minutes to 48 hours
   - Vercel will show when the domain is connected

### 3.2 Connect Subdomain for Backend (Optional)

If you want `api.businalyst.com` for your backend:

**For Railway:**
- Go to your Railway project → Settings → Domains
- Add custom domain: `api.businalyst.com`
- Add the CNAME record Railway provides to your DNS

**For Render:**
- Go to your Render service → Settings → Custom Domain
- Add: `api.businalyst.com`
- Add the CNAME record Render provides to your DNS

---

## Step 4: Update CORS Configuration

After you have your frontend URL, update the backend CORS settings:

1. **Edit `backend/app.py`**
   - Find the `allow_origins` in CORS middleware
   - Replace `["*"]` with your frontend URL:
     ```python
     allow_origins=["https://www.businalyst.com", "https://your-project.vercel.app"]
     ```

2. **Redeploy Backend**
   - Push changes to GitHub
   - Railway/Render will auto-deploy

---

## Step 5: Verify Deployment

### Test Frontend
- Visit: `https://www.businalyst.com`
- Should see "Businalyst - Coming Soon" page

### Test Backend
- Visit: `https://your-backend-url/health`
- Should see: `{"status": "healthy", "service": "Businalyst API"}`

### Test API Connection
- Check browser console on frontend
- Make sure there are no CORS errors

---

## Troubleshooting

### Frontend not building
- Check Vercel build logs
- Ensure `package.json` has correct build script
- Verify Node.js version in Vercel settings

### Backend not starting
- Check Railway/Render logs
- Verify `Procfile` is correct
- Ensure `requirements.txt` has all dependencies
- Check that `app.py` exists in backend directory

### Domain not connecting
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records are correct
- Check domain registrar settings

### CORS errors
- Update `allow_origins` in `backend/app.py`
- Include both production and development URLs
- Redeploy backend after changes

---

## Next Steps

Once deployment is working:
1. Start building your actual application
2. Add more API endpoints to `backend/app.py`
3. Build React components in `frontend/src/`
4. Configure environment variables as needed
5. Set up CI/CD if desired

---

## Support

If you encounter issues:
- Check deployment platform logs
- Verify all configuration files are correct
- Ensure GitHub repository is properly connected
- Review DNS settings at your domain registrar

