from sqlalchemy import Column, Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func
from .base import Base

class CrosswordAttempt(Base):
    __tablename__ = "crossword_attempts"

    id = Column(Integer, primary_key=True, index=True)

    crossword_id = Column(Integer, ForeignKey("crosswords.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    completed = Column(Boolean, default=False)

    time_taken_seconds = Column(Integer, nullable=True)
    correct_cells = Column(Integer, nullable=True)
    total_cells = Column(Integer, nullable=True)
