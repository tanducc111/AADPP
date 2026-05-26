import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import UserRole


class UserSortBy(str, Enum):
    EMAIL = "email"
    FULL_NAME = "full_name"
    ROLE = "role"
    LAST_LOGIN_AT = "last_login_at"
    CREATED_AT = "created_at"


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    avatar_url: str | None
    google_id: str | None
    role: UserRole
    is_active: bool
    is_locked: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime


class UserListItem(UserRead):
    uploaded_document_count: int
    client_company_count: int


class UserListResponse(BaseModel):
    records: list[UserListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserAccessUpdate(BaseModel):
    is_locked: bool
