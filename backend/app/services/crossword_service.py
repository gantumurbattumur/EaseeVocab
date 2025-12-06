import random
from typing import List, Tuple, Dict, Any

from app.models.vocabulary import Vocabulary
from sqlalchemy.orm import Session


# ----------------------------------------------------------
# SIMPLE CROSSWORD GENERATOR (MVP VERSION)
# ----------------------------------------------------------
def generate_crossword(words: List[str]) -> Tuple[List[List[str]], List[dict], Dict[str, str]]:
    """
    Very simple crossword generator:
    - creates a 15x15 grid
    - places words horizontally one per row
    - future: improved algorithm with intersections
    """

    size = 15
    grid = [[" " for _ in range(size)] for _ in range(size)]
    placements = []
    clues = {}

    # Shuffle for randomness
    random.shuffle(words)

    row = 0
    for word in words:
        if len(word) > size:
            continue

        # place word horizontally
        start_col = random.randint(0, size - len(word))

        for i, letter in enumerate(word):
            grid[row][start_col + i] = letter

        placements.append({
            "word": word,
            "row": row,
            "col": start_col,
            "direction": "across"
        })

        row += 2
        if row >= size:
            break

    # Clues (use definitions)
    # For MVP, we only create blank clues; API caller fills them
    for word in words:
        clues[word] = f"Definition for '{word}'"

    return grid, placements, clues


# ----------------------------------------------------------
# CHECK CROSSWORD ANSWERS
# ----------------------------------------------------------
def check_crossword_answers(payload):
    user_answers = payload.answers
    solution = payload.solution

    correct = []
    wrong = []

    for word, user_answer in user_answers.items():
        if word not in solution:
            continue
        if user_answer.strip().lower() == solution[word].strip().lower():
            correct.append(word)
        else:
            wrong.append(word)

    total = len(solution)
    correct_count = len(correct)
    accuracy = correct_count / total if total else 0

    return {
        "correct_count": correct_count,
        "total": total,
        "accuracy": accuracy,
        "correct_words": correct,
        "wrong_words": wrong,
    }
