from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    learning_language = Column(String, default="english", nullable=True)
    streak_count = Column(Integer, default=0, nullable=False)
    last_active_date = Column(Date, nullable=True)