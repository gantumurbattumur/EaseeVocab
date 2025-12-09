"""
Cleanup script for old mnemonic cache entries.
Run this periodically to prevent database from growing too large.

Usage:
    python -m app.scripts.cleanup_old_cache [--days 90]
"""
import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.core.db import SessionLocal
from app.models.mnemonic_cache import MnemonicCache


def cleanup_old_cache(days: int = 90):
    """
    Delete cache entries older than specified days.
    
    Args:
        days: Number of days to keep (default: 90)
    """
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        # Count entries to be deleted
        count = db.query(MnemonicCache).filter(
            MnemonicCache.created_at < cutoff
        ).count()
        
        if count == 0:
            print(f"No cache entries older than {days} days found.")
            return
        
        # Delete old entries
        deleted = db.query(MnemonicCache).filter(
            MnemonicCache.created_at < cutoff
        ).delete()
        
        db.commit()
        print(f"✅ Deleted {deleted} cache entries older than {days} days.")
        print(f"   Cutoff date: {cutoff.strftime('%Y-%m-%d %H:%M:%S')} UTC")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error cleaning up cache: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cleanup old mnemonic cache entries")
    parser.add_argument(
        "--days",
        type=int,
        default=90,
        help="Number of days to keep (default: 90)"
    )
    
    args = parser.parse_args()
    cleanup_old_cache(args.days)

