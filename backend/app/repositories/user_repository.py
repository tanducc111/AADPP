import uuid

from sqlalchemy import Select, asc, desc, func, or_, select, update
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.client_company import ClientCompany
from app.models.document import Document
from app.models.user import User
from app.repositories.base import BaseRepository
from app.schemas.users import SortOrder, UserSortBy


class UserRepository(BaseRepository[User]):
    def __init__(self, database_session: Session) -> None:
        super().__init__(User, database_session)

    def get_by_email(self, email: str) -> User | None:
        normalized_email = email.lower()
        statement = select(User).where(User.email == normalized_email)

        return self.database_session.scalar(statement)

    def get_by_google_id(self, google_id: str) -> User | None:
        statement = select(User).where(User.google_id == google_id)

        return self.database_session.scalar(statement)

    def count_users(self) -> int:
        statement = select(func.count(User.id))

        return self.database_session.scalar(statement) or 0

    def get_by_id(self, model_id: uuid.UUID) -> User | None:
        return super().get_by_id(model_id)

    def list_users(
        self,
        search: str | None,
        role: str | None,
        is_locked: bool | None,
        page: int,
        page_size: int,
        sort_by: UserSortBy,
        sort_order: SortOrder,
    ) -> tuple[list[User], int]:
        filtered_statement = self._apply_filters(
            select(User),
            search=search,
            role=role,
            is_locked=is_locked,
        )
        count_statement = self._apply_filters(
            select(func.count(User.id)),
            search=search,
            role=role,
            is_locked=is_locked,
        )
        total_records = self.database_session.scalar(count_statement) or 0
        sorted_statement = self._apply_sorting(
            filtered_statement,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        paginated_statement = sorted_statement.offset((page - 1) * page_size).limit(page_size)
        users = list(self.database_session.scalars(paginated_statement).all())

        return users, total_records

    def count_uploaded_documents(self, user_id: uuid.UUID) -> int:
        statement = select(func.count(Document.id)).where(Document.uploaded_by_user_id == user_id)

        return self.database_session.scalar(statement) or 0

    def count_client_companies(self, user_id: uuid.UUID) -> int:
        statement = select(func.count(ClientCompany.id)).where(ClientCompany.created_by_user_id == user_id)

        return self.database_session.scalar(statement) or 0

    def has_business_records(self, user_id: uuid.UUID) -> bool:
        return self.count_uploaded_documents(user_id) > 0 or self.count_client_companies(user_id) > 0

    def clear_activity_log_user(self, user_id: uuid.UUID) -> None:
        statement = update(ActivityLog).where(ActivityLog.user_id == user_id).values(user_id=None)
        self.database_session.execute(statement)

    def delete_user(self, user: User) -> None:
        self.database_session.delete(user)

    def _apply_filters(
        self,
        statement: Select[tuple[User]] | Select[tuple[int]],
        search: str | None,
        role: str | None,
        is_locked: bool | None,
    ):
        if role:
            statement = statement.where(User.role == role)

        if is_locked is not None:
            statement = statement.where(User.is_locked.is_(is_locked))

        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    User.email.ilike(search_pattern),
                    User.full_name.ilike(search_pattern),
                )
            )

        return statement

    def _apply_sorting(
        self,
        statement: Select[tuple[User]],
        sort_by: UserSortBy,
        sort_order: SortOrder,
    ) -> Select[tuple[User]]:
        sortable_columns = {
            UserSortBy.EMAIL: User.email,
            UserSortBy.FULL_NAME: User.full_name,
            UserSortBy.ROLE: User.role,
            UserSortBy.LAST_LOGIN_AT: User.last_login_at,
            UserSortBy.CREATED_AT: User.created_at,
        }
        sort_column = sortable_columns[sort_by]
        sort_expression = asc(sort_column) if sort_order == SortOrder.ASC else desc(sort_column)

        return statement.order_by(sort_expression, User.created_at.desc())
