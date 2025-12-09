# Deployment Steps: Railway + Supabase + Vercel

## 🎯 Stack Overview
- **Frontend**: Vercel (Next.js)
- **Backend**: Railway (FastAPI)
- **Database**: Supabase (PostgreSQL)

---

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: `easeevocab` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 1.2 Get Database Connection String
1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password
5. **Save this** - you'll need it for Railway

### 1.3 Run Database Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. We'll run migrations via Railway (easier), but you can also run them here if needed

---

## Step 2: Deploy Backend to Railway

### 2.1 Prepare Repository
1. Make sure your code is pushed to GitHub
2. Ensure `railway.json` exists in root (already created)

### 2.2 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 2.3 Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `memocross` repository
4. Railway will detect it's a Python project

### 2.4 Configure Backend Service
1. Railway will create a service automatically
2. Click on the service to configure it

### 2.5 Set Environment Variables
In Railway service settings, go to **Variables** tab and add:

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# JWT Security
JWT_SECRET=generate-a-random-secret-key-here-min-32-chars
JWT_ALGORITHM=HS256

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS (will update after frontend is deployed)
CORS_ORIGINS=https://your-app.vercel.app
```

**To generate JWT_SECRET:**
```bash
# Run this in terminal:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.6 Configure Build Settings
1. Go to **Settings** → **Build**
2. Railway should auto-detect, but verify:
   - **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2.7 Deploy
1. Railway will automatically deploy
2. Wait for build to complete
3. Check **Deployments** tab for logs
4. Once deployed, Railway will give you a URL like: `https://your-app.up.railway.app`

### 2.8 Test Backend
```bash
# Test health endpoint
curl https://your-app.up.railway.app/

# Should return: {"message":"EaseeVocab API running"}
```

### 2.9 Run Database Migrations
If migrations didn't run automatically:
1. In Railway, go to your service
2. Click **"Deployments"** → **"View Logs"**
3. Check if migrations ran (look for "alembic upgrade head")
4. If not, you can run manually:
   - Go to **Settings** → **Connect** → **Add PostgreSQL** (temporary)
   - Or use Railway CLI: `railway run alembic upgrade head`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
1. Make sure `frontend/` folder is in your repo
2. Ensure `package.json` exists in `frontend/`

### 3.2 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 3.3 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your `memocross` repository
3. Vercel will detect it's a Next.js project

### 3.4 Configure Project
1. **Root Directory**: Set to `frontend`
2. **Framework Preset**: Next.js (auto-detected)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### 3.5 Set Environment Variables
In Vercel project settings, go to **Environment Variables** and add:

```bash
# API URL (from Railway)
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3.6 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Vercel will give you a URL like: `https://your-app.vercel.app`

### 3.7 Update CORS in Backend
1. Go back to Railway
2. Update `CORS_ORIGINS` environment variable:
   ```bash
   CORS_ORIGINS=https://your-app.vercel.app,https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

---

## Step 4: Configure Google OAuth

### 4.1 Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized redirect URIs**:
   - `http://localhost:3000` (dev)
   - `https://your-app.vercel.app` (production)
6. Add to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
7. Save changes

---

## Step 5: Verify Everything Works

### 5.1 Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Should load the dashboard
3. Try selecting language and level
4. Navigate to learn page

### 5.2 Test Backend API
```bash
# Test from terminal
curl https://your-app.up.railway.app/

# Test mnemonic generation (if you have auth set up)
curl -X POST https://your-app.up.railway.app/mnemonic/generate-text \
  -H "Content-Type: application/json" \
  -d '{"word": "plato", "definition": "plate", "language": "es"}'
```

### 5.3 Test Database Connection
1. In Supabase dashboard, go to **Table Editor**
2. You should see tables:
   - `users`
   - `vocabulary`
   - `mnemonic_cache`
   - `user_word_history`
   - etc.

### 5.4 Test Mnemonic Caching
1. Generate a mnemonic for a word
2. Check Supabase **Table Editor** → `mnemonic_cache`
3. You should see a new entry
4. Generate the same word again - should be instant (cached)

---

## Step 6: Set Up Custom Domain (Optional)

### 6.1 Vercel Custom Domain
1. In Vercel project, go to **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions

### 6.2 Update Environment Variables
After adding custom domain:
1. Update `CORS_ORIGINS` in Railway:
   ```bash
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```
2. Update `NEXT_PUBLIC_API_URL` in Vercel (if needed)

---

## Step 7: Monitor & Maintain

### 7.1 Monitor Database Size
1. In Supabase dashboard, go to **Settings** → **Database**
2. Check **Database size**
3. Free tier: 500MB limit
4. If approaching limit, run cleanup script (see below)

### 7.2 Set Up Cache Cleanup (Optional)
To prevent database from growing too large:

**Option A: Manual Cleanup**
```bash
# SSH into Railway or use Railway CLI
railway run python -m app.scripts.cleanup_old_cache --days 90
```

**Option B: Scheduled Cleanup**
1. Use external cron service: [cron-job.org](https://cron-job.org) (free)
2. Create endpoint in backend for cleanup
3. Call it weekly via cron

### 7.3 Monitor Railway Usage
1. Railway dashboard shows usage
2. Free tier: $5 credit/month
3. Monitor in **Usage** tab

### 7.4 Monitor Vercel Usage
1. Vercel dashboard shows bandwidth
2. Free tier: 100GB/month
3. Usually plenty for MVP

---

## Troubleshooting

### Backend won't start
- Check Railway logs: **Deployments** → **View Logs**
- Verify all environment variables are set
- Check if migrations ran successfully

### Database connection errors
- Verify `DATABASE_URL` is correct (from Supabase)
- Check if password is URL-encoded (replace special chars with % encoding)
- Ensure Supabase project is active

### CORS errors
- Verify `CORS_ORIGINS` includes your Vercel URL
- Check frontend `NEXT_PUBLIC_API_URL` is correct
- Ensure no trailing slashes in URLs

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Verify backend is running (check Railway URL)
- Check browser console for errors

### Migrations not running
- Check Railway build logs
- Run manually: `railway run alembic upgrade head`
- Or connect to Supabase and run SQL directly

---

## Quick Reference: URLs to Save

- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Railway)**: `https://your-app.up.railway.app`
- **Database (Supabase)**: `db.xxxxx.supabase.co:5432`
- **Supabase Dashboard**: `https://app.supabase.com/project/your-project`

---

## Next Steps After Deployment

1. ✅ Test all features end-to-end
2. ✅ Monitor database size weekly
3. ✅ Set up error tracking (optional: Sentry)
4. ✅ Set up analytics (optional: Vercel Analytics)
5. ✅ Configure custom domain (if you have one)
6. ✅ Set up cache cleanup schedule (when needed)

---

## Cost Summary

**Free Tier Limits:**
- **Vercel**: 100GB bandwidth/month ✅
- **Railway**: $5 credit/month (usually enough for MVP) ✅
- **Supabase**: 500MB database, 2GB bandwidth ✅

**Total: $0/month** for MVP scale! 🎉

---

Good luck with your deployment! 🚀

