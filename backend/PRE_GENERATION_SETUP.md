# Pre-Generation Setup Guide

This system pre-generates mnemonics (text + images) for the first 3 flashcards of each language/level combination to ensure fast loading for visitors.

## How It Works

- **8 combinations**: 2 languages (es, fr) × 4 levels (a1, a2, b1, b2)
- **24 total flashcards**: 3 words × 8 combinations
- **Deterministic selection**: Same words for everyone based on date + language + level
- **Automatic caching**: Generated mnemonics are stored in `mnemonic_cache` table

## Setup Options

### Option 1: Manual Trigger (Recommended for Testing)

Call the API endpoint to trigger pre-generation:

```bash
curl -X POST https://your-railway-url.up.railway.app/pre-generation/run
```

### Option 2: Railway Cron Job

1. Go to Railway Dashboard
2. Create a new service or use existing backend
3. Add a cron job:
   - **Schedule**: `0 0 * * *` (runs daily at midnight UTC)
   - **Command**: `python -m app.scripts.pre_generate_daily`

### Option 3: GitHub Actions (Free)

Create `.github/workflows/pre-generate.yml`:

```yaml
name: Pre-Generate Mnemonics
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  pre-generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run pre-generation
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          cd backend
          python -m app.scripts.pre_generate_daily
```

### Option 4: External Cron Service

Use services like:
- **cron-job.org** (free)
- **EasyCron** (free tier)
- **UptimeRobot** (free)

Set up to call: `POST https://your-railway-url.up.railway.app/pre-generation/run`

## Check Status

Check pre-generation status:

```bash
curl https://your-railway-url.up.railway.app/pre-generation/status
```

## Cost Estimate

- **24 images/day** × **~$0.01 per image** = **~$0.24/day**
- **Monthly**: ~$7.20/month
- **With $300 credit**: ~41 months of pre-generation

## Notes

- Pre-generation runs daily to ensure fresh content
- Already cached mnemonics are skipped (saves API calls)
- Errors are logged but don't stop the process
- First 3 words are deterministic (same for everyone)
- Words 4-10 are random (generated on-demand)

