from collections.abc import Callable

from fastapi import Depends

from app.core.exceptions import ForbiddenAccessError
from app.core.security import get_current_user
from app.models.enums import UserRole
from app.models.user import User


def require_roles(*allowed_roles: UserRole) -> Callable[[User], User]:
    async def role_dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenAccessError()

        return current_user

    return role_dependency


require_admin = require_roles(UserRole.ADMIN)
require_accountant_or_admin = require_roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
