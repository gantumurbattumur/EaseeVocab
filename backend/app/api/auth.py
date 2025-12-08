from fastapi import APIRouter, HTTPException, Depends
from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.db import get_db
from app.models.user import User
from app.core.security import create_access_token
from app.schemas.auth import GoogleVerifyRequest, AuthResponse, UserResponse
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
if GOOGLE_CLIENT_ID is None:
    raise RuntimeError("GOOGLE_CLIENT_ID environment variable is not set")


@router.post("/google/verify", response_model=AuthResponse)
def google_verify(
    payload: GoogleVerifyRequest,
    db: Session = Depends(get_db)
) -> AuthResponse:
    """
    Verify Google OAuth token and create/return user with JWT token.
    
    Args:
        payload: Request containing Google id_token
        db: Database session
    
    Returns:
        AuthResponse with JWT token and user data
    
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not payload.id_token:
        raise HTTPException(status_code=400, detail="Missing id_token")

    try:
        info = id_token.verify_oauth2_token(
            payload.id_token, requests.Request(), GOOGLE_CLIENT_ID
        )
    except (ValueError, GoogleAuthError) as e:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token verification failed")

    google_id = info.get("sub")
    email = info.get("email")
    name = info.get("name")

    if not google_id or not email or not name:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            profile_picture=info.get("picture")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_access_token({"user_id": user.id})
    
    return AuthResponse(
        token=jwt_token,
        user=UserResponse(
            id=user.id,
            google_id=user.google_id,
            email=user.email,
            name=user.name,
            profile_picture=user.profile_picture,
            learning_language=user.learning_language,
            streak_count=user.streak_count,
            last_active_date=str(user.last_active_date) if user.last_active_date else None,
            created_at=user.created_at.isoformat() if user.created_at else None
        )
    )
