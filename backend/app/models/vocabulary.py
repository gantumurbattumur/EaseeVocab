from sqlalchemy import Column, Integer, String, Text
from .base import Base

class Vocabulary(Base):
    __tablename__ = 'vocabulary'

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, unique=True, index=True, nullable=False)
    pos = Column(String, nullable=False)  # part of speech
    level = Column(String, nullable=False)  # difficulty level
    translation_es = Column(String, nullable=True)
    translation_fr = Column(String, nullable=True)
    definition = Column(Text, nullable=False) # english definition
    example_sentence = Column(Text, nullable=True)
    