from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    role: str = Field(default="operator", max_length=50)


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    pin: str = Field(..., min_length=4, max_length=10, description="Numeric or alphanumeric PIN/password")
    role: str = Field(default="operator", max_length=50)
    email: Optional[str] = None


class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    pin: str = Field(..., min_length=4, max_length=10)


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    is_active: bool
    email: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
