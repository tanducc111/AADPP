import math
import uuid
from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import InvalidDateRangeError
from app.models.activity_log import ActivityLog
from app.models.enums import DocumentStatus, UserRole
from app.models.user import User
from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import (
    ActivityLogListResponse,
    ActivityLogRead,
    ActivityLogSortBy,
    DashboardSummary,
    DocumentStatusAnalytics,
    DocumentTypeAnalytics,
    SortOrder,
    TopClientCompanyAnalytics,
    UploadsGroupBy,
    UploadsOverTimeAnalytics,
)


class DashboardService:
    def __init__(self, database_session: Session) -> None:
        self.dashboard_repository = DashboardRepository(database_session)

    def get_summary(self, current_user: User) -> DashboardSummary:
        uploaded_by_user_id = self._get_document_scope_user_id(current_user)
        status_counts = self.dashboard_repository.count_documents_by_status(uploaded_by_user_id)
        total_documents = sum(status_counts.values())
        total_ocr_results = self.dashboard_repository.count_ocr_results(uploaded_by_user_id)
        successful_ocr_documents = (
            status_counts[DocumentStatus.OCR_DONE]
            + status_counts[DocumentStatus.REVIEWED]
            + status_counts[DocumentStatus.APPROVED]
        )
        completed_ocr_documents = successful_ocr_documents + status_counts[DocumentStatus.FAILED]
        ocr_success_rate = (
            successful_ocr_documents / completed_ocr_documents if completed_ocr_documents else 0
        )

        if current_user.role == UserRole.ADMIN:
            total_client_companies = self.dashboard_repository.count_client_companies()
            total_users = self.dashboard_repository.count_users()
            active_users = self.dashboard_repository.count_users(active_only=True)
        else:
            total_client_companies = self.dashboard_repository.count_client_companies(active_only=True)
            total_users = 0
            active_users = 0

        active_client_companies = self.dashboard_repository.count_client_companies(active_only=True)

        return DashboardSummary(
            total_client_companies=total_client_companies,
            active_client_companies=active_client_companies,
            total_documents=total_documents,
            uploaded_documents=status_counts[DocumentStatus.UPLOADED],
            processing_documents=status_counts[DocumentStatus.PROCESSING],
            ocr_done_documents=status_counts[DocumentStatus.OCR_DONE],
            reviewed_documents=status_counts[DocumentStatus.REVIEWED],
            approved_documents=status_counts[DocumentStatus.APPROVED],
            failed_documents=status_counts[DocumentStatus.FAILED],
            total_ocr_results=total_ocr_results,
            ocr_success_rate=round(ocr_success_rate, 4),
            total_users=total_users,
            active_users=active_users,
        )

    def get_documents_by_type(self, current_user: User) -> list[DocumentTypeAnalytics]:
        type_counts = self.dashboard_repository.count_documents_by_type(
            self._get_document_scope_user_id(current_user),
        )

        return [
            DocumentTypeAnalytics(document_type=document_type, count=document_count)
            for document_type, document_count in type_counts.items()
        ]

    def get_documents_by_status(self, current_user: User) -> list[DocumentStatusAnalytics]:
        status_counts = self.dashboard_repository.count_documents_by_status(
            self._get_document_scope_user_id(current_user),
        )

        return [
            DocumentStatusAnalytics(status=document_status, count=document_count)
            for document_status, document_count in status_counts.items()
        ]

    def get_uploads_over_time(
        self,
        current_user: User,
        from_date: date | None,
        to_date: date | None,
        group_by: UploadsGroupBy,
    ) -> list[UploadsOverTimeAnalytics]:
        self._ensure_valid_date_range(from_date, to_date)
        upload_counts = self.dashboard_repository.get_uploads_over_time(
            from_date=from_date,
            to_date=to_date,
            group_by=group_by.value,
            uploaded_by_user_id=self._get_document_scope_user_id(current_user),
        )

        return [
            UploadsOverTimeAnalytics(date=upload_date, count=document_count)
            for upload_date, document_count in upload_counts
        ]

    def get_top_client_companies(self, current_user: User) -> list[TopClientCompanyAnalytics]:
        top_client_companies = self.dashboard_repository.get_top_client_companies(
            uploaded_by_user_id=self._get_document_scope_user_id(current_user),
        )

        return [
            TopClientCompanyAnalytics(
                client_company_id=client_company_id,
                company_name=company_name,
                document_count=document_count,
                approved_count=approved_count,
                failed_count=failed_count,
            )
            for (
                client_company_id,
                company_name,
                document_count,
                approved_count,
                failed_count,
            ) in top_client_companies
        ]

    def get_recent_activities(self, current_user: User, limit: int) -> list[ActivityLogRead]:
        activity_logs = self.dashboard_repository.list_recent_activity_logs(
            user_id=None if current_user.role == UserRole.ADMIN else current_user.id,
            limit=limit,
        )

        return [self._map_activity_log(activity_log) for activity_log in activity_logs]

    def list_admin_activity_logs(
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
    ) -> ActivityLogListResponse:
        self._ensure_valid_date_range(from_date, to_date)
        activity_logs, total_records = self.dashboard_repository.list_activity_logs(
            search=search,
            action=action,
            user_id=user_id,
            from_date=from_date,
            to_date=to_date,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return ActivityLogListResponse(
            records=[self._map_activity_log(activity_log) for activity_log in activity_logs],
            total=total_records,
            page=page,
            page_size=page_size,
            total_pages=math.ceil(total_records / page_size) if total_records else 0,
        )

    def _get_document_scope_user_id(self, current_user: User) -> uuid.UUID | None:
        if current_user.role == UserRole.ADMIN:
            return None

        return current_user.id

    def _ensure_valid_date_range(self, from_date: date | None, to_date: date | None) -> None:
        if from_date and to_date and from_date > to_date:
            raise InvalidDateRangeError()

    def _map_activity_log(self, activity_log: ActivityLog) -> ActivityLogRead:
        target_type, target_id = self._get_activity_target(activity_log)

        return ActivityLogRead(
            id=activity_log.id,
            action=activity_log.action,
            user_name=activity_log.user.full_name if activity_log.user else None,
            user_email=activity_log.user.email if activity_log.user else None,
            target_type=target_type,
            target_id=target_id,
            created_at=activity_log.created_at,
        )

    def _get_activity_target(self, activity_log: ActivityLog) -> tuple[str | None, str | None]:
        if activity_log.document_id:
            return "DOCUMENT", str(activity_log.document_id)

        event_metadata = activity_log.event_metadata or {}

        if event_metadata.get("client_company_id"):
            return "CLIENT_COMPANY", str(event_metadata["client_company_id"])

        if activity_log.user_id:
            return "USER", str(activity_log.user_id)

        return None, None
