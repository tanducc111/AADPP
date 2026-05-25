import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import InvalidCredentialsError
from app.db.dependencies import get_db_session
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenPayload

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.api_v1_prefix}/auth/google")
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
        expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    token_payload: dict[str, Any] = {
        "sub": subject,
        "exp": token_expires_at,
    }

    if additional_claims:
        token_payload.update(additional_claims)

    return jwt.encode(
        token_payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(access_token: str) -> dict[str, Any]:
    settings = get_settings()

    try:
        return jwt.decode(
            access_token,
            settings.jwt_secret_key,
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


async def get_current_user(
    token_payload: TokenPayload = Depends(get_current_token_payload),
    database_session: Session = Depends(get_db_session),
) -> User:
    try:
        user_id = uuid.UUID(token_payload.sub)
    except ValueError as user_id_error:
        raise InvalidCredentialsError() from user_id_error

    user_repository = UserRepository(database_session)
    current_user = user_repository.get_by_id(user_id)

    if not current_user or not current_user.is_active or current_user.is_locked:
        raise InvalidCredentialsError()

    return current_user
