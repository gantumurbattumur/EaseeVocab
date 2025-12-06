from sqlalchemy import Column, Integer, ForeignKey, Date, Boolean
from .base import Base

class UserWordHistory(Base):
    __tablename__ = "user_word_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word_id = Column(Integer, ForeignKey("vocabulary.id"), nullable=False)

    served_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
