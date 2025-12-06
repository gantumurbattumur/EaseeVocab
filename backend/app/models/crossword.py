from sqlalchemy import Column, Integer, ForeignKey, Date, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from .base import Base

class Crossword(Base):
    __tablename__ = "crosswords"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    puzzle_date = Column(Date, nullable=False)

    grid = Column(JSONB, nullable=False)       # 2D array of letters + #
    clues = Column(JSONB, nullable=False)      # list of across/down clues

    created_at = Column(DateTime(timezone=True), server_default=func.now())
