from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime

from app.core.db import get_db
from app.schemas.words import DailyWordsRequest, DailyWordsResponse, WordOut
from app.services.word_service import (
    get_daily_words_for_user,
    assign_daily_words,
)

router = APIRouter(prefix="/words", tags=["Words"])


# ------------------------------------------------------------
#  POST /words/daily
#  Returns daily batch of words (default: 10)
# ------------------------------------------------------------
@router.post("/daily", response_model=DailyWordsResponse)
def get_daily_words(payload: DailyWordsRequest, db: Session = Depends(get_db)):

    user_id = payload.user_id
    level = payload.level
    limit = payload.limit or 10

    # STEP 1 — Try to fetch today’s already assigned words
    today_words = get_daily_words_for_user(db, user_id)
    if today_words:
        return DailyWordsResponse(
            date=str(datetime.date.today()),
            words=today_words,
            count=len(today_words)
        )

    # STEP 2 — Generate new daily assignment
    words = assign_daily_words(db, user_id, level, limit)
    if not words:
        raise HTTPException(status_code=404, detail="Not enough words available.")

    return DailyWordsResponse(
        date=str(datetime.date.today()),
        words=words,
        count=len(words)
    )
