import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.vocabulary import Vocabulary
from app.models.user_word_history import UserWordHistory


def get_daily_words_for_user(
    db: Session,
    user_id: int
) -> Optional[List[Vocabulary]]:
    """
    Check if user already has today's assigned words.
    
    Args:
        db: Database session
        user_id: User ID
    
    Returns:
        List of Vocabulary objects if words exist for today, None otherwise
    """
    if not user_id:
        return None  # guest mode → always generate new

    today = datetime.date.today()

    # Query with join to avoid N+1
    words = (
        db.query(Vocabulary)
        .join(UserWordHistory, Vocabulary.id == UserWordHistory.word_id)
        .filter(UserWordHistory.user_id == user_id)
        .filter(UserWordHistory.served_date == today)
        .limit(10)  # Limit to 10 words
        .all()
    )

    if not words:
        return None

    # Ensure we only return 10 words
    return words[:10]


def assign_daily_words(
    db: Session,
    user_id: int,
    level: str,
    limit: int
) -> List[Vocabulary]:
    """
    Assign new daily words to user (or guest).
    
    Args:
        db: Database session
        user_id: User ID
        level: Vocabulary difficulty level
        limit: Maximum number of words to assign
    
    Returns:
        List of assigned Vocabulary objects
    """
    today = datetime.date.today()

    # Select random words based on level (database-agnostic)
    words = (
        db.query(Vocabulary)
        .filter(Vocabulary.level == level)
        .order_by(func.random())
        .limit(limit)
        .all()
    )

    if not words:
        return []

    entries = []
    for w in words:
        entries.append(
            UserWordHistory(
                user_id=user_id,
                word_id=w.id,
                served_date=today,
                completed=False
            )
        )

    db.add_all(entries)
    # Note: commit is handled at API layer for transaction control

    return words
