import time
from collections import defaultdict
from typing import Any, Dict, List
import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data, require_role
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.auth import AuthService

logger = structlog.get_logger()

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

# In-memory Rate limiter for Login attempts (5 attempts per 15 minutes)
LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 15 * 60  # 15 minutes
_login_attempts: Dict[str, List[float]] = defaultdict(list)


def check_login_rate_limit(request: Request):
    """Rate limit login requests based on client IP (5 attempts per 15 minutes)."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    _login_attempts[client_ip] = [
        t for t in _login_attempts[client_ip] if now - t < LOGIN_WINDOW_SECONDS
    ]
    if len(_login_attempts[client_ip]) >= LOGIN_MAX_ATTEMPTS:
        logger.warn("login_rate_limit_exceeded", client_ip=client_ip)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again after 15 minutes."
        )
    _login_attempts[client_ip].append(now)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user account."""
    auth_service = AuthService(db)
    user = auth_service.register_user(
        username=data.username,
        pin=data.pin,
        role=data.role,
        email=data.email
    )
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """Authenticate user with username & PIN and issue tokens."""
    check_login_rate_limit(request)
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(username=data.username, pin=data.pin)
    tokens = auth_service.create_tokens(
        user_id=user.id,
        username=user.username,
        roles=[user.role]
    )
    return tokens


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Exchange a valid refresh token for a new access & refresh token pair."""
    auth_service = AuthService(db)
    return auth_service.refresh_access_token(data.refresh_token)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db)
):
    """Get current authenticated user profile."""
    auth_service = AuthService(db)
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
