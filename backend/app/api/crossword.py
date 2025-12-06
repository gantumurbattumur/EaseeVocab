from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.crossword import CrosswordRequest, CrosswordResponse, CrosswordSubmitRequest, CrosswordSubmitResponse
from app.services.crossword_service import generate_crossword, check_crossword_answers

router = APIRouter(prefix="/crossword", tags=["Crossword"])


# ------------------------------------------------------------
#  POST /crossword/generate
# ------------------------------------------------------------
@router.post("/generate", response_model=CrosswordResponse)
def generate_crossword_endpoint(payload: CrosswordRequest, db: Session = Depends(get_db)):

    words = payload.words  # list of word strings

    if len(words) < 4:
        raise HTTPException(400, "Need at least 4 words to generate crossword.")

    grid, placements, clues = generate_crossword(words)

    return CrosswordResponse(
        grid=grid,
        placements=placements,
        clues=clues
    )


# ------------------------------------------------------------
#  POST /crossword/submit
# ------------------------------------------------------------
@router.post("/submit", response_model=CrosswordSubmitResponse)
def submit_crossword(payload: CrosswordSubmitRequest, db: Session = Depends(get_db)):
    result = check_crossword_answers(payload)
    return result
