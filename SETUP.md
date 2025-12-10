# Setup Guide 🛠️

Complete guide to set up and run EaseeVocab locally.

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** database (or Supabase account)
- **Google Gemini API** key
- **Google OAuth** credentials (optional, for authentication)

## Environment Variables

### Backend (.env in `backend/` directory)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/easeevocab
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local in `frontend/` directory)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the `backend/` directory with the variables listed above.

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Load vocabulary data** (optional):
   ```bash
   python -m app.scripts.load_vocabulary
   ```

7. **Start the server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`

## Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the `frontend/` directory with the variables listed above.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE easeevocab;
   ```
3. Update `DATABASE_URL` in backend `.env`

### Option 2: Supabase (Recommended)

1. Create a Supabase project
2. Get the connection string from project settings
3. Update `DATABASE_URL` in backend `.env`
4. Use the Session Pooler connection string (port 6543) if deploying to Railway

## Running Migrations

After setting up your database:

```bash
cd backend
alembic upgrade head
```

## Pre-Generation (Optional)

To pre-generate mnemonics for faster loading:

```bash
cd backend
python -m app.scripts.pre_generate_daily
```

This will generate mnemonics for the first 10 words of each language/level combination.

## Troubleshooting

### Backend won't start
- Check that PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Ensure all dependencies are installed

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` points to the correct backend URL
- Check CORS settings in backend
- Ensure backend is running on the specified port

### Database connection errors
- Verify database credentials
- Check that the database exists
- Ensure migrations have been run

## Production Deployment

See deployment-specific documentation for:
- **Vercel** (Frontend): Automatic deployments from GitHub
- **Railway** (Backend): Set root directory to `backend` and configure environment variables
- **Supabase** (Database): Use connection pooling for better performance

