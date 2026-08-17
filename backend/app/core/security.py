from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Union
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

reusable_oauth2 = HTTPBearer()


def hash_pin(pin: str) -> str:
    """Hashes a PIN/password using bcrypt."""
    pin_bytes = pin.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_pin = bcrypt.hashpw(pin_bytes, salt)
    return hashed_pin.decode("utf-8")


def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verifies a plain PIN against its bcrypt hash."""
    return bcrypt.checkpw(
        plain_pin.encode("utf-8"),
        hashed_pin.encode("utf-8")
    )


def create_access_token(
    user_id: int,
    username: str,
    roles: Union[str, List[str]],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a signed JWT access token with user_id, username, roles, and exp."""
    role_list = [roles] if isinstance(roles, str) else list(roles)
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": str(user_id),
        "user_id": user_id,
        "username": username,
        "roles": role_list,
        "type": "access"
    }
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


def create_refresh_token(
    user_id: int,
    username: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a signed JWT refresh token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

    to_encode: Dict[str, Any] = {
        "exp": expire,
        "sub": str(user_id),
        "user_id": user_id,
        "username": username,
        "type": "refresh"
    }
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


def verify_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token."""
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM]
    )


def get_current_user_token_data(
    token: HTTPAuthorizationCredentials = Depends(reusable_oauth2)
) -> Dict[str, Any]:
    """
    Dependency that decodes and validates access token.
    Raises 401 on expired or invalid token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_token(token.credentials)
        token_type = payload.get("type")
        user_id = payload.get("user_id") or payload.get("sub")
        if not user_id or token_type != "access":
            raise credentials_exception
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_exception


def require_role(required_role: str):
    """Dependency factory that checks if current user token has the required role."""
    def role_checker(token_data: Dict[str, Any] = Depends(get_current_user_token_data)) -> Dict[str, Any]:
        roles = token_data.get("roles", [])
        if required_role.lower() not in [r.lower() for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {required_role}"
            )
        return token_data
    return role_checker


from app.models.user import User


def get_current_user(
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that fetches the active User ORM instance from DB."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizador associado ao token não encontrado.",
        )
    return user
