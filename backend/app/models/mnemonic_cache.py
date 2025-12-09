from sqlalchemy import Column, Integer, Text, String, DateTime, Index, UniqueConstraint
from sqlalchemy.sql import func
from .base import Base


class MnemonicCache(Base):
    """Cache for generated mnemonics to avoid regenerating the same content."""
    __tablename__ = "mnemonic_cache"

    id = Column(Integer, primary_key=True, index=True)
    
    # Hash-based cache key: word_hash + language + definition_hash
    word_hash = Column(String(64), nullable=False, index=True)
    language = Column(String(2), nullable=False)  # 'es' or 'fr'
    definition_hash = Column(String(64), nullable=False, index=True)
    
    # Cached content
    mnemonic_word = Column(Text, nullable=False)
    mnemonic_sentence = Column(Text, nullable=False)
    image_base64 = Column(Text, nullable=True)  # Can be large, but cached for reuse
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Unique constraint to prevent duplicates
    __table_args__ = (
        UniqueConstraint('word_hash', 'language', 'definition_hash', name='uq_mnemonic_cache'),
        Index('idx_word_lang_def', 'word_hash', 'language', 'definition_hash'),
    )

