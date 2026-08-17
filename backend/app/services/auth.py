from datetime import timedelta
from typing import Any, Dict, List, Optional, Union
import jwt
import structlog
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_pin,
    verify_pin,
    verify_token
)
from app.models.user import User

logger = structlog.get_logger()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Fetch user by case-insensitive or exact username."""
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Fetch user by primary key id."""
        return self.db.query(User).filter(User.id == user_id).first()

    def register_user(
        self,
        username: str,
        pin: str,
        role: str = "operator",
        email: Optional[str] = None
    ) -> User:
        """Register a new user with hashed PIN."""
        existing_user = self.get_user_by_username(username)
        if existing_user:
            logger.warn("user_registration_failed_duplicate", username=username)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        if email:
            existing_email = self.db.query(User).filter(User.email == email).first()
            if existing_email:
                logger.warn("user_registration_failed_duplicate_email", email=email)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        hashed_pin = hash_pin(pin)
        new_user = User(
            username=username,
            pin_hash=hashed_pin,
            role=role,
            email=email,
            is_active=True
        )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        logger.info("user_registered", user_id=new_user.id, username=new_user.username, role=new_user.role)
        return new_user

    def authenticate_user(self, username: str, pin: str) -> User:
        """Authenticate user with username and PIN. Logs failed attempts."""
        user = self.get_user_by_username(username)
        if not user:
            logger.warn("auth_login_failed_user_not_found", username=username)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or PIN"
            )

        if not user.is_active:
            logger.warn("auth_login_failed_inactive_user", username=username, user_id=user.id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        if not verify_pin(pin, user.pin_hash):
            logger.warn("auth_login_failed_wrong_pin", username=username, user_id=user.id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or PIN"
            )

        logger.info("auth_login_success", username=username, user_id=user.id)
        return user

    def create_tokens(
        self,
        user_id: int,
        username: str,
        roles: Union[str, List[str]]
    ) -> Dict[str, Any]:
        """Generates access token (15min default) and refresh token (7days default)."""
        access_token = create_access_token(user_id=user_id, username=username, roles=roles)
        refresh_token = create_refresh_token(user_id=user_id, username=username)
        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": expires_in
        }

    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Validates refresh token and issues a new access and refresh token pair."""
        try:
            payload = verify_token(refresh_token)
            if payload.get("type") != "refresh":
                logger.warn("token_refresh_failed_invalid_type")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token type"
                )
            
            user_id = payload.get("user_id") or payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )

            user = self.get_user_by_id(int(user_id))
            if not user or not user.is_active:
                logger.warn("token_refresh_failed_user_invalid", user_id=user_id)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive"
                )

            return self.create_tokens(user_id=user.id, username=user.username, roles=[user.role])

        except jwt.ExpiredSignatureError:
            logger.warn("token_refresh_failed_expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired"
            )
        except jwt.PyJWTError:
            logger.warn("token_refresh_failed_invalid_token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
