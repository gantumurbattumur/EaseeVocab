from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional, List
from app.core.db import get_db
from app.models.vocabulary import Vocabulary
from app.models.user_word_history import UserWordHistory
from app.core.security import optional_access_token
from app.schemas.words import DailyWordsResponse, WordOut
from app.services.word_service import get_daily_words_for_user, assign_daily_words
from sqlalchemy import func

router = APIRouter(prefix="/words", tags=["Words"])


def get_random_words(db: Session, limit: int = 10) -> List[Vocabulary]:
    """
    Get random words from database (database-agnostic approach).
    
    Args:
        db: Database session
        limit: Number of words to return
    
    Returns:
        List of random Vocabulary objects
    """
    # Try PostgreSQL/SQLite random(), fallback to Python random if needed
    try:
        return (
            db.query(Vocabulary)
            .order_by(func.random())
            .limit(limit)
            .all()
        )
    except Exception:
        # Fallback: get all and shuffle in Python (not ideal for large datasets)
        import random
        all_words = db.query(Vocabulary).all()
        return random.sample(all_words, min(limit, len(all_words)))


@router.post("/daily", response_model=DailyWordsResponse)
def get_daily_words(
    db: Session = Depends(get_db),
    user: Optional[dict] = Depends(optional_access_token)
) -> DailyWordsResponse:
    """
    Get daily words for user. Returns cached words if available for today,
    otherwise generates and saves new words.
    
    Args:
        db: Database session
        user: Optional authenticated user dict
    
    Returns:
        DailyWordsResponse with words for today
    """
    today = date.today()
    
    # Not logged in -> just return random words (limit to 10)
    if user is None:
        words = get_random_words(db, limit=10)
        # Ensure we only return 10 words
        words = words[:10]
        return DailyWordsResponse(
            date=today.isoformat(),
            count=len(words),
            words=[WordOut.model_validate(w) for w in words]
        )

    user_id = user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid user token")

    # Check if user already has today's words
    existing_words = get_daily_words_for_user(db, user_id)
    
    if existing_words:
        # Ensure we only return 10 words
        existing_words = existing_words[:10]
        return DailyWordsResponse(
            date=today.isoformat(),
            count=len(existing_words),
            words=[WordOut.model_validate(w) for w in existing_words]
        )

    # Generate new words (default level, can be made configurable) - limit to 10
    words = assign_daily_words(db, user_id, level="a1", limit=10)
    db.commit()
    
    # Ensure we only return 10 words
    words = words[:10]

    return DailyWordsResponse(
        date=today.isoformat(),
        count=len(words),
        words=[WordOut.model_validate(w) for w in words]
    )
