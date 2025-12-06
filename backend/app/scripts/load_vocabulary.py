import os
import sys
import csv
import json
import time

from dotenv import load_dotenv
import google.generativeai as genai
from sqlalchemy.orm import Session

# -------------------------------------------------------------------
# Ensure we can import app.* when running as:
#   python backend/app/scripts/update_vocabulary_gemini.py
# -------------------------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../../"))  # points to backend/
sys.path.append(BACKEND_ROOT)

from app.core.db import SessionLocal  # type: ignore
from app.models.vocabulary import Vocabulary  # type: ignore

# -------------------------------------------------------------------
# ENV & GEMINI SETUP
# -------------------------------------------------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in .env")

CSV_PATH = os.getenv("VOCAB_CSV_PATH", "backend/app/data/oxford_3000.csv")

genai.configure(api_key=GEMINI_API_KEY)

# Use Gemini 2.5 Flash (text model)
model = genai.GenerativeModel("gemini-2.5-flash")


# -------------------------------------------------------------------
# HELPERS
# -------------------------------------------------------------------
def load_words_from_csv(path: str):
    """Load rows from Oxford 3000 CSV: word,class,level"""
    words = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            word = row.get("word")
            pos_class = row.get("class")
            level = row.get("level")
            if not word:
                continue
            words.append(
                {
                    "word": word.strip().lower(),
                    "pos_class": (pos_class or "").strip().lower(),
                    "level": (level or "").strip().lower(),
                }
            )
    return words


def call_gemini_for_word(word: str, cefr_level: str):
    """
    Ask Gemini 2.5 Flash to give us:
    - definition (EN)
    - translation_es
    - translation_fr
    - pos
    Returns a dict or None if failed.
    """
    prompt = f"""
You are helping build a vocabulary learning app.

For the English word below, return a compact JSON object with EXACTLY these keys:
- "definition": a simple, learner-friendly English definition (1 short sentence, most common meaning).
- "translation_es": the Spanish translation (one word or short phrase).
- "translation_fr": the French translation (one word or short phrase).
- "pos": the part of speech in lowercase (e.g. "noun", "verb", "adjective", "adverb").

Word: "{word}"
CEFR level: "{cefr_level.upper()}" (this is just a hint; you can ignore if not needed)

Return ONLY valid JSON. No markdown, no explanations, no backticks.
"""

    try:
        resp = model.generate_content(prompt)
        text = resp.text.strip()

        # Sometimes models try to wrap in ```json ... ```
        if text.startswith("```"):
            text = text.strip("`")
            # Remove leading "json\n" if present
            if text.lower().startswith("json"):
                text = text[4:]

        data = json.loads(text)

        # Basic sanity check
        for key in ["definition", "translation_es", "translation_fr", "pos"]:
            if key not in data:
                print(f"⚠️  Missing key {key} for word '{word}'. Got: {data}")
                return None

        return data

    except Exception as e:
        print(f"❌ Gemini error for '{word}': {e}")
        return None


def upsert_word(db: Session, word_row: dict):
    """
    For a single CSV row, call Gemini, then:
    - If word exists in DB: update definition / translations / pos / level
    - If word does not exist: insert new row
    """
    word = word_row["word"]
    cefr = word_row["level"] or "a1"
    pos_class = word_row["pos_class"] or None

    print(f"Processing '{word}' (level={cefr})...")

    # 1) Call Gemini for definition + translations
    gemini_data = call_gemini_for_word(word, cefr)
    if not gemini_data:
        print(f"Skipping '{word}' due to Gemini failure.")
        return

    definition = gemini_data["definition"]
    translation_es = gemini_data["translation_es"]
    translation_fr = gemini_data["translation_fr"]
    pos = gemini_data["pos"] or pos_class

    # 2) Check if this word already exists in the vocabulary table
    existing = db.query(Vocabulary).filter_by(word=word).first()

    if existing:
        # Update fields
        existing.definition = definition
        existing.translation_es = translation_es
        existing.translation_fr = translation_fr
        existing.pos = pos
        existing.level = cefr
        print(f"✅ Updated existing word: {word}")
    else:
        # Insert new vocabulary row
        new_entry = Vocabulary(
            word=word,
            pos=pos,
            level=cefr,
            definition=definition,
            translation_es=translation_es,
            translation_fr=translation_fr,
        )
        db.add(new_entry)
        print(f"➕ Inserted new word: {word}")

    # Commit after each word to avoid losing progress
    db.commit()
    # Short delay to be nice to the API (tune as needed)
    time.sleep(0.3)


# -------------------------------------------------------------------
# MAIN
# -------------------------------------------------------------------
def main():
    print(f"📂 Loading words from CSV: {CSV_PATH}")
    words = load_words_from_csv(CSV_PATH)
    print(f"Total words in CSV: {len(words)}")

    db = SessionLocal()
    try:
        for idx, row in enumerate(words, start=1):
            print(f"\n[{idx}/{len(words)}]")
            upsert_word(db, row)
    finally:
        db.close()

    print("🎉 Done updating vocabulary with Gemini 2.5 Flash.")


if __name__ == "__main__":
    main()
