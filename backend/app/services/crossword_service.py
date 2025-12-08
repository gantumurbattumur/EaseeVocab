from typing import List, Dict, Any


# Grid size constant (can be made configurable)
CROSSWORD_GRID_SIZE = 10


def generate_crossword(words: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Generate a crossword puzzle from a list of words with clues.
    
    Args:
        words: List of dicts with "word" and "clue" keys
              Example: [{"word": "ABOVE", "clue": "Higher than"}, ...]
    
    Returns:
        Dict with "grid" (2D array) and "placements" (list of placement info)
    
    Raises:
        ValueError: If words list is empty
    """
    if not words:
        raise ValueError("Words list cannot be empty")

    SIZE = CROSSWORD_GRID_SIZE
    grid = [["" for _ in range(SIZE)] for _ in range(SIZE)]
    placements: List[Dict[str, Any]] = []

    def can_place_horizontal(word: str, row: int, col: int) -> bool:
        """Check if word can be placed horizontally at position."""
        if col + len(word) > SIZE:
            return False
        for i, ch in enumerate(word):
            if grid[row][col + i] not in ("", ch):
                return False
        return True

    def can_place_vertical(word: str, row: int, col: int) -> bool:
        """Check if word can be placed vertically at position."""
        if row + len(word) > SIZE:
            return False
        for i, ch in enumerate(word):
            if grid[row + i][col] not in ("", ch):
                return False
        return True

    def place_horizontal(word: str, row: int, col: int) -> None:
        """Place word horizontally on grid."""
        for i, ch in enumerate(word):
            grid[row][col + i] = ch
        placements.append({
            "word": word,
            "row": row,
            "col": col,
            "direction": "ACROSS"
        })

    def place_vertical(word: str, row: int, col: int) -> None:
        """Place word vertically on grid."""
        for i, ch in enumerate(word):
            grid[row + i][col] = ch
        placements.append({
            "word": word,
            "row": row,
            "col": col,
            "direction": "DOWN"
        })

    # Place first word in the center horizontally
    first = words[0]["word"]
    start_col = (SIZE - len(first)) // 2
    start_row = SIZE // 2
    place_horizontal(first, start_row, start_col)

    # Place remaining words
    for w in words[1:]:
        word = w["word"]
        
        # Skip words that are too long for the grid
        if len(word) > SIZE:
            continue  # Skip this word, it's too long
        
        placed = False

        # Try intersections first
        for p in placements:
            pw = p["word"]

            for i, ch1 in enumerate(word):
                for j, ch2 in enumerate(pw):
                    if ch1 != ch2:
                        continue  # Skip if characters don't match

                    # Calculate intersection location
                    if p["direction"] == "ACROSS":
                        # Place new word vertically intersecting horizontal word
                        row = p["row"] - i
                        col = p["col"] + j

                        if 0 <= row < SIZE and 0 <= col < SIZE:
                            if can_place_vertical(word, row, col):
                                place_vertical(word, row, col)
                                placed = True
                                break

                    else:  # DOWN direction
                        # Place new word horizontally intersecting vertical word
                        row = p["row"] + j
                        col = p["col"] - i

                        if 0 <= row < SIZE and 0 <= col < SIZE:
                            if can_place_horizontal(word, row, col):
                                place_horizontal(word, row, col)
                                placed = True
                                break

                if placed:
                    break
            if placed:
                break

        # Fallback: place vertically anywhere if no intersection found
        if not placed:
            for r in range(SIZE):
                for c in range(SIZE):
                    if can_place_vertical(word, r, c):
                        place_vertical(word, r, c)
                        placed = True
                        break
                if placed:
                    break
        
        # If still not placed, try horizontal placement as last resort
        if not placed:
            for r in range(SIZE):
                for c in range(SIZE):
                    if can_place_horizontal(word, r, c):
                        place_horizontal(word, r, c)
                        placed = True
                        break
                if placed:
                    break

    # Final processing – return structured grid
    output_grid: List[List[Dict[str, Any]]] = []
    for r in range(SIZE):
        row: List[Dict[str, Any]] = []
        for c in range(SIZE):
            cell = grid[r][c]
            if cell == "":
                row.append({
                    "letter": None,
                    "is_block": True
                })
            else:
                row.append({
                    "letter": cell,
                    "is_block": False,
                    "input": ""
                })
        output_grid.append(row)

    return {
        "grid": output_grid,
        "placements": placements
    }
