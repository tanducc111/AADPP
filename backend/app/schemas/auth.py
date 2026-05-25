from pydantic import BaseModel, ConfigDict

from app.models.enums import UserRole


class TokenPayload(BaseModel):
    sub: str
    role: UserRole | None = None
    exp: int | None = None


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthenticatedUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: UserRole
