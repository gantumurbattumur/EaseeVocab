# app/core/security.py

import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends
from fastapi.security import HTTPBearer
from jwt.exceptions import DecodeError, InvalidTokenError
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if JWT_SECRET is None:
    raise RuntimeError("JWT_SECRET environment variable is not set")

bearer = HTTPBearer(auto_error=False)


def create_access_token(data: dict, expires_minutes: int = 60 * 24) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing token payload
        expires_minutes: Token expiration time in minutes (default: 1440 = 24 hours)
    
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def optional_access_token(credentials=Depends(bearer)) -> Optional[Dict[str, Any]]:
    """
    Optional JWT token verification dependency.
    Returns None if no token is provided or if token is invalid.
    
    Returns:
        Decoded token payload dict or None
    """
    if credentials is None:
        return None

    try:
        return jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
    except (DecodeError, InvalidTokenError):
        return None
    except Exception:
        return None
