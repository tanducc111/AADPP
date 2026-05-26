import uuid
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DocumentStatus, DocumentType


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class UploadsGroupBy(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"


class ActivityLogSortBy(str, Enum):
    CREATED_AT = "created_at"
    ACTION = "action"
    USER_EMAIL = "user_email"


class DashboardSummary(BaseModel):
    total_client_companies: int
    active_client_companies: int
    total_documents: int
    uploaded_documents: int
    processing_documents: int
    ocr_done_documents: int
    reviewed_documents: int
    approved_documents: int
    failed_documents: int
    total_ocr_results: int
    ocr_success_rate: float = Field(ge=0, le=1)
    total_users: int
    active_users: int


class DocumentTypeAnalytics(BaseModel):
    document_type: DocumentType
    count: int


class DocumentStatusAnalytics(BaseModel):
    status: DocumentStatus
    count: int


class UploadsOverTimeAnalytics(BaseModel):
    date: date
    count: int


class TopClientCompanyAnalytics(BaseModel):
    client_company_id: uuid.UUID
    company_name: str
    document_count: int
    approved_count: int
    failed_count: int


class ActivityLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action: str
    user_name: str | None
    user_email: str | None
    target_type: str | None
    target_id: str | None
    created_at: datetime


class ActivityLogListResponse(BaseModel):
    records: list[ActivityLogRead]
    total: int
    page: int
    page_size: int
    total_pages: int
