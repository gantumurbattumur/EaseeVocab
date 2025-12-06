from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from .base import Base

class Mnemonic(Base):
    __tablename__ = "mnemonics"

    id = Column(Integer, primary_key=True, index=True)
    
    word_id = Column(Integer, ForeignKey("vocabulary.id"), nullable=False)

    mnemonic_text = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)  # S3 / CDN link

    created_at = Column(DateTime(timezone=True), server_default=func.now())
