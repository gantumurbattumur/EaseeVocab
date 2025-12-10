"""
Export vocabulary data from local database to CSV/JSON for import to Supabase.
Run this script to export your local vocabulary data.
"""
import os
import sys
import json
import csv
from pathlib import Path

# Add backend to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
sys.path.insert(0, BACKEND_ROOT)

from dotenv import load_dotenv
from app.core.db import SessionLocal
from app.models.vocabulary import Vocabulary

load_dotenv()

def export_to_csv(output_path: str = "vocabulary_export.csv"):
    """Export vocabulary to CSV file."""
    db = SessionLocal()
    try:
        words = db.query(Vocabulary).all()
        print(f"Found {len(words)} words in local database")
        
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "word", "pos", "level", "translation_es", 
                "translation_fr", "definition"
            ])
            
            for word in words:
                writer.writerow([
                    word.word,
                    word.pos or "",
                    word.level or "a1",
                    word.translation_es or "",
                    word.translation_fr or "",
                    word.definition or ""
                ])
        
        print(f"✅ Exported {len(words)} words to {output_path}")
        return output_path
    finally:
        db.close()

def export_to_json(output_path: str = "vocabulary_export.json"):
    """Export vocabulary to JSON file."""
    db = SessionLocal()
    try:
        words = db.query(Vocabulary).all()
        print(f"Found {len(words)} words in local database")
        
        data = []
        for word in words:
            data.append({
                "word": word.word,
                "pos": word.pos or "",
                "level": word.level or "a1",
                "translation_es": word.translation_es or "",
                "translation_fr": word.translation_fr or "",
                "definition": word.definition or ""
            })
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Exported {len(words)} words to {output_path}")
        return output_path
    finally:
        db.close()

def export_sql_inserts(output_path: str = "vocabulary_export.sql"):
    """Export vocabulary as SQL INSERT statements for Supabase."""
    db = SessionLocal()
    try:
        words = db.query(Vocabulary).all()
        print(f"Found {len(words)} words in local database")
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("-- Vocabulary data export\n")
            f.write("-- Run this in Supabase SQL Editor\n\n")
            f.write("BEGIN;\n\n")
            
            for word in words:
                word_escaped = word.word.replace("'", "''")
                def_escaped = (word.definition or "").replace("'", "''")
                pos_escaped = (word.pos or "").replace("'", "''")
                level_escaped = (word.level or "a1").replace("'", "''")
                es_escaped = (word.translation_es or "").replace("'", "''")
                fr_escaped = (word.translation_fr or "").replace("'", "''")
                
                f.write(
                    f"INSERT INTO vocabulary (word, pos, level, translation_es, translation_fr, definition) "
                    f"VALUES ('{word_escaped}', '{pos_escaped}', '{level_escaped}', "
                    f"'{es_escaped}', '{fr_escaped}', '{def_escaped}') "
                    f"ON CONFLICT (word) DO UPDATE SET "
                    f"pos = EXCLUDED.pos, level = EXCLUDED.level, "
                    f"translation_es = EXCLUDED.translation_es, "
                    f"translation_fr = EXCLUDED.translation_fr, "
                    f"definition = EXCLUDED.definition;\n"
                )
            
            f.write("\nCOMMIT;\n")
        
        print(f"✅ Exported {len(words)} words to {output_path}")
        print(f"   Copy and paste this SQL into Supabase SQL Editor")
        return output_path
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Export vocabulary from local DB")
    parser.add_argument(
        "--format",
        choices=["csv", "json", "sql"],
        default="sql",
        help="Export format (default: sql)"
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output file path (default: vocabulary_export.{format})"
    )
    
    args = parser.parse_args()
    
    if args.format == "csv":
        output = args.output or "vocabulary_export.csv"
        export_to_csv(output)
    elif args.format == "json":
        output = args.output or "vocabulary_export.json"
        export_to_json(output)
    else:  # sql
        output = args.output or "vocabulary_export.sql"
        export_sql_inserts(output)

