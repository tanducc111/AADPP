import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ClientCompanySortBy(str, Enum):
    COMPANY_NAME = "company_name"
    TAX_CODE = "tax_code"
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    IS_ACTIVE = "is_active"


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ClientCompanyBase(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    tax_code: str | None = Field(default=None, max_length=100)
    address: str | None = None
    contact_person: str | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    description: str | None = None

    @field_validator(
        "company_name",
        "tax_code",
        "address",
        "contact_person",
        "phone_number",
        "description",
        mode="before",
    )
    @classmethod
    def normalize_optional_text(cls, raw_value: str | None) -> str | None:
        if raw_value is None:
            return None

        normalized_value = raw_value.strip()
        return normalized_value or None


class ClientCompanyCreate(ClientCompanyBase):
    pass


class ClientCompanyUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=255)
    tax_code: str | None = Field(default=None, max_length=100)
    address: str | None = None
    contact_person: str | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    description: str | None = None

    @field_validator(
        "company_name",
        "tax_code",
        "address",
        "contact_person",
        "phone_number",
        "description",
        mode="before",
    )
    @classmethod
    def normalize_optional_text(cls, raw_value: str | None) -> str | None:
        if raw_value is None:
            return None

        normalized_value = raw_value.strip()
        return normalized_value or None


class ClientCompanyStatusUpdate(BaseModel):
    is_active: bool


class ClientCompanyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_name: str
    tax_code: str | None
    address: str | None
    contact_person: str | None
    phone_number: str | None
    email: EmailStr | None
    description: str | None
    is_active: bool
    created_by_user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ClientCompanyListResponse(BaseModel):
    records: list[ClientCompanyRead]
    total: int
    page: int
    page_size: int
    total_pages: int
