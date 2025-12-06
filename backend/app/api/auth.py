from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from datetime import datetime, date

from app.core.db import get_db
from app.models.user import User
from app.core.security import create_access_token

import os

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class GoogleAuthRequest(BaseModel):
    id_token: str


class GoogleAuthResponse(BaseModel):
    access_token: str
    user: dict


@router.post("/google", response_model=GoogleAuthResponse)
def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):

    # ---------------------------
    # 1. Verify Google ID Token
    # ---------------------------
    try:
        info = id_token.verify_oauth2_token(
            payload.id_token,
            grequests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")

    # Extract identity fields
    google_id = info["sub"]
    email = info.get("email")
    name = info.get("name", "")
    picture = info.get("picture", "")

    if not email:
        raise HTTPException(400, "Google account missing email.")

    # ---------------------------
    # 2. Lookup user by google_id
    # ---------------------------
    user = db.query(User).filter(User.google_id == google_id).first()

    # ---------------------------
    # 3. If new user → create
    # ---------------------------
    if not user:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            profile_picture=picture,
            learning_language="english",
            streak_count=0,
            last_active_date=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    else:
        # Existing user → update last active date
        today = date.today()
        last_active = user.last_active_date.date() if user.last_active_date else None

        if last_active and last_active != today:
            user.streak_count += 1

        user.last_active_date = datetime.utcnow()
        db.commit()
        db.refresh(user)

    # ---------------------------
    # 4. Issue JWT for app
    # ---------------------------
    access_token = create_access_token({"user_id": user.id})

    return GoogleAuthResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "profile_picture": user.profile_picture,
            "learning_language": user.learning_language,
            "streak_count": user.streak_count,
            "last_active_date": str(user.last_active_date),
        }
    )
