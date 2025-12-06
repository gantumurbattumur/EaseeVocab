# app/core/db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.ext.declarative import DeclarativeMeta
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise RuntimeError("DATABASE_URL environment variable is not set")

# SQLAlchemy Base
Base: DeclarativeMeta = declarative_base()

# Engine
engine = create_engine(
    DATABASE_URL,
    echo=False,           # set True for debugging SQL
    future=True
)

# SessionLocal for DB operations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# app/core/db.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.declarative import DeclarativeMeta
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL is None:
    raise RuntimeError("DATABASE_URL environment variable is not set")

# SQLAlchemy Base
Base: DeclarativeMeta = declarative_base()

# Engine
engine = create_engine(
    DATABASE_URL,
    echo=False,           # set True for debugging SQL
    future=True
)

# SessionLocal for DB operations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
