from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class GoogleVerifyRequest(BaseModel):
    """Request schema for Google OAuth verification."""
    id_token: str = Field(..., description="Google OAuth ID token")


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    google_id: str
    email: str
    name: str
    profile_picture: Optional[str] = None
    learning_language: Optional[str] = None
    streak_count: int = 0
    last_active_date: Optional[str] = None  # ISO format date string
    created_at: Optional[str] = None  # ISO format datetime string

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response schema."""
    token: str
    user: UserResponse

