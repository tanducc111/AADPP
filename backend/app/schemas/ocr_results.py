import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import DocumentType


class LineItemBase(BaseModel):
    item_name: str | None = Field(default=None, max_length=500)
    quantity: Decimal | None = Field(default=None, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    amount: Decimal | None = Field(default=None, ge=0)
    vat_rate: Decimal | None = Field(default=None, ge=0)

    @field_validator("item_name", mode="before")
    @classmethod
    def normalize_optional_text(cls, raw_value: str | None) -> str | None:
        if raw_value is None:
            return None

        normalized_value = raw_value.strip()
        return normalized_value or None


class LineItemUpdate(LineItemBase):
    pass


class LineItemRead(LineItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    ocr_result_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class OcrResultUpdate(BaseModel):
    document_type: DocumentType
    company_name: str | None = Field(default=None, max_length=255)
    tax_code: str | None = Field(default=None, max_length=100)
    invoice_number: str | None = Field(default=None, max_length=100)
    invoice_date: date | None = None
    subtotal: Decimal | None = Field(default=None, ge=0)
    vat_amount: Decimal | None = Field(default=None, ge=0)
    total_amount: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default="VND", max_length=10)
    confidence_score: Decimal | None = Field(default=None, ge=0, le=1)
    raw_text: str | None = None
    raw_json: dict[str, Any] | None = None
    line_items: list[LineItemUpdate] = Field(default_factory=list)

    @field_validator("company_name", "tax_code", "invoice_number", "currency", "raw_text", mode="before")
    @classmethod
    def normalize_optional_text(cls, raw_value: str | None) -> str | None:
        if raw_value is None:
            return None

        normalized_value = raw_value.strip()
        return normalized_value or None


class GeminiLineItem(BaseModel):
    item_name: str | None = None
    quantity: Decimal | None = Field(default=None, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    amount: Decimal | None = Field(default=None, ge=0)
    vat_rate: Decimal | None = Field(default=None, ge=0)


class GeminiOcrResponse(BaseModel):
    document_type: DocumentType = DocumentType.OTHER
    company_name: str | None = None
    tax_code: str | None = None
    invoice_number: str | None = None
    invoice_date: date | None = None
    subtotal: Decimal | None = Field(default=None, ge=0)
    vat_amount: Decimal | None = Field(default=None, ge=0)
    total_amount: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default="VND", max_length=10)
    confidence_score: Decimal | None = Field(default=None, ge=0, le=1)
    line_items: list[GeminiLineItem] = Field(default_factory=list)

    @field_validator("company_name", "tax_code", "invoice_number", "currency", mode="before")
    @classmethod
    def normalize_optional_text(cls, raw_value: str | None) -> str | None:
        if raw_value is None:
            return None

        normalized_value = str(raw_value).strip()
        return normalized_value or None


class OcrResultRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    document_id: uuid.UUID
    document_type: DocumentType | None
    company_name: str | None
    tax_code: str | None
    invoice_number: str | None
    invoice_date: date | None
    subtotal: Decimal | None
    vat_amount: Decimal | None
    total_amount: Decimal | None
    currency: str | None
    confidence_score: Decimal | None
    raw_text: str | None
    raw_json: dict[str, Any] | None
    reviewed_by_user_id: uuid.UUID | None
    reviewed_at: datetime | None
    approved_by_user_id: uuid.UUID | None
    approved_at: datetime | None
    processed_at: datetime | None
    created_at: datetime
    updated_at: datetime
    line_items: list[LineItemRead]
