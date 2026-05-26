from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.rbac import require_accountant_or_admin, require_admin
from app.core.security import get_current_user
from app.db.dependencies import get_db_session
from app.models.user import User
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
from app.services.dashboard_service import DashboardService

dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(require_accountant_or_admin)],
)

admin_router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@dashboard_router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Get dashboard summary",
    description="Return role-scoped document, OCR, client company, and user metrics.",
)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> DashboardSummary:
    dashboard_service = DashboardService(database_session)

    return dashboard_service.get_summary(current_user)


@dashboard_router.get(
    "/documents-by-type",
    response_model=list[DocumentTypeAnalytics],
    summary="Get document counts by type",
    description="Return role-scoped document counts grouped by document type.",
)
async def get_documents_by_type(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> list[DocumentTypeAnalytics]:
    dashboard_service = DashboardService(database_session)

    return dashboard_service.get_documents_by_type(current_user)


@dashboard_router.get(
    "/documents-by-status",
    response_model=list[DocumentStatusAnalytics],
    summary="Get document counts by status",
    description="Return role-scoped document counts grouped by workflow status.",
)
async def get_documents_by_status(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> list[DocumentStatusAnalytics]:
    dashboard_service = DashboardService(database_session)

    return dashboard_service.get_documents_by_status(current_user)


@dashboard_router.get(
    "/uploads-over-time",
    response_model=list[UploadsOverTimeAnalytics],
    summary="Get upload trends",
    description="Return role-scoped upload counts grouped by day, week, or month.",
)
async def get_uploads_over_time(
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    group_by: UploadsGroupBy = Query(default=UploadsGroupBy.DAY),
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> list[UploadsOverTimeAnalytics]:
    dashboard_service = DashboardService(database_session)

    return dashboard_service.get_uploads_over_time(
        current_user=current_user,
        from_date=from_date,
        to_date=to_date,
        group_by=group_by,
    )


@dashboard_router.get(
    "/top-client-companies",
    response_model=list[TopClientCompanyAnalytics],
    summary="Get top client companies",
    description="Return client companies with the highest role-scoped document counts.",
)
async def get_top_client_companies(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> list[TopClientCompanyAnalytics]:
    dashboard_service = DashboardService(database_session)

    return dashboard_service.get_top_client_companies(current_user)


@dashboard_router.get(
    "/recent-activities",
    response_model=list[ActivityLogRead],
    summary="Get recent activity",
    description="Return recent role-scoped activity logs for the dashboard.",
)
async def get_recent_activities(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> list[ActivityLogRead]:
    dashboard_service = DashboardService(database_session)

    return dashboard_service.get_recent_activities(current_user, limit)


@admin_router.get(
    "/activity-logs",
    response_model=ActivityLogListResponse,
    summary="List admin activity logs",
    description="Return paginated audit logs. Requires ADMIN role.",
)
async def list_admin_activity_logs(
    search: str | None = Query(default=None, description="Search action, user, description, or target metadata."),
    action: str | None = Query(default=None),
    user_id: UUID | None = Query(default=None),
    from_date: date | None = Query(default=None),
    to_date: date | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    sort_by: ActivityLogSortBy = Query(default=ActivityLogSortBy.CREATED_AT),
    sort_order: SortOrder = Query(default=SortOrder.DESC),
    database_session: Session = Depends(get_db_session),
) -> ActivityLogListResponse:
    dashboard_service = DashboardService(database_session)

    return dashboard_service.list_admin_activity_logs(
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
