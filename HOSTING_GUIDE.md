# Hosting Guide for EaseeVocab

## 🎯 Recommended Free Hosting Stack

### **Frontend (Next.js)**
**Recommended: Vercel** ⭐
- ✅ Free tier: Unlimited projects, 100GB bandwidth
- ✅ Automatic deployments from GitHub
- ✅ Built-in CDN
- ✅ Environment variables support
- ✅ Custom domains
- **Setup**: Connect GitHub repo → Auto-deploy

**Alternative: Netlify**
- ✅ Free tier: 100GB bandwidth, 300 build minutes/month
- ✅ Good for Next.js

### **Backend (FastAPI)**
**Recommended: Railway** ⭐
- ✅ Free tier: $5 credit/month (usually enough for small apps)
- ✅ Easy PostgreSQL add-on
- ✅ Automatic deployments
- ✅ Environment variables
- ✅ Free tier includes 500MB database

**Alternative: Render**
- ✅ Free tier: 750 hours/month (sleeps after 15min inactivity)
- ✅ Free PostgreSQL (90 days, then $7/month)
- ⚠️ Cold starts can be slow

**Alternative: Fly.io**
- ✅ Free tier: 3 shared VMs
- ✅ Good performance
- ⚠️ More complex setup

### **Database (PostgreSQL)**
**Recommended: Supabase** ⭐
- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ PostgreSQL with connection pooling
- ✅ Built-in auth (if needed later)
- ✅ Dashboard for database management

**Alternative: Neon**
- ✅ Free tier: 3GB storage, serverless PostgreSQL
- ✅ Auto-scaling
- ✅ Branching (like Git for databases)

**Alternative: Railway/Render PostgreSQL**
- ✅ Included with hosting service
- ✅ Simpler setup (one less service)

## 📋 Pre-Deployment Checklist

### 1. **Environment Variables**

Create `.env.example` files:

**Backend `.env.example`:**
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_ALGORITHM=HS256

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS (comma-separated origins)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Frontend `.env.example`:**
```bash
# API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. **Database Migrations**

Before deploying, ensure migrations are ready:

```bash
cd backend
# Test migrations locally first
alembic upgrade head
```

**On production**, you'll need to run migrations:
- Railway/Render: Add migration step to startup script
- Or run manually: `alembic upgrade head`

### 3. **Mnemonic Caching Considerations**

**Current Setup:**
- Images stored as base64 in PostgreSQL `Text` column
- Each image ~50-200KB as base64
- Caching works great for repeated words

**Free Tier Limitations:**
- **Supabase**: 500MB database limit
- **Neon**: 3GB storage
- **Railway**: 500MB included

**Storage Math:**
- 1,000 cached images × 100KB average = ~100MB
- 5,000 cached images = ~500MB
- **Recommendation**: Monitor database size, implement cleanup for old entries

**Optimization Options:**

1. **Add Cache Cleanup** (Recommended)
   ```python
   # Delete entries older than 90 days
   # Run as scheduled task
   ```

2. **Compress Images** (Future)
   - Store as WebP instead of PNG
   - Reduce quality slightly
   - Can save 30-50% storage

3. **External Image Storage** (Future - if needed)
   - Use Cloudinary (free tier: 25GB)
   - Store URLs instead of base64
   - Better for scaling

### 4. **CORS Configuration**

Update `CORS_ORIGINS` in backend:
```bash
CORS_ORIGINS=https://your-app.vercel.app,https://yourdomain.com
```

### 5. **Google OAuth Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URIs:
   - `http://localhost:3000` (dev)
   - `https://your-app.vercel.app` (prod)
3. Update `GOOGLE_CLIENT_ID` in both frontend and backend

## 🚀 Deployment Steps

### **Option A: Railway (Recommended)**

#### Backend:
1. Sign up at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Add PostgreSQL service
5. Set environment variables
6. Railway auto-detects FastAPI, runs `uvicorn app.main:app`

#### Frontend:
1. Sign up at [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set environment variables
4. Deploy!

### **Option B: Render**

#### Backend:
1. Sign up at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add PostgreSQL database
7. Set environment variables

#### Frontend:
1. New → Static Site (or Web Service for Next.js)
2. Connect GitHub repo
3. Build: `npm run build`
4. Publish: `.next`
5. Set environment variables

## 🔧 Post-Deployment Tasks

### 1. **Run Database Migrations**

On Railway/Render, add to startup or run manually:
```bash
cd backend
alembic upgrade head
```

### 2. **Test API Endpoints**

```bash
# Health check
curl https://your-backend.railway.app/

# Test mnemonic generation
curl -X POST https://your-backend.railway.app/mnemonic/generate-text \
  -H "Content-Type: application/json" \
  -d '{"word": "plato", "definition": "plate", "language": "es"}'
```

### 3. **Monitor Database Size**

Check database size regularly:
```sql
SELECT pg_size_pretty(pg_database_size('your_database_name'));
```

### 4. **Set Up Monitoring** (Optional)

- Railway: Built-in metrics
- Render: Built-in logs
- Add error tracking: Sentry (free tier)

## 💾 Mnemonic Caching Strategy

### **How It Works in Production:**

1. **First Request** (Word not cached):
   - User requests mnemonic for "plato"
   - Backend generates text (~2 sec)
   - Backend generates image (~8 sec)
   - Stores in database with hash key
   - Returns to user

2. **Subsequent Requests** (Word cached):
   - User requests same word
   - Backend checks database by hash
   - Returns cached text + image instantly
   - **No API calls to Gemini = saves money!**

### **Cache Key Structure:**
```
word_hash (SHA256 of "plato") 
+ language ("es" or "fr") 
+ definition_hash (SHA256 of definition)
= Unique cache entry
```

### **Storage Optimization:**

**Add cleanup script** (recommended):
```python
# backend/app/scripts/cleanup_old_cache.py
from datetime import datetime, timedelta
from app.core.db import SessionLocal
from app.models.mnemonic_cache import MnemonicCache

def cleanup_old_cache(days=90):
    """Delete cache entries older than specified days."""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        deleted = db.query(MnemonicCache).filter(
            MnemonicCache.created_at < cutoff
        ).delete()
        db.commit()
        print(f"Deleted {deleted} old cache entries")
    finally:
        db.close()
```

**Run as scheduled task:**
- Railway: Use Cron Jobs (paid) or external cron service
- Render: Use Cron Jobs add-on
- Or: Add endpoint and call via external cron (cron-job.org - free)

## ⚠️ Important Considerations

### **Free Tier Limitations:**

1. **Database Size:**
   - Monitor regularly
   - Implement cleanup for old entries
   - Consider image compression if needed

2. **API Rate Limits:**
   - Gemini API has rate limits
   - Caching helps reduce API calls
   - Monitor usage in Google Cloud Console

3. **Cold Starts (Render):**
   - Free tier sleeps after 15min inactivity
   - First request after sleep = slow (~30 sec)
   - Railway doesn't have this issue

4. **Bandwidth:**
   - Vercel: 100GB/month (usually enough)
   - Monitor usage in dashboard

### **Cost Optimization:**

1. **Caching is Key:**
   - Reduces Gemini API calls
   - Faster responses
   - Lower costs

2. **Image Storage:**
   - Base64 in DB works for MVP
   - Consider external storage if database grows

3. **Database:**
   - Free tiers usually sufficient for MVP
   - Upgrade when needed (usually $5-10/month)

## 📝 Quick Start Commands

### **Local Testing Before Deploy:**

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### **Production Build:**

```bash
# Backend - Railway/Render auto-builds
# Just ensure requirements.txt is up to date

# Frontend
cd frontend
npm run build
# Vercel auto-builds on deploy
```

## 🎯 Recommended Setup for MVP

1. **Frontend**: Vercel (free, perfect for Next.js)
2. **Backend**: Railway (free tier, no cold starts)
3. **Database**: Railway PostgreSQL (included) or Supabase (free tier)
4. **Monitoring**: Built-in dashboards

**Total Cost: $0/month** (for MVP scale)

## 🔄 Migration Path (When You Grow)

1. **Database > 500MB**: Upgrade to paid tier ($5-10/month)
2. **High Traffic**: Upgrade Vercel Pro ($20/month) or keep free
3. **Image Storage**: Move to Cloudinary when DB gets large
4. **CDN**: Already included with Vercel

---

## 📞 Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

