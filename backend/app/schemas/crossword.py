from typing import List, Dict, Any
from pydantic import BaseModel


# ----------------------------------------------------
# REQUEST: Generate Crossword
# ----------------------------------------------------
class CrosswordRequest(BaseModel):
    words: List[str]


# ----------------------------------------------------
# RESPONSE: Generate Crossword
# ----------------------------------------------------
class CrosswordResponse(BaseModel):
    grid: List[List[str]]             # 2D list representing crossword layout
    placements: List[Dict[str, Any]]  # where each word is placed
    clues: Dict[str, str]             # clue per word (word → definition)
    

# ----------------------------------------------------
# REQUEST: Submit completed crossword
# ----------------------------------------------------
class CrosswordSubmitRequest(BaseModel):
    grid: List[List[str]]
    answers: Dict[str, str]  # {"word": "USER_TYPED_ANSWER"}
    solution: Dict[str, str] # {"word": "CORRECT_WORD"}


# ----------------------------------------------------
# RESPONSE: Submit crossword
# ----------------------------------------------------
class CrosswordSubmitResponse(BaseModel):
    correct_count: int
    total: int
    accuracy: float
    correct_words: List[str]
    wrong_words: List[str]
