from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# ----------------------------------------------------
# REQUEST: Generate Today's Crossword
# ----------------------------------------------------
class CrosswordTodayRequest(BaseModel):
    """Request schema for generating today's crossword."""
    limit: Optional[int] = Field(default=None, ge=1, le=10, description="Number of words in crossword")
    words: Optional[List[str]] = Field(default=None, description="Specific words to use for crossword (translated words)")
    clues: Optional[Dict[str, str]] = Field(default=None, description="Mapping of words to clues (word -> clue)")


# ----------------------------------------------------
# RESPONSE: Generate Today's Crossword
# ----------------------------------------------------
class CrosswordClue(BaseModel):
    """Individual clue information."""
    number: int
    direction: str
    clue: str
    answer: str
    row: int
    col: int


class CrosswordTodayResponse(BaseModel):
    """Response schema for today's crossword."""
    grid: List[List[Dict[str, Any]]]  # 2D list representing crossword layout
    words: List[CrosswordClue]  # List of clues with placement info


# ----------------------------------------------------
# REQUEST: Generate Crossword (with specific words)
# ----------------------------------------------------
class CrosswordRequest(BaseModel):
    """Request schema for generating crossword with specific words."""
    words: List[str] = Field(..., min_items=1, description="List of words to include")


# ----------------------------------------------------
# RESPONSE: Generate Crossword
# ----------------------------------------------------
class CrosswordResponse(BaseModel):
    """Response schema for crossword generation."""
    grid: List[List[Dict[str, Any]]]  # 2D list representing crossword layout
    placements: List[Dict[str, Any]]  # where each word is placed
    clues: Dict[str, str]  # clue per word (word → definition)


# ----------------------------------------------------
# REQUEST: Submit completed crossword
# ----------------------------------------------------
class CrosswordSubmitRequest(BaseModel):
    """Request schema for submitting completed crossword."""
    grid: List[List[str]]
    answers: Dict[str, str] = Field(..., description="User's answers: word → typed answer")
    solution: Dict[str, str] = Field(..., description="Correct solutions: word → correct answer")


# ----------------------------------------------------
# RESPONSE: Submit crossword
# ----------------------------------------------------
class CrosswordSubmitResponse(BaseModel):
    """Response schema for crossword submission results."""
    correct_count: int
    total: int
    accuracy: float
    correct_words: List[str]
    wrong_words: List[str]
