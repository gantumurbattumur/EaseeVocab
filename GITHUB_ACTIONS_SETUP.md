# GitHub Actions Setup Guide

## Step 1: Add Secrets to GitHub Repository

You need to add your environment variables as GitHub Secrets:

1. Go to your GitHub repository: `https://github.com/gantumurbattumur/EaseeVocab`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

### Required Secrets:

**1. DATABASE_URL**
   - Name: `DATABASE_URL`
   - Value: Your Supabase connection string
   - Example: `postgresql://user:password@db.xxx.supabase.co:5432/postgres`
   - Or use Session Pooler: `postgresql://user:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true`

**2. GEMINI_API_KEY**
   - Name: `GEMINI_API_KEY`
   - Value: Your Google Gemini API key

### Optional Secrets (if needed):

If your backend requires other environment variables, add them too:
- `CORS_ORIGINS` (usually not needed for pre-generation)

## Step 2: Commit and Push the Workflow

The workflow file is already created at `.github/workflows/pre-generate.yml`. Just commit and push:

```bash
git add .github/workflows/pre-generate.yml
git commit -m "Add GitHub Actions workflow for daily pre-generation"
git push origin main
```

## Step 3: Test the Workflow

### Option A: Manual Trigger (Recommended for First Test)

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **Pre-Generate Mnemonics** workflow
4. Click **Run workflow** button
5. Select branch: `main`
6. Click **Run workflow**

This will trigger the pre-generation immediately so you can verify it works.

### Option B: Wait for Scheduled Run

The workflow will automatically run daily at **midnight UTC** (check your timezone).

## Step 4: Monitor the Workflow

1. Go to **Actions** tab in GitHub
2. Click on the workflow run to see logs
3. Check that it completes successfully

## What the Workflow Does

1. **Scheduled Run**: Daily at midnight UTC
2. **Manual Trigger**: Can be run anytime from Actions tab
3. **Auto-trigger on Changes**: Runs when pre-generation code changes
4. **Pre-generates**: 24 flashcards (3 words × 8 combinations)
5. **Logs**: Shows progress and completion status

## Expected Duration

- **First run**: ~10-15 minutes (generating all 24 images)
- **Subsequent runs**: ~2-5 minutes (most are already cached)

## Troubleshooting

### Workflow Fails

1. **Check Secrets**: Ensure `DATABASE_URL` and `GEMINI_API_KEY` are set correctly
2. **Check Logs**: Click on the failed workflow run to see error details
3. **Test Locally**: Run `python -m app.scripts.pre_generate_daily` locally to debug

### Common Issues

**"DATABASE_URL not set"**
- Add `DATABASE_URL` to GitHub Secrets

**"GEMINI_API_KEY not set"**
- Add `GEMINI_API_KEY` to GitHub Secrets

**"Connection timeout"**
- Check if Supabase allows connections from GitHub Actions IPs
- Consider using Supabase Session Pooler (port 6543)

**"Module not found"**
- Check that all dependencies are in `requirements.txt`
- Workflow installs from `backend/requirements.txt`

## Cost Estimate

- **24 images/day** × **~$0.01 per image** = **~$0.24/day**
- **Monthly**: ~$7.20/month
- **With $300 credit**: ~41 months of pre-generation ✅

## Disable/Modify Schedule

To change the schedule, edit `.github/workflows/pre-generate.yml`:

```yaml
schedule:
  - cron: '0 0 * * *'  # Daily at midnight UTC
```

Cron format: `minute hour day month day-of-week`
- `0 0 * * *` = daily at midnight UTC
- `0 12 * * *` = daily at noon UTC
- `0 0 * * 0` = weekly on Sunday at midnight UTC

