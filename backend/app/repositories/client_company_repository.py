import uuid

from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.models.client_company import ClientCompany
from app.repositories.base import BaseRepository
from app.schemas.client_companies import ClientCompanySortBy, SortOrder


class ClientCompanyRepository(BaseRepository[ClientCompany]):
    def __init__(self, database_session: Session) -> None:
        super().__init__(ClientCompany, database_session)

    def get_by_tax_code(self, tax_code: str) -> ClientCompany | None:
        statement = select(ClientCompany).where(ClientCompany.tax_code == tax_code)

        return self.database_session.scalar(statement)

    def tax_code_exists(self, tax_code: str, excluded_company_id: uuid.UUID | None = None) -> bool:
        statement = select(func.count(ClientCompany.id)).where(ClientCompany.tax_code == tax_code)

        if excluded_company_id:
            statement = statement.where(ClientCompany.id != excluded_company_id)

        return bool(self.database_session.scalar(statement))

    def list_client_companies(
        self,
        search: str | None,
        is_active: bool | None,
        page: int,
        page_size: int,
        sort_by: ClientCompanySortBy,
        sort_order: SortOrder,
        active_only: bool,
    ) -> tuple[list[ClientCompany], int]:
        filtered_statement = self._apply_filters(
            select(ClientCompany),
            search=search,
            is_active=is_active,
            active_only=active_only,
        )
        count_statement = self._apply_filters(
            select(func.count(ClientCompany.id)),
            search=search,
            is_active=is_active,
            active_only=active_only,
        )
        total_records = self.database_session.scalar(count_statement) or 0
        sorted_statement = self._apply_sorting(
            filtered_statement,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        paginated_statement = sorted_statement.offset((page - 1) * page_size).limit(page_size)
        client_companies = list(self.database_session.scalars(paginated_statement).all())

        return client_companies, total_records

    def _apply_filters(
        self,
        statement: Select[tuple[ClientCompany]] | Select[tuple[int]],
        search: str | None,
        is_active: bool | None,
        active_only: bool,
    ):
        if active_only:
            statement = statement.where(ClientCompany.is_active.is_(True))
        elif is_active is not None:
            statement = statement.where(ClientCompany.is_active.is_(is_active))

        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    ClientCompany.company_name.ilike(search_pattern),
                    ClientCompany.tax_code.ilike(search_pattern),
                    ClientCompany.contact_person.ilike(search_pattern),
                    ClientCompany.email.ilike(search_pattern),
                )
            )

        return statement

    def _apply_sorting(
        self,
        statement: Select[tuple[ClientCompany]],
        sort_by: ClientCompanySortBy,
        sort_order: SortOrder,
    ) -> Select[tuple[ClientCompany]]:
        sortable_columns = {
            ClientCompanySortBy.COMPANY_NAME: ClientCompany.company_name,
            ClientCompanySortBy.TAX_CODE: ClientCompany.tax_code,
            ClientCompanySortBy.CREATED_AT: ClientCompany.created_at,
            ClientCompanySortBy.UPDATED_AT: ClientCompany.updated_at,
            ClientCompanySortBy.IS_ACTIVE: ClientCompany.is_active,
        }
        sort_column = sortable_columns[sort_by]
        sort_expression = asc(sort_column) if sort_order == SortOrder.ASC else desc(sort_column)

        return statement.order_by(sort_expression, ClientCompany.created_at.desc())
