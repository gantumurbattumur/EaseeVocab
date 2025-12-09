# Railway Deployment Troubleshooting

## ❌ Error: "Network is unreachable" during build

**Problem**: Migrations are trying to run during build phase, but database isn't available.

**Solution**: Migrations should run at **startup**, not during build.

**Fixed Configuration**:
- ✅ Build Command: `pip install -r requirements.txt` (no migrations)
- ✅ Start Command: `./start.sh` (runs migrations then starts server)

---

## ❌ Error: "Module not found: app"

**Problem**: Root directory not set correctly.

**Solution**: 
1. Go to Railway service → **Settings** → **Source**
2. Set **Root Directory** to: `backend`
3. Save and redeploy

---

## ❌ Error: "DATABASE_URL environment variable is not set"

**Problem**: Environment variable not configured.

**Solution**:
1. Go to Railway service → **Variables** tab
2. Add `DATABASE_URL` with your Supabase connection string
3. Format: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
4. Make sure password is URL-encoded (replace special chars with % encoding)

---

## ❌ Error: "Connection refused" or "Network unreachable"

**Possible Causes**:

1. **Supabase project paused** (free tier pauses after inactivity)
   - Go to Supabase dashboard
   - Click "Restore" if project is paused

2. **Wrong DATABASE_URL format**
   - Check connection string from Supabase
   - Ensure password is correct
   - Try using connection pooler URL instead (port 6543)

3. **IPv6 connection issue**
   - Supabase might be using IPv6
   - Railway should handle this, but if issues persist, contact support

4. **Firewall/Network restrictions**
   - Check if Railway can reach Supabase
   - Verify Supabase allows connections from Railway IPs

---

## ✅ How to Test Database Connection

### From Railway CLI:
```bash
railway run python -c "from app.core.db import engine; engine.connect(); print('Connected!')"
```

### From Railway Dashboard:
1. Go to service → **Deployments**
2. Click on latest deployment
3. Check logs for connection errors

---

## 🔧 Manual Migration (if needed)

If migrations fail at startup, you can run them manually:

### Option 1: Railway CLI
```bash
railway run alembic upgrade head
```

### Option 2: Railway Dashboard
1. Go to service → **Deployments**
2. Click "..." → "Run Command"
3. Enter: `alembic upgrade head`

### Option 3: Supabase SQL Editor
1. Go to Supabase dashboard → **SQL Editor**
2. Run the SQL from migration files manually

---

## 📝 Checklist for Railway Deployment

- [ ] Root Directory set to `backend`
- [ ] All environment variables set (especially `DATABASE_URL`)
- [ ] Supabase project is active (not paused)
- [ ] Build command: `pip install -r requirements.txt` (no migrations)
- [ ] Start command: `./start.sh` (runs migrations at startup)
- [ ] Check deployment logs for errors
- [ ] Test backend URL: `curl https://your-app.up.railway.app/`

---

## 🆘 Still Having Issues?

1. **Check Railway Logs**: Service → Deployments → View Logs
2. **Check Supabase Logs**: Dashboard → Logs
3. **Verify Environment Variables**: Railway → Variables tab
4. **Test Locally First**: Make sure it works with same DATABASE_URL locally

