# Quick Deployment Checklist

## ✅ Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All environment variables documented
- [ ] Database migrations tested locally
- [ ] Google OAuth credentials ready

## ✅ Supabase Setup

- [ ] Created Supabase project
- [ ] Saved database connection string
- [ ] Saved database password
- [ ] Project is active

## ✅ Railway Backend

- [ ] Created Railway account
- [ ] Connected GitHub repository
- [ ] Created new project
- [ ] Deployed backend service
- [ ] Set all environment variables:
  - [ ] `DATABASE_URL` (from Supabase)
  - [ ] `JWT_SECRET` (generated)
  - [ ] `JWT_ALGORITHM=HS256`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GEMINI_API_KEY`
  - [ ] `CORS_ORIGINS` (will update after frontend)
- [ ] Backend URL saved: `https://xxx.up.railway.app`
- [ ] Tested backend health endpoint
- [ ] Verified migrations ran successfully

## ✅ Vercel Frontend

- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Imported project
- [ ] Set root directory to `frontend`
- [ ] Set environment variables:
  - [ ] `NEXT_PUBLIC_API_URL` (Railway backend URL)
  - [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] Deployed frontend
- [ ] Frontend URL saved: `https://xxx.vercel.app`

## ✅ Post-Deployment

- [ ] Updated `CORS_ORIGINS` in Railway with Vercel URL
- [ ] Updated Google OAuth redirect URIs
- [ ] Tested frontend loads correctly
- [ ] Tested language/level selection
- [ ] Tested flashcard generation
- [ ] Tested mnemonic caching (generate same word twice)
- [ ] Verified database tables created in Supabase
- [ ] Checked database size in Supabase

## ✅ Google OAuth

- [ ] Added Vercel URL to authorized redirect URIs
- [ ] Added Vercel URL to authorized JavaScript origins
- [ ] Tested login flow

## ✅ Monitoring Setup

- [ ] Bookmarked Railway dashboard
- [ ] Bookmarked Vercel dashboard
- [ ] Bookmarked Supabase dashboard
- [ ] Set up database size monitoring (check weekly)

## 🎉 Done!

Your app should now be live! 🚀

