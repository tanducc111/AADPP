import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import DocumentStatus, DocumentType


class DocumentSortBy(str, Enum):
    ORIGINAL_FILE_NAME = "original_file_name"
    DOCUMENT_TYPE = "document_type"
    STATUS = "status"
    UPLOADED_AT = "uploaded_at"
    FILE_SIZE = "file_size"


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class DocumentUploadForm(BaseModel):
    client_company_id: uuid.UUID
    document_type: DocumentType
    document_category: str | None = Field(default=None, max_length=100)
    note: str | None = None

    @field_validator("document_category", "note", mode="before")
    @classmethod
    def normalize_optional_text(cls, raw_value: str | None) -> str | None:
        if raw_value is None:
            return None

        normalized_value = raw_value.strip()
        return normalized_value or None


class DocumentClientCompanySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_name: str
    tax_code: str | None
    is_active: bool


class DocumentUploaderSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_company_id: uuid.UUID
    uploaded_by_user_id: uuid.UUID
    original_file_name: str
    stored_file_name: str
    file_size: int
    mime_type: str
    document_type: DocumentType
    document_category: str | None
    status: DocumentStatus
    note: str | None
    uploaded_at: datetime
    created_at: datetime
    updated_at: datetime


class DocumentListItem(DocumentRead):
    client_company: DocumentClientCompanySummary
    uploaded_by: DocumentUploaderSummary


class DocumentDetail(DocumentListItem):
    pass


class DocumentListResponse(BaseModel):
    records: list[DocumentListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class OcrResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    raw_text: str | None
    confidence_score: Decimal | None
    processed_at: datetime | None
    created_at: datetime
    updated_at: datetime
