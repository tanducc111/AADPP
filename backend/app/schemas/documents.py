import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import DocumentStatus, DocumentType


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    client_company_id: uuid.UUID
    uploaded_by_user_id: uuid.UUID
    original_file_name: str
    mime_type: str
    file_size_bytes: int
    document_type: DocumentType
    document_status: DocumentStatus
    created_at: datetime
    updated_at: datetime


class OcrResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    raw_text: str | None
    confidence_score: Decimal | None
    processed_at: datetime | None
    created_at: datetime
    updated_at: datetime
