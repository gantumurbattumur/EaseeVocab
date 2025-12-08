from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.db import get_db
from app.models.vocabulary import Vocabulary
from app.services.crossword_service import generate_crossword
from app.schemas.crossword import (
    CrosswordTodayRequest, 
    CrosswordTodayResponse, 
    CrosswordClue,
    CrosswordSubmitRequest,
    CrosswordSubmitResponse
)
from sqlalchemy import func

router = APIRouter(prefix="/crossword", tags=["Crossword"])


def get_random_words(db: Session, limit: int = 10) -> List[Vocabulary]:
    """
    Get random words from database (database-agnostic approach).
    
    Args:
        db: Database session
        limit: Number of words to return
    
    Returns:
        List of random Vocabulary objects
    """
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


@router.post("/today", response_model=CrosswordTodayResponse)
def crossword_today(
    payload: CrosswordTodayRequest,
    db: Session = Depends(get_db)
) -> CrosswordTodayResponse:
    """
    Generate a crossword puzzle with words from vocabulary.
    If words are provided, use those. Otherwise, get random words.
    
    Args:
        payload: Request containing optional words list or limit
        db: Database session
    
    Returns:
        CrosswordTodayResponse with grid and clues
    
    Raises:
        HTTPException: If no words are found in database
    """
    formatted = []
    
    # If specific words provided, use those (these are translated words from frontend)
    if payload.words and len(payload.words) > 0:
        # These words are already translated (Spanish/French), use them directly
        # Use clues from payload if provided, otherwise use empty string
        clues_map = payload.clues or {}
        
        # Format in the order provided
        for word_text in payload.words:
            word_upper = word_text.upper() if isinstance(word_text, str) else str(word_text).upper()
            clue = clues_map.get(word_text, clues_map.get(word_upper, ""))
            formatted.append({
                "word": word_upper,
                "clue": clue
            })
    else:
        # Get random words
        limit = payload.limit or 10
        words = get_random_words(db, limit=limit)
        
        if not words:
            raise HTTPException(status_code=404, detail="No words found in database")
        
        formatted = [
            {
                "word": w.word.upper(),
                "clue": w.definition
            }
            for w in words
        ]

    if not formatted:
        raise HTTPException(status_code=404, detail="No words found in database")

    # Filter out words that are too long for the grid (10x10)
    MAX_WORD_LENGTH = 10
    filtered_formatted = [w for w in formatted if len(w["word"]) <= MAX_WORD_LENGTH]
    
    if not filtered_formatted:
        raise HTTPException(
            status_code=400,
            detail="No words suitable for crossword (all words are too long)"
        )

    result = generate_crossword(filtered_formatted)

    grid = result["grid"]
    placements = result["placements"]

    # Create a map of placed words for matching
    placed_words_map = {p["word"]: p for p in placements}
    
    # Build clues only for words that were successfully placed
    # Track which cells have numbers assigned (for shared starting cells)
    cell_numbers: Dict[tuple, int] = {}  # (row, col) -> number
    clues: List[CrosswordClue] = []
    clue_number = 1
    
    for w in filtered_formatted:
        word_upper = w["word"]
        if word_upper in placed_words_map:
            p = placed_words_map[word_upper]
            row = p["row"]
            col = p["col"]
            
            # Check if this cell already has a number (shared starting cell)
            cell_key = (row, col)
            if cell_key in cell_numbers:
                # Use existing number for shared cell
                number = cell_numbers[cell_key]
            else:
                # Assign new number
                number = clue_number
                cell_numbers[cell_key] = number
                clue_number += 1
            
            clues.append(CrosswordClue(
                number=number,
                direction=p["direction"].lower(),
                clue=w["clue"],
                answer=word_upper,
                row=row,
                col=col
            ))

    # If no words were placed, return error
    if not clues:
        raise HTTPException(
            status_code=500,
            detail="Crossword generation failed: no words could be placed"
        )

    return CrosswordTodayResponse(grid=grid, words=clues)


@router.post("/check")
def check_crossword(
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Check crossword answers against the correct solutions.
    
    Args:
        payload: Request containing grid and words with answers
    
    Returns:
        Dict with results array and summary stats
    """
    grid = payload.get("grid", [])
    words = payload.get("words", [])
    
    if not words:
        raise HTTPException(status_code=400, detail="No words provided")
    
    results: List[Dict[str, Any]] = []
    correct_count = 0
    total = len(words)
    correct_words: List[str] = []
    wrong_words: List[str] = []
    
    for word_info in words:
        answer = word_info.get("answer", "").upper()
        direction = word_info.get("direction", "").lower()
        row = word_info.get("row", 0)
        col = word_info.get("col", 0)
        number = word_info.get("number", 0)
        
        # Extract user's answer from grid
        user_answer = ""
        if direction == "across":
            for i in range(len(answer)):
                if row < len(grid) and col + i < len(grid[row]):
                    cell = grid[row][col + i]
                    if isinstance(cell, dict):
                        user_answer += cell.get("input", "").upper() or ""
                    else:
                        user_answer += str(cell).upper() if cell else ""
        else:  # down
            for i in range(len(answer)):
                if row + i < len(grid) and col < len(grid[row + i]):
                    cell = grid[row + i][col]
                    if isinstance(cell, dict):
                        user_answer += cell.get("input", "").upper() or ""
                    else:
                        user_answer += str(cell).upper() if cell else ""
        
        # Compare answers (case-insensitive, strip whitespace)
        user_answer = user_answer.strip().upper()
        correct_answer = answer.strip().upper()
        is_correct = user_answer == correct_answer
        
        if is_correct:
            correct_count += 1
            correct_words.append(answer)
        else:
            wrong_words.append(answer)
        
        # Add result for this word
        results.append({
            "number": number,
            "correct": is_correct,
            "answer": correct_answer,
            "user_answer": user_answer
        })
    
    accuracy = (correct_count / total) if total > 0 else 0.0
    
    return {
        "results": results,
        "correct_count": correct_count,
        "total": total,
        "accuracy": accuracy,
        "correct_words": correct_words,
        "wrong_words": wrong_words
    }
