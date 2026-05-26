from datetime import datetime
from http import HTTPStatus
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.rbac import require_accountant_or_admin
from app.core.security import get_current_user
from app.db.dependencies import get_db_session
from app.models.enums import DocumentStatus, DocumentType
from app.models.user import User
from app.schemas.documents import (
    DocumentDetail,
    DocumentListResponse,
    DocumentRead,
    DocumentSortBy,
    DocumentUploadForm,
    SortOrder,
)
from app.services.document_service import DocumentService

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
    dependencies=[Depends(require_accountant_or_admin)],
)


@router.post(
    "/upload",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Upload an accounting document",
    description="Upload a PDF or image document for an active client company.",
)
async def upload_document(
    file: UploadFile = File(..., description="PDF, JPG, JPEG, or PNG file."),
    client_company_id: UUID = Form(...),
    document_type: DocumentType = Form(...),
    document_category: str | None = Form(default=None),
    note: str | None = Form(default=None),
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> DocumentRead:
    document_service = DocumentService(database_session)
    upload_form = DocumentUploadForm(
        client_company_id=client_company_id,
        document_type=document_type,
        document_category=document_category,
        note=note,
    )

    return await document_service.upload_document(file, upload_form, current_user)


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List uploaded documents",
    description="List documents with pagination, search, filtering, and sorting.",
)
async def list_documents(
    search: str | None = Query(default=None, description="Search file name, client company, uploader, or note."),
    client_company_id: UUID | None = Query(default=None),
    document_type: DocumentType | None = Query(default=None),
    status: DocumentStatus | None = Query(default=None),
    uploaded_from: datetime | None = Query(default=None),
    uploaded_to: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    sort_by: DocumentSortBy = Query(default=DocumentSortBy.UPLOADED_AT),
    sort_order: SortOrder = Query(default=SortOrder.DESC),
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> DocumentListResponse:
    document_service = DocumentService(database_session)

    return document_service.list_documents(
        current_user=current_user,
        search=search,
        client_company_id=client_company_id,
        document_type=document_type,
        status=status,
        uploaded_from=uploaded_from,
        uploaded_to=uploaded_to,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentDetail,
    summary="Get document details",
    description="Get document metadata, client company summary, and uploader summary.",
)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> DocumentDetail:
    document_service = DocumentService(database_session)

    return document_service.get_document(document_id, current_user)


@router.get(
    "/{document_id}/download",
    summary="Download original uploaded file",
    description="Download the original file without exposing internal server paths.",
)
async def download_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> FileResponse:
    document_service = DocumentService(database_session)
    downloadable_file = document_service.get_downloadable_document_file(document_id, current_user)

    return FileResponse(
        path=downloadable_file.path,
        media_type=downloadable_file.mime_type,
        filename=downloadable_file.file_name,
    )


@router.delete(
    "/{document_id}",
    status_code=HTTPStatus.NO_CONTENT,
    summary="Delete a document",
    description="Delete document metadata and remove the stored file if possible.",
)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> None:
    document_service = DocumentService(database_session)
    document_service.delete_document(document_id, current_user)
