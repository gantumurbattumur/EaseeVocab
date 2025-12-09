#!/bin/bash
# Startup script for Railway deployment
# Runs migrations first, then starts the server

set -e

echo "Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set!"
    exit 1
fi

echo "Running database migrations..."
# Try migrations, but don't fail if database is not ready yet
alembic upgrade head || {
    echo "WARNING: Migrations failed. This might be okay if database is not ready yet."
    echo "You can run migrations manually later with: alembic upgrade head"
}

echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT

