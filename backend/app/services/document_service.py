import logging
import uuid
from datetime import datetime
from math import ceil

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import (
    ForbiddenAccessError,
    InvalidDocumentOperationError,
    ResourceNotFoundError,
)
from app.models.document import Document
from app.models.enums import DocumentStatus, DocumentType, UserRole
from app.models.user import User
from app.repositories.client_company_repository import ClientCompanyRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.documents import (
    DocumentDetail,
    DocumentListResponse,
    DocumentRead,
    DocumentSortBy,
    DocumentUploadForm,
    SortOrder,
)
from app.services.activity_log_service import ActivityLogAction, ActivityLogService
from app.services.file_storage_service import DownloadableDocumentFile, FileStorageService
from app.utils.datetime import utc_now

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(self, database_session: Session) -> None:
        self.database_session = database_session
        self.client_company_repository = ClientCompanyRepository(database_session)
        self.document_repository = DocumentRepository(database_session)
        self.activity_log_service = ActivityLogService(database_session)
        self.file_storage_service = FileStorageService()

    async def upload_document(
        self,
        uploaded_file: UploadFile,
        upload_form: DocumentUploadForm,
        current_user: User,
    ) -> DocumentRead:
        client_company = self.client_company_repository.get_by_id(upload_form.client_company_id)

        if not client_company:
            raise ResourceNotFoundError("Client company")

        if not client_company.is_active:
            raise InvalidDocumentOperationError("Cannot upload documents for an inactive client company.")

        document_id = uuid.uuid4()
        uploaded_at = utc_now()
        stored_file = await self.file_storage_service.store_document_file(
            uploaded_file=uploaded_file,
            document_id=document_id,
            uploaded_at=uploaded_at,
        )
        document = Document(
            id=document_id,
            client_company_id=client_company.id,
            uploaded_by_user_id=current_user.id,
            original_file_name=stored_file.original_file_name,
            stored_file_name=stored_file.stored_file_name,
            file_path=stored_file.file_path,
            file_size=stored_file.file_size,
            mime_type=stored_file.mime_type,
            document_type=upload_form.document_type,
            document_category=upload_form.document_category,
            status=DocumentStatus.UPLOADED,
            note=upload_form.note,
            uploaded_at=uploaded_at,
        )

        try:
            self.document_repository.add(document)
            self.activity_log_service.record_document_event(
                action=ActivityLogAction.UPLOAD_DOCUMENT,
                user_id=current_user.id,
                document_id=document.id,
                description=f"Uploaded document {document.original_file_name}.",
                event_metadata=self._build_event_metadata(document),
            )
            self.database_session.commit()
            self.database_session.refresh(document)
        except Exception:
            self.database_session.rollback()
            self.file_storage_service.delete_file_if_exists(stored_file.file_path)
            raise

        return DocumentRead.model_validate(document)

    def list_documents(
        self,
        current_user: User,
        search: str | None,
        client_company_id: uuid.UUID | None,
        document_type: DocumentType | None,
        status: DocumentStatus | None,
        uploaded_from: datetime | None,
        uploaded_to: datetime | None,
        page: int,
        page_size: int,
        sort_by: DocumentSortBy,
        sort_order: SortOrder,
    ) -> DocumentListResponse:
        uploaded_by_user_id = current_user.id if current_user.role != UserRole.ADMIN else None
        normalized_search = search.strip() if search else None
        documents, total_records = self.document_repository.list_documents(
            search=normalized_search or None,
            client_company_id=client_company_id,
            document_type=document_type,
            status=status,
            uploaded_from=uploaded_from,
            uploaded_to=uploaded_to,
            uploaded_by_user_id=uploaded_by_user_id,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total_pages = ceil(total_records / page_size) if total_records else 0

        return DocumentListResponse(
            records=[DocumentDetail.model_validate(document) for document in documents],
            total=total_records,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def get_document(self, document_id: uuid.UUID, current_user: User) -> DocumentDetail:
        document = self._get_accessible_document(document_id, current_user)
        self.activity_log_service.record_document_event(
            action=ActivityLogAction.VIEW_DOCUMENT,
            user_id=current_user.id,
            document_id=document.id,
            description=f"Viewed document {document.original_file_name}.",
            event_metadata=self._build_event_metadata(document),
        )
        self.database_session.commit()

        return DocumentDetail.model_validate(document)

    def get_downloadable_document_file(
        self,
        document_id: uuid.UUID,
        current_user: User,
    ) -> DownloadableDocumentFile:
        document = self._get_accessible_document(document_id, current_user)
        downloadable_file = self.file_storage_service.get_downloadable_file(
            file_path=document.file_path,
            original_file_name=document.original_file_name,
            mime_type=document.mime_type,
        )
        self.activity_log_service.record_document_event(
            action=ActivityLogAction.DOWNLOAD_DOCUMENT,
            user_id=current_user.id,
            document_id=document.id,
            description=f"Downloaded document {document.original_file_name}.",
            event_metadata=self._build_event_metadata(document),
        )
        self.database_session.commit()

        return downloadable_file

    def delete_document(self, document_id: uuid.UUID, current_user: User) -> None:
        document = self._get_accessible_document(document_id, current_user)
        self._ensure_can_delete_document(document, current_user)
        event_metadata = self._build_event_metadata(document)
        file_path = document.file_path
        original_file_name = document.original_file_name

        self.activity_log_service.record_document_event(
            action=ActivityLogAction.DELETE_DOCUMENT,
            user_id=current_user.id,
            description=f"Deleted document {original_file_name}.",
            event_metadata=event_metadata,
        )
        self.database_session.delete(document)
        self.database_session.commit()

        was_deleted = self.file_storage_service.delete_file_if_exists(file_path)

        if not was_deleted:
            logger.warning("Document metadata was deleted but file was not removed.")

    def _get_accessible_document(self, document_id: uuid.UUID, current_user: User) -> Document:
        document = self.document_repository.get_by_id_with_details(document_id)

        if not document:
            raise ResourceNotFoundError("Document")

        if current_user.role != UserRole.ADMIN and document.uploaded_by_user_id != current_user.id:
            raise ResourceNotFoundError("Document")

        return document

    def _ensure_can_delete_document(self, document: Document, current_user: User) -> None:
        if current_user.role == UserRole.ADMIN:
            return

        allowed_statuses = {DocumentStatus.UPLOADED, DocumentStatus.FAILED}

        if document.uploaded_by_user_id != current_user.id or document.status not in allowed_statuses:
            raise ForbiddenAccessError()

    def _build_event_metadata(self, document: Document) -> dict[str, str | int | None]:
        return {
            "document_id": str(document.id),
            "client_company_id": str(document.client_company_id),
            "uploaded_by_user_id": str(document.uploaded_by_user_id),
            "original_file_name": document.original_file_name,
            "document_type": document.document_type.value,
            "status": document.status.value,
            "file_size": document.file_size,
        }
