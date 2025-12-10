"""
API endpoint for triggering pre-generation of mnemonics.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.services.pre_generation import pre_generate_all_combinations
import asyncio

router = APIRouter(prefix="/pre-generation", tags=["Pre-Generation"])


@router.post("/run")
async def trigger_pre_generation(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger pre-generation of mnemonics for all language/level combinations.
    This runs in the background to avoid blocking the request.
    
    Note: This endpoint should be protected in production (add auth check).
    """
    try:
        # Run pre-generation in background
        loop = asyncio.get_event_loop()
        stats = await pre_generate_all_combinations(db)
        
        return {
            "status": "success",
            "message": "Pre-generation completed",
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pre-generation failed: {str(e)}"
        )


@router.get("/status")
async def get_pre_generation_status(
    db: Session = Depends(get_db)
):
    """
    Get status of pre-generated mnemonics.
    Returns count of cached mnemonics per language/level.
    """
    from app.models.mnemonic_cache import MnemonicCache
    from sqlalchemy import func
    
    # Count cached mnemonics with images per language
    stats = (
        db.query(
            MnemonicCache.language,
            func.count(MnemonicCache.id).label('count')
        )
        .filter(MnemonicCache.image_base64.isnot(None))
        .group_by(MnemonicCache.language)
        .all()
    )
    
    return {
        "status": "ok",
        "cached_mnemonics": {lang: count for lang, count in stats}
    }

