import datetime
import random
from sqlalchemy.orm import Session

from app.models.vocabulary import Vocabulary
from app.models.user_word_history import UserWordHistory


# -----------------------------------------------------------
#  Check if user already has today’s assigned words
# -----------------------------------------------------------
def get_daily_words_for_user(db: Session, user_id: int):
    if not user_id:
        return None  # guest mode → always generate new

    today = datetime.date.today()

    rows = (
        db.query(UserWordHistory)
        .filter(UserWordHistory.user_id == user_id)
        .filter(UserWordHistory.date_assigned == today)
        .all()
    )

    if not rows:
        return None

    # Build list of vocabulary objects
    return [row.vocab for row in rows]


# -----------------------------------------------------------
#  Assign new daily words to user (or guest)
# -----------------------------------------------------------
def assign_daily_words(db: Session, user_id: int, level: str, limit: int):
    # STEP 1 — fetch vocabulary entries matching CEFR level
    words = db.query(Vocabulary).filter(Vocabulary.level == level).all()
    if len(words) < limit:
        return None

    # STEP 2 — random selection
    selected = random.sample(words, limit)

    # STEP 3 — if user exists, store in user_word_history
    if user_id:
        today = datetime.date.today()
        for vocab_item in selected:
            entry = UserWordHistory(
                user_id=user_id,
                vocab_id=vocab_item.id,
                date_assigned=today,
                completed=False
            )
            db.add(entry)
        db.commit()

    return selected
