from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.exceptions import InvalidCredentialsError
from app.schemas.auth import TokenPayload

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/login")
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return password_context.verify(plain_password, password_hash)


def hash_password(plain_password: str) -> str:
    return password_context.hash(plain_password)


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
    additional_claims: dict[str, Any] | None = None,
) -> str:
    settings = get_settings()
    token_expires_at = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    token_payload: dict[str, Any] = {
        "sub": subject,
        "exp": token_expires_at,
    }

    if additional_claims:
        token_payload.update(additional_claims)

    return jwt.encode(
        token_payload,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(access_token: str) -> dict[str, Any]:
    settings = get_settings()

    try:
        return jwt.decode(
            access_token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as token_error:
        raise InvalidCredentialsError() from token_error


async def get_current_token_payload(access_token: str = Depends(oauth2_scheme)) -> TokenPayload:
    decoded_token = decode_access_token(access_token)

    try:
        return TokenPayload.model_validate(decoded_token)
    except ValueError as validation_error:
        raise InvalidCredentialsError() from validation_error
