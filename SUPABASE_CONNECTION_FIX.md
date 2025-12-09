# Supabase Connection Fix for Railway

## ❌ Current Error
```
connection to server at "db.lgelyyfuanbfektgtchp.supabase.co" failed: Network is unreachable
```

## 🔍 Possible Causes & Solutions

### 1. Supabase Project is Paused (Most Common)

**Free tier projects pause after 1 week of inactivity**

**Fix:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Find your project
3. If it shows "Paused" or "Inactive", click **"Restore"** or **"Resume"**
4. Wait 1-2 minutes for project to restart
5. Railway should now be able to connect

---

### 2. Wrong Connection String Format

**Check your DATABASE_URL in Railway:**

**Correct Format:**
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**Common Issues:**
- ❌ Missing `postgresql://` prefix
- ❌ Wrong password (must match Supabase project password)
- ❌ Wrong port (should be 5432)
- ❌ Special characters in password not URL-encoded

**How to Get Correct Connection String:**
1. Go to Supabase Dashboard → Your Project
2. **Settings** → **Database**
3. Scroll to **Connection string** → **URI**
4. Copy the string
5. Replace `[YOUR-PASSWORD]` with your actual password
6. **Important**: If password has special characters, URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - `%` → `%25`
   - `&` → `%26`
   - etc.

---

### 3. Use Connection Pooler (Recommended for Railway)

Supabase provides a connection pooler that's more reliable for serverless/cloud deployments.

**Steps:**
1. Go to Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection pooling**
3. Select **Transaction mode** (recommended)
4. Copy the **Connection string** (port will be **6543** instead of 5432)
5. Format: `postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
6. Update `DATABASE_URL` in Railway with this pooler URL

**Why Pooler?**
- Better for serverless/cloud deployments
- Handles connection limits better
- More reliable for Railway

---

### 4. Check Supabase Project Status

1. Go to Supabase Dashboard
2. Check if project shows:
   - ✅ **Active** (good)
   - ⏸️ **Paused** (needs restore)
   - ❌ **Error** (check logs)

---

### 5. Verify Network Access

**Test Connection Locally:**
```bash
# Test if you can connect from your machine
psql "postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

If this works locally but not on Railway:
- Railway might have network restrictions
- Try using connection pooler (solution #3)

---

## ✅ Step-by-Step Fix

### Step 1: Check Supabase Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Open your project
3. If paused, click **"Restore"**
4. Wait for project to be active

### Step 2: Get Connection Pooler URL (Recommended)
1. Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection pooling** → **Transaction mode**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with actual password
5. URL-encode special characters in password

### Step 3: Update Railway
1. Go to Railway service → **Variables** tab
2. Update `DATABASE_URL` with pooler URL (port 6543)
3. Save
4. Railway will auto-redeploy

### Step 4: Verify
1. Check Railway logs
2. Should see: "Running database migrations..." → "Starting FastAPI server..."
3. Test: `curl https://your-app.up.railway.app/`

---

## 🔧 Alternative: Skip Migrations at Startup

If you want to deploy without migrations first:

1. Update `backend/start.sh` to skip migrations on error (already done)
2. Run migrations manually later:
   ```bash
   # In Railway dashboard, use "Run Command"
   alembic upgrade head
   ```

---

## 📝 Quick Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] Using **Connection Pooler URL** (port 6543) instead of direct (port 5432)
- [ ] Password is **URL-encoded** if it has special characters
- [ ] `DATABASE_URL` is set correctly in Railway
- [ ] Tested connection string format

---

## 🆘 Still Not Working?

1. **Check Supabase Logs**: Dashboard → Logs → Database
2. **Check Railway Logs**: Service → Deployments → View Logs
3. **Try Direct Connection**: Use port 5432 (not pooler) to test
4. **Contact Support**: Railway or Supabase support if network issue persists

