import uuid
from datetime import date, datetime, time
from typing import Any

from sqlalchemy import Select, case, cast, desc, func, or_, select
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.sqltypes import String

from app.models.activity_log import ActivityLog
from app.models.client_company import ClientCompany
from app.models.document import Document
from app.models.enums import DocumentStatus, DocumentType
from app.models.ocr_result import OcrResult
from app.models.user import User
from app.repositories.base import BaseRepository
from app.schemas.dashboard import ActivityLogSortBy, SortOrder


class DashboardRepository(BaseRepository[Document]):
    def __init__(self, database_session: Session) -> None:
        super().__init__(Document, database_session)

    def count_client_companies(self, active_only: bool = False) -> int:
        statement = select(func.count(ClientCompany.id))

        if active_only:
            statement = statement.where(ClientCompany.is_active.is_(True))

        return self.database_session.scalar(statement) or 0

    def count_users(self, active_only: bool = False) -> int:
        statement = select(func.count(User.id))

        if active_only:
            statement = statement.where(User.is_active.is_(True), User.is_locked.is_(False))

        return self.database_session.scalar(statement) or 0

    def count_documents_by_status(
        self,
        uploaded_by_user_id: uuid.UUID | None = None,
    ) -> dict[DocumentStatus, int]:
        statement = select(Document.status, func.count(Document.id)).group_by(Document.status)
        statement = self._scope_documents(statement, uploaded_by_user_id)
        status_counts = {document_status: 0 for document_status in DocumentStatus}

        for document_status, document_count in self.database_session.execute(statement).all():
            status_counts[document_status] = document_count

        return status_counts

    def count_documents_by_type(
        self,
        uploaded_by_user_id: uuid.UUID | None = None,
    ) -> dict[DocumentType, int]:
        statement = select(Document.document_type, func.count(Document.id)).group_by(Document.document_type)
        statement = self._scope_documents(statement, uploaded_by_user_id)
        type_counts = {document_type: 0 for document_type in DocumentType}

        for document_type, document_count in self.database_session.execute(statement).all():
            type_counts[document_type] = document_count

        return type_counts

    def count_ocr_results(self, uploaded_by_user_id: uuid.UUID | None = None) -> int:
        statement = select(func.count(OcrResult.id)).join(Document, OcrResult.document_id == Document.id)
        statement = self._scope_documents(statement, uploaded_by_user_id)

        return self.database_session.scalar(statement) or 0

    def get_uploads_over_time(
        self,
        from_date: date | None,
        to_date: date | None,
        group_by: str,
        uploaded_by_user_id: uuid.UUID | None = None,
    ) -> list[tuple[date, int]]:
        bucket_expression = func.date_trunc(group_by, Document.uploaded_at).label("upload_bucket")
        statement = (
            select(bucket_expression, func.count(Document.id))
            .group_by(bucket_expression)
            .order_by(bucket_expression)
        )
        statement = self._scope_documents(statement, uploaded_by_user_id)

        if from_date:
            statement = statement.where(Document.uploaded_at >= datetime.combine(from_date, time.min))

        if to_date:
            statement = statement.where(Document.uploaded_at <= datetime.combine(to_date, time.max))

        return [
            (upload_bucket.date(), document_count)
            for upload_bucket, document_count in self.database_session.execute(statement).all()
        ]

    def get_top_client_companies(
        self,
        uploaded_by_user_id: uuid.UUID | None = None,
        limit: int = 5,
    ) -> list[tuple[uuid.UUID, str, int, int, int]]:
        approved_count_expression = func.coalesce(
            func.sum(case((Document.status == DocumentStatus.APPROVED, 1), else_=0)),
            0,
        )
        failed_count_expression = func.coalesce(
            func.sum(case((Document.status == DocumentStatus.FAILED, 1), else_=0)),
            0,
        )
        document_count_expression = func.count(Document.id)
        statement = (
            select(
                ClientCompany.id,
                ClientCompany.company_name,
                document_count_expression,
                approved_count_expression,
                failed_count_expression,
            )
            .join(Document, Document.client_company_id == ClientCompany.id)
            .group_by(ClientCompany.id, ClientCompany.company_name)
            .order_by(desc(document_count_expression), ClientCompany.company_name.asc())
            .limit(limit)
        )
        statement = self._scope_documents(statement, uploaded_by_user_id)

        return list(self.database_session.execute(statement).all())

    def list_recent_activity_logs(
        self,
        user_id: uuid.UUID | None,
        limit: int,
    ) -> list[ActivityLog]:
        statement = (
            select(ActivityLog)
            .options(joinedload(ActivityLog.user))
            .outerjoin(ActivityLog.user)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
        )

        if user_id:
            statement = statement.where(ActivityLog.user_id == user_id)

        return list(self.database_session.scalars(statement).all())

    def list_activity_logs(
        self,
        search: str | None,
        action: str | None,
        user_id: uuid.UUID | None,
        from_date: date | None,
        to_date: date | None,
        page: int,
        page_size: int,
        sort_by: ActivityLogSortBy,
        sort_order: SortOrder,
    ) -> tuple[list[ActivityLog], int]:
        filtered_statement = self._apply_activity_log_filters(
            select(ActivityLog).options(joinedload(ActivityLog.user)).outerjoin(ActivityLog.user),
            search=search,
            action=action,
            user_id=user_id,
            from_date=from_date,
            to_date=to_date,
        )
        count_statement = self._apply_activity_log_filters(
            select(func.count(ActivityLog.id)).outerjoin(ActivityLog.user),
            search=search,
            action=action,
            user_id=user_id,
            from_date=from_date,
            to_date=to_date,
        )
        total_records = self.database_session.scalar(count_statement) or 0
        sorted_statement = self._apply_activity_log_sorting(
            filtered_statement,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        paginated_statement = sorted_statement.offset((page - 1) * page_size).limit(page_size)
        activity_logs = list(self.database_session.scalars(paginated_statement).all())

        return activity_logs, total_records

    def _scope_documents(
        self,
        statement: Select[Any],
        uploaded_by_user_id: uuid.UUID | None,
    ) -> Select[Any]:
        if uploaded_by_user_id:
            statement = statement.where(Document.uploaded_by_user_id == uploaded_by_user_id)

        return statement

    def _apply_activity_log_filters(
        self,
        statement: Select[Any],
        search: str | None,
        action: str | None,
        user_id: uuid.UUID | None,
        from_date: date | None,
        to_date: date | None,
    ) -> Select[Any]:
        if action:
            statement = statement.where(ActivityLog.action == action)

        if user_id:
            statement = statement.where(ActivityLog.user_id == user_id)

        if from_date:
            statement = statement.where(ActivityLog.created_at >= datetime.combine(from_date, time.min))

        if to_date:
            statement = statement.where(ActivityLog.created_at <= datetime.combine(to_date, time.max))

        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    ActivityLog.action.ilike(search_pattern),
                    ActivityLog.description.ilike(search_pattern),
                    User.full_name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                    cast(ActivityLog.event_metadata, String).ilike(search_pattern),
                )
            )

        return statement

    def _apply_activity_log_sorting(
        self,
        statement: Select[tuple[ActivityLog]],
        sort_by: ActivityLogSortBy,
        sort_order: SortOrder,
    ) -> Select[tuple[ActivityLog]]:
        sortable_columns = {
            ActivityLogSortBy.CREATED_AT: ActivityLog.created_at,
            ActivityLogSortBy.ACTION: ActivityLog.action,
            ActivityLogSortBy.USER_EMAIL: User.email,
        }
        sort_column = sortable_columns[sort_by]
        sort_expression = sort_column.asc() if sort_order == SortOrder.ASC else sort_column.desc()

        return statement.order_by(sort_expression, ActivityLog.created_at.desc())
