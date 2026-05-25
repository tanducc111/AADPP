from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.rbac import require_accountant_or_admin
from app.core.security import get_current_user
from app.db.dependencies import get_db_session
from app.models.user import User
from app.schemas.client_companies import (
    ClientCompanyCreate,
    ClientCompanyListResponse,
    ClientCompanyRead,
    ClientCompanySortBy,
    ClientCompanyStatusUpdate,
    ClientCompanyUpdate,
    SortOrder,
)
from app.services.client_company_service import ClientCompanyService

router = APIRouter(
    prefix="/client-companies",
    tags=["Client Companies"],
    dependencies=[Depends(require_accountant_or_admin)],
)


@router.post(
    "",
    response_model=ClientCompanyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a client company",
    description="Create a client company. Requires ADMIN role.",
)
async def create_client_company(
    client_company_create: ClientCompanyCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> ClientCompanyRead:
    client_company_service = ClientCompanyService(database_session)

    return client_company_service.create_client_company(client_company_create, current_user)


@router.get(
    "",
    response_model=ClientCompanyListResponse,
    summary="List client companies",
    description="List client companies with pagination, search, filtering, and sorting.",
)
async def list_client_companies(
    search: str | None = Query(default=None, description="Search company name, tax code, contact, or email."),
    is_active: bool | None = Query(default=None, description="Filter by active status. ADMIN only sees inactive results."),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    sort_by: ClientCompanySortBy = Query(default=ClientCompanySortBy.COMPANY_NAME),
    sort_order: SortOrder = Query(default=SortOrder.ASC),
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> ClientCompanyListResponse:
    client_company_service = ClientCompanyService(database_session)

    return client_company_service.list_client_companies(
        current_user=current_user,
        search=search,
        is_active=is_active,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get(
    "/{client_company_id}",
    response_model=ClientCompanyRead,
    summary="Get a client company",
    description="Get a client company by ID. ACCOUNTANT can only access active companies.",
)
async def get_client_company(
    client_company_id: UUID,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> ClientCompanyRead:
    client_company_service = ClientCompanyService(database_session)

    return client_company_service.get_client_company(client_company_id, current_user)


@router.put(
    "/{client_company_id}",
    response_model=ClientCompanyRead,
    summary="Update a client company",
    description="Update a client company. Requires ADMIN role.",
)
async def update_client_company(
    client_company_id: UUID,
    client_company_update: ClientCompanyUpdate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> ClientCompanyRead:
    client_company_service = ClientCompanyService(database_session)

    return client_company_service.update_client_company(
        client_company_id,
        client_company_update,
        current_user,
    )


@router.delete(
    "/{client_company_id}",
    status_code=HTTPStatus.NO_CONTENT,
    summary="Delete a client company",
    description="Delete a client company. Requires ADMIN role.",
)
async def delete_client_company(
    client_company_id: UUID,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> None:
    client_company_service = ClientCompanyService(database_session)
    client_company_service.delete_client_company(client_company_id, current_user)


@router.patch(
    "/{client_company_id}/status",
    response_model=ClientCompanyRead,
    summary="Activate or deactivate a client company",
    description="Activate or deactivate a client company. Requires ADMIN role.",
)
async def update_client_company_status(
    client_company_id: UUID,
    status_update: ClientCompanyStatusUpdate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> ClientCompanyRead:
    client_company_service = ClientCompanyService(database_session)

    return client_company_service.update_client_company_status(
        client_company_id,
        status_update,
        current_user,
    )
