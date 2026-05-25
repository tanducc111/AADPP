import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import UserRole


class TokenPayload(BaseModel):
    sub: str
    role: UserRole | None = None
    exp: int | None = None


class GoogleLoginRequest(BaseModel):
    id_token: str


class AuthenticatedUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    avatar_url: str | None
    role: UserRole
    is_active: bool
    last_login_at: datetime | None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthenticatedUser


class LogoutResponse(BaseModel):
    success: bool
    message: str


class GoogleTokenClaims(BaseModel):
    google_id: str
    email: EmailStr
    email_verified: bool
    full_name: str
    avatar_url: str | None = None
