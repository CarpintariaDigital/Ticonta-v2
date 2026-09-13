from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

reusable_oauth2 = HTTPBearer()


def hash_password(password: str) -> str:
    """Hashes a password using bcrypt."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a JWT refresh token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token. Raises PyJWTError if invalid."""
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM]
    )
    return payload


def get_current_user(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(reusable_oauth2)
) -> Dict[str, Any]:
    """
    Dependency that validates HTTP Bearer JWT token.
    Returns token payload (subject, scopes, roles etc.) for downstream usage.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_token(token.credentials)
        subject: str = payload.get("sub")
        token_type: str = payload.get("type")
        if subject is None or token_type != "access":
            raise credentials_exception
        return {"sub": subject, "payload": payload}
    except jwt.PyJWTError:
        raise credentials_exception


def hash_pin(pin: str) -> str:
    """Hashes a PIN using bcrypt."""
    return hash_password(str(pin))


def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verifies a plain PIN against its bcrypt hash."""
    return verify_password(str(plain_pin), hashed_pin)


def get_current_user_token_data(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(reusable_oauth2)
) -> Dict[str, Any]:
    """Alias for getting current user token payload data."""
    return get_current_user(db, token)


def require_role(roles: Any):
    """Dependency that checks if the authenticated user has one of the required roles."""
    if isinstance(roles, str):
        roles_list = [roles]
    else:
        roles_list = list(roles)

    def role_checker(token_data: Dict[str, Any] = Depends(get_current_user_token_data)):
        user_role = token_data.get("payload", {}).get("role", "admin")
        if user_role not in roles_list and "admin" not in user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operação não autorizada para o seu nível de acesso."
            )
        return token_data
    return role_checker
