import math
import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import ResourceConflictError, ResourceNotFoundError
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.users import SortOrder, UserAccessUpdate, UserListItem, UserListResponse, UserSortBy
from app.services.activity_log_service import ActivityLogAction, ActivityLogService


class AdminUserService:
    def __init__(self, database_session: Session) -> None:
        self.database_session = database_session
        self.user_repository = UserRepository(database_session)
        self.activity_log_service = ActivityLogService(database_session)

    def list_users(
        self,
        search: str | None,
        role: UserRole | None,
        is_locked: bool | None,
        page: int,
        page_size: int,
        sort_by: UserSortBy,
        sort_order: SortOrder,
    ) -> UserListResponse:
        users, total_records = self.user_repository.list_users(
            search=search,
            role=role.value if role else None,
            is_locked=is_locked,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return UserListResponse(
            records=[self._map_user_list_item(user) for user in users],
            total=total_records,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total_records / page_size) if total_records else 0,
        )

    def update_user_access(
        self,
        user_id: uuid.UUID,
        access_update: UserAccessUpdate,
        current_user: User,
    ) -> UserListItem:
        target_user = self._get_existing_user(user_id)

        if target_user.id == current_user.id and access_update.is_locked:
            raise ResourceConflictError("You cannot block your own account.")

        target_user.is_locked = access_update.is_locked
        self.activity_log_service.record_auth_event(
            action=ActivityLogAction.BLOCK_USER if access_update.is_locked else ActivityLogAction.UNBLOCK_USER,
            user_id=current_user.id,
            description=(
                f"Blocked access for {target_user.email}."
                if access_update.is_locked
                else f"Unblocked access for {target_user.email}."
            ),
            event_metadata={
                "target_user_id": str(target_user.id),
                "target_user_email": target_user.email,
            },
        )
        self.database_session.commit()
        self.database_session.refresh(target_user)

        return self._map_user_list_item(target_user)

    def delete_user(self, user_id: uuid.UUID, current_user: User) -> None:
        target_user = self._get_existing_user(user_id)

        if target_user.id == current_user.id:
            raise ResourceConflictError("You cannot delete your own account.")

        if self.user_repository.has_business_records(target_user.id):
            raise ResourceConflictError(
                "User owns client companies or documents and cannot be deleted. Block access instead.",
            )

        self.activity_log_service.record_auth_event(
            action=ActivityLogAction.DELETE_USER,
            user_id=current_user.id,
            description=f"Deleted user {target_user.email}.",
            event_metadata={
                "target_user_id": str(target_user.id),
                "target_user_email": target_user.email,
            },
        )
        self.user_repository.clear_activity_log_user(target_user.id)
        self.user_repository.delete_user(target_user)
        self.database_session.commit()

    def _get_existing_user(self, user_id: uuid.UUID) -> User:
        user = self.user_repository.get_by_id(user_id)

        if not user:
            raise ResourceNotFoundError("User")

        return user

    def _map_user_list_item(self, user: User) -> UserListItem:
        return UserListItem(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            google_id=user.google_id,
            role=user.role,
            is_active=user.is_active,
            is_locked=user.is_locked,
            last_login_at=user.last_login_at,
            created_at=user.created_at,
            updated_at=user.updated_at,
            uploaded_document_count=self.user_repository.count_uploaded_documents(user.id),
            client_company_count=self.user_repository.count_client_companies(user.id),
        )
