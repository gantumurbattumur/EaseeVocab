from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional, List
from app.core.db import get_db
from app.models.vocabulary import Vocabulary
from app.models.user_word_history import UserWordHistory
from app.core.security import optional_access_token
from app.schemas.words import DailyWordsRequest, DailyWordsResponse, WordOut
from app.services.word_service import get_daily_words_for_user, assign_daily_words
from sqlalchemy import func

router = APIRouter(prefix="/words", tags=["Words"])


def get_random_words(db: Session, limit: int = 10, level: Optional[str] = None) -> List[Vocabulary]:
    """
    Get random words from database (database-agnostic approach).
    
    Args:
        db: Database session
        limit: Number of words to return
        level: Optional difficulty level filter (a1, a2, b1, b2)
    
    Returns:
        List of random Vocabulary objects
    """
    query = db.query(Vocabulary)
    
    # Filter by level if provided
    if level:
        query = query.filter(Vocabulary.level == level)
    
    # Check total count for debugging
    total_count = query.count()
    print(f"🔍 Database query: level={level}, total words matching={total_count}")
    
    if total_count == 0:
        print(f"⚠️ WARNING: No words found with level={level}")
        # Try without level filter to see if any words exist
        all_count = db.query(Vocabulary).count()
        print(f"🔍 Total words in database (all levels): {all_count}")
        return []
    
    # Try PostgreSQL/SQLite random(), fallback to Python random if needed
    try:
        words = (
            query
            .order_by(func.random())
            .limit(limit)
            .all()
        )
        print(f"✅ Retrieved {len(words)} words from database")
        return words
    except Exception as e:
        print(f"❌ Error in get_random_words: {e}")
        # Fallback: get all and shuffle in Python (not ideal for large datasets)
        import random
        all_words = query.all()
        return random.sample(all_words, min(limit, len(all_words)))


@router.post("/daily", response_model=DailyWordsResponse)
def get_daily_words(
    request: DailyWordsRequest = DailyWordsRequest(),
    db: Session = Depends(get_db),
    user: Optional[dict] = Depends(optional_access_token)
) -> DailyWordsResponse:
    """
    Get daily words for user. Returns cached words if available for today,
    otherwise generates and saves new words.
    
    Args:
        request: Optional request body with level and limit
        db: Database session
        user: Optional authenticated user dict
    
    Returns:
        DailyWordsResponse with words for today
    """
    # Extract level from request body or use default
    level = request.level if request.level else "a1"
    limit = request.limit if request.limit else 10
    
    print(f"📥 /words/daily request: level={level}, limit={limit}, user={user is not None}")
    
    today = date.today()
    
    # Not logged in -> use deterministic words for first 3, random for rest
    if user is None:
        print(f"👤 Guest mode: fetching {limit} words at level {level}")
        
        # For guest users, we need to determine language from request
        # Since we don't have language in request, we'll use deterministic for first 3
        # and random for the rest. Language-specific pre-generation will be handled
        # by the frontend when it requests mnemonics.
        
        # Get deterministic first 3 words (using 'es' as default, but words are same)
        from app.services.pre_generation import get_deterministic_words
        deterministic_words = get_deterministic_words(db, "es", level, limit=3)
        
        # Get random words for the rest
        remaining_needed = max(0, limit - len(deterministic_words))
        random_words = get_random_words(db, limit=remaining_needed, level=level) if remaining_needed > 0 else []
        
        # Combine: deterministic first, then random
        words = deterministic_words + random_words
        words = words[:limit]
        
        print(f"✅ Found {len(words)} words in database ({len(deterministic_words)} deterministic, {len(random_words)} random)")
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
        # Filter by level if specified
        if level:
            existing_words = [w for w in existing_words if w.level == level]
        # If we have enough words of the requested level, return them
        if len(existing_words) >= 10:
            existing_words = existing_words[:10]
            return DailyWordsResponse(
                date=today.isoformat(),
                count=len(existing_words),
                words=[WordOut.model_validate(w) for w in existing_words]
            )
        # If we have some words but not enough, we'll generate new ones below

    # Generate new words with specified level - limit to 10
    words = assign_daily_words(db, user_id, level=level, limit=10)
    db.commit()
    
    # Ensure we only return 10 words
    words = words[:10]

    return DailyWordsResponse(
        date=today.isoformat(),
        count=len(words),
        words=[WordOut.model_validate(w) for w in words]
    )
