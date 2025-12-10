#!/usr/bin/env python3
"""
Daily pre-generation script for mnemonics.
Run this script daily (via cron, Railway cron, or scheduled task) to pre-generate
the first 3 flashcards for each language/level combination.

Usage:
    python -m app.scripts.pre_generate_daily
"""
import sys
import os
import asyncio

# Add backend to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
sys.path.insert(0, BACKEND_ROOT)

from dotenv import load_dotenv
from app.core.db import SessionLocal
from app.services.pre_generation import pre_generate_all_combinations

load_dotenv()


async def main():
    """Main function to run pre-generation."""
    db = SessionLocal()
    try:
        print("🚀 Starting daily pre-generation...")
        stats = await pre_generate_all_combinations(db)
        print("\n✅ Pre-generation completed successfully!")
        print(f"📊 Summary:")
        print(f"   Combinations: {stats['total_combinations']}")
        print(f"   Words processed: {stats['total_words_processed']}")
        print(f"   Already cached: {stats['total_cached']}")
        print(f"   Newly generated: {stats['total_generated']}")
        print(f"   Errors: {stats['total_errors']}")
        return 0
    except Exception as e:
        print(f"❌ Pre-generation failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

