from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.rbac import require_admin
from app.core.security import get_current_user
from app.db.dependencies import get_db_session
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.users import SortOrder, UserAccessUpdate, UserListItem, UserListResponse, UserSortBy
from app.services.admin_user_service import AdminUserService

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin Users"],
    dependencies=[Depends(require_admin)],
)


@router.get(
    "",
    response_model=UserListResponse,
    summary="List users",
    description="List users with pagination, search, role filtering, and access filtering. Requires ADMIN role.",
)
async def list_users(
    search: str | None = Query(default=None, description="Search by email or full name."),
    role: UserRole | None = Query(default=None),
    is_locked: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    sort_by: UserSortBy = Query(default=UserSortBy.CREATED_AT),
    sort_order: SortOrder = Query(default=SortOrder.DESC),
    database_session: Session = Depends(get_db_session),
) -> UserListResponse:
    admin_user_service = AdminUserService(database_session)

    return admin_user_service.list_users(
        search=search,
        role=role,
        is_locked=is_locked,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.patch(
    "/{user_id}/access",
    response_model=UserListItem,
    summary="Block or unblock user access",
    description="Toggle account lock status. Locked users cannot access protected APIs.",
)
async def update_user_access(
    user_id: UUID,
    access_update: UserAccessUpdate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> UserListItem:
    admin_user_service = AdminUserService(database_session)

    return admin_user_service.update_user_access(user_id, access_update, current_user)


@router.delete(
    "/{user_id}",
    status_code=HTTPStatus.NO_CONTENT,
    summary="Delete user",
    description="Delete a user account if it does not own accounting records. Requires ADMIN role.",
)
async def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> None:
    admin_user_service = AdminUserService(database_session)
    admin_user_service.delete_user(user_id, current_user)
