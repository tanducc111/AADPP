import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import UUIDTimestampMixin

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.user import User


class ClientCompany(Base, UUIDTimestampMixin):
    __tablename__ = "client_companies"

    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    tax_code: Mapped[str | None] = mapped_column(String(100), nullable=True, unique=True, index=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_person: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    created_by: Mapped["User"] = relationship(back_populates="client_companies")
    documents: Mapped[list["Document"]] = relationship(
        back_populates="client_company",
        cascade="all, delete-orphan",
    )
