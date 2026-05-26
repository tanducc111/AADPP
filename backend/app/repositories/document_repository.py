import uuid
from datetime import datetime

from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.client_company import ClientCompany
from app.models.document import Document
from app.models.enums import DocumentStatus, DocumentType
from app.models.user import User
from app.repositories.base import BaseRepository
from app.schemas.documents import DocumentSortBy, SortOrder


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, database_session: Session) -> None:
        super().__init__(Document, database_session)

    def get_by_id_with_details(self, document_id: uuid.UUID) -> Document | None:
        statement = (
            select(Document)
            .options(
                joinedload(Document.client_company),
                joinedload(Document.uploaded_by),
            )
            .where(Document.id == document_id)
        )

        return self.database_session.scalar(statement)

    def list_documents(
        self,
        search: str | None,
        client_company_id: uuid.UUID | None,
        document_type: DocumentType | None,
        status: DocumentStatus | None,
        uploaded_from: datetime | None,
        uploaded_to: datetime | None,
        uploaded_by_user_id: uuid.UUID | None,
        page: int,
        page_size: int,
        sort_by: DocumentSortBy,
        sort_order: SortOrder,
    ) -> tuple[list[Document], int]:
        filtered_statement = self._apply_filters(
            select(Document)
            .join(Document.client_company)
            .join(Document.uploaded_by)
            .options(
                joinedload(Document.client_company),
                joinedload(Document.uploaded_by),
            ),
            search=search,
            client_company_id=client_company_id,
            document_type=document_type,
            status=status,
            uploaded_from=uploaded_from,
            uploaded_to=uploaded_to,
            uploaded_by_user_id=uploaded_by_user_id,
        )
        count_statement = self._apply_filters(
            select(func.count(Document.id)).join(Document.client_company).join(Document.uploaded_by),
            search=search,
            client_company_id=client_company_id,
            document_type=document_type,
            status=status,
            uploaded_from=uploaded_from,
            uploaded_to=uploaded_to,
            uploaded_by_user_id=uploaded_by_user_id,
        )
        total_records = self.database_session.scalar(count_statement) or 0
        sorted_statement = self._apply_sorting(
            filtered_statement,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        paginated_statement = sorted_statement.offset((page - 1) * page_size).limit(page_size)
        documents = list(self.database_session.scalars(paginated_statement).all())

        return documents, total_records

    def _apply_filters(
        self,
        statement: Select[tuple[Document]] | Select[tuple[int]],
        search: str | None,
        client_company_id: uuid.UUID | None,
        document_type: DocumentType | None,
        status: DocumentStatus | None,
        uploaded_from: datetime | None,
        uploaded_to: datetime | None,
        uploaded_by_user_id: uuid.UUID | None,
    ):
        if uploaded_by_user_id:
            statement = statement.where(Document.uploaded_by_user_id == uploaded_by_user_id)

        if client_company_id:
            statement = statement.where(Document.client_company_id == client_company_id)

        if document_type:
            statement = statement.where(Document.document_type == document_type)

        if status:
            statement = statement.where(Document.status == status)

        if uploaded_from:
            statement = statement.where(Document.uploaded_at >= uploaded_from)

        if uploaded_to:
            statement = statement.where(Document.uploaded_at <= uploaded_to)

        if search:
            search_pattern = f"%{search}%"
            statement = statement.where(
                or_(
                    Document.original_file_name.ilike(search_pattern),
                    Document.stored_file_name.ilike(search_pattern),
                    Document.document_category.ilike(search_pattern),
                    Document.note.ilike(search_pattern),
                    ClientCompany.company_name.ilike(search_pattern),
                    ClientCompany.tax_code.ilike(search_pattern),
                    User.full_name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                )
            )

        return statement

    def _apply_sorting(
        self,
        statement: Select[tuple[Document]],
        sort_by: DocumentSortBy,
        sort_order: SortOrder,
    ) -> Select[tuple[Document]]:
        sortable_columns = {
            DocumentSortBy.ORIGINAL_FILE_NAME: Document.original_file_name,
            DocumentSortBy.DOCUMENT_TYPE: Document.document_type,
            DocumentSortBy.STATUS: Document.status,
            DocumentSortBy.UPLOADED_AT: Document.uploaded_at,
            DocumentSortBy.FILE_SIZE: Document.file_size,
        }
        sort_column = sortable_columns[sort_by]
        sort_expression = asc(sort_column) if sort_order == SortOrder.ASC else desc(sort_column)

        return statement.order_by(sort_expression, Document.uploaded_at.desc())
