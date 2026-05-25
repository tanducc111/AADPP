from math import ceil
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenAccessError, ResourceConflictError, ResourceNotFoundError
from app.models.client_company import ClientCompany
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.client_company_repository import ClientCompanyRepository
from app.schemas.client_companies import (
    ClientCompanyCreate,
    ClientCompanyListResponse,
    ClientCompanyRead,
    ClientCompanySortBy,
    ClientCompanyStatusUpdate,
    ClientCompanyUpdate,
    SortOrder,
)
from app.services.activity_log_service import ActivityLogAction, ActivityLogService


class ClientCompanyService:
    def __init__(self, database_session: Session) -> None:
        self.database_session = database_session
        self.client_company_repository = ClientCompanyRepository(database_session)
        self.activity_log_service = ActivityLogService(database_session)

    def create_client_company(
        self,
        client_company_create: ClientCompanyCreate,
        current_user: User,
    ) -> ClientCompanyRead:
        self._ensure_admin(current_user)
        self._ensure_unique_tax_code(client_company_create.tax_code)

        client_company = ClientCompany(
            company_name=client_company_create.company_name,
            tax_code=client_company_create.tax_code,
            address=client_company_create.address,
            contact_person=client_company_create.contact_person,
            phone_number=client_company_create.phone_number,
            email=str(client_company_create.email) if client_company_create.email else None,
            description=client_company_create.description,
            is_active=True,
            created_by_user_id=current_user.id,
        )
        self.client_company_repository.add(client_company)
        self.activity_log_service.record_client_company_event(
            action=ActivityLogAction.CREATE_CLIENT_COMPANY,
            user_id=current_user.id,
            description=f"Created client company {client_company.company_name}.",
            event_metadata={"company_name": client_company.company_name},
        )
        self.database_session.commit()
        self.database_session.refresh(client_company)

        return ClientCompanyRead.model_validate(client_company)

    def list_client_companies(
        self,
        current_user: User,
        search: str | None,
        is_active: bool | None,
        page: int,
        page_size: int,
        sort_by: ClientCompanySortBy,
        sort_order: SortOrder,
    ) -> ClientCompanyListResponse:
        active_only = current_user.role != UserRole.ADMIN
        normalized_search = search.strip() if search else None
        client_companies, total_records = self.client_company_repository.list_client_companies(
            search=normalized_search or None,
            is_active=is_active,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
            active_only=active_only,
        )
        total_pages = ceil(total_records / page_size) if total_records else 0

        return ClientCompanyListResponse(
            records=[
                ClientCompanyRead.model_validate(client_company)
                for client_company in client_companies
            ],
            total=total_records,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def get_client_company(self, client_company_id: UUID, current_user: User) -> ClientCompanyRead:
        client_company = self._get_accessible_client_company(client_company_id, current_user)

        return ClientCompanyRead.model_validate(client_company)

    def update_client_company(
        self,
        client_company_id: UUID,
        client_company_update: ClientCompanyUpdate,
        current_user: User,
    ) -> ClientCompanyRead:
        self._ensure_admin(current_user)
        client_company = self._get_existing_client_company(client_company_id)
        update_values = client_company_update.model_dump(exclude_unset=True)

        if "email" in update_values and update_values["email"] is not None:
            update_values["email"] = str(update_values["email"])

        requested_tax_code = update_values.get("tax_code")
        if requested_tax_code:
            self._ensure_unique_tax_code(
                tax_code=requested_tax_code,
                excluded_company_id=client_company.id,
            )

        for field_name, field_value in update_values.items():
            setattr(client_company, field_name, field_value)

        self.activity_log_service.record_client_company_event(
            action=ActivityLogAction.UPDATE_CLIENT_COMPANY,
            user_id=current_user.id,
            description=f"Updated client company {client_company.company_name}.",
            event_metadata=self._build_event_metadata(client_company),
        )
        self.database_session.commit()
        self.database_session.refresh(client_company)

        return ClientCompanyRead.model_validate(client_company)

    def delete_client_company(self, client_company_id: UUID, current_user: User) -> None:
        self._ensure_admin(current_user)
        client_company = self._get_existing_client_company(client_company_id)
        event_metadata = self._build_event_metadata(client_company)

        self.database_session.delete(client_company)
        self.activity_log_service.record_client_company_event(
            action=ActivityLogAction.DELETE_CLIENT_COMPANY,
            user_id=current_user.id,
            description=f"Deleted client company {client_company.company_name}.",
            event_metadata=event_metadata,
        )
        self.database_session.commit()

    def update_client_company_status(
        self,
        client_company_id: UUID,
        status_update: ClientCompanyStatusUpdate,
        current_user: User,
    ) -> ClientCompanyRead:
        self._ensure_admin(current_user)
        client_company = self._get_existing_client_company(client_company_id)
        client_company.is_active = status_update.is_active
        activity_action = (
            ActivityLogAction.ACTIVATE_CLIENT_COMPANY
            if status_update.is_active
            else ActivityLogAction.DEACTIVATE_CLIENT_COMPANY
        )

        self.activity_log_service.record_client_company_event(
            action=activity_action,
            user_id=current_user.id,
            description=f"Changed client company status for {client_company.company_name}.",
            event_metadata=self._build_event_metadata(client_company),
        )
        self.database_session.commit()
        self.database_session.refresh(client_company)

        return ClientCompanyRead.model_validate(client_company)

    def _get_existing_client_company(self, client_company_id: UUID) -> ClientCompany:
        client_company = self.client_company_repository.get_by_id(client_company_id)

        if not client_company:
            raise ResourceNotFoundError("Client company")

        return client_company

    def _get_accessible_client_company(
        self,
        client_company_id: UUID,
        current_user: User,
    ) -> ClientCompany:
        client_company = self._get_existing_client_company(client_company_id)

        if current_user.role != UserRole.ADMIN and not client_company.is_active:
            raise ResourceNotFoundError("Client company")

        return client_company

    def _ensure_unique_tax_code(
        self,
        tax_code: str | None,
        excluded_company_id: UUID | None = None,
    ) -> None:
        if not tax_code:
            return

        if self.client_company_repository.tax_code_exists(tax_code, excluded_company_id):
            raise ResourceConflictError("A client company with this tax code already exists.")

    def _ensure_admin(self, current_user: User) -> None:
        if current_user.role != UserRole.ADMIN:
            raise ForbiddenAccessError()

    def _build_event_metadata(self, client_company: ClientCompany) -> dict[str, Any]:
        return {
            "client_company_id": str(client_company.id),
            "company_name": client_company.company_name,
            "tax_code": client_company.tax_code,
            "is_active": client_company.is_active,
        }
