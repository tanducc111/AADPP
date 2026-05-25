from collections.abc import Callable

from fastapi import Depends

from app.core.exceptions import ForbiddenAccessError
from app.core.security import get_current_token_payload
from app.models.enums import UserRole
from app.schemas.auth import TokenPayload


def require_roles(*allowed_roles: UserRole) -> Callable[[TokenPayload], TokenPayload]:
    async def role_dependency(
        token_payload: TokenPayload = Depends(get_current_token_payload),
    ) -> TokenPayload:
        if token_payload.role not in allowed_roles:
            raise ForbiddenAccessError()

        return token_payload

    return role_dependency
