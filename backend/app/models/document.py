import uuid
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import DocumentStatus, DocumentType
from app.models.mixins import UUIDTimestampMixin

if TYPE_CHECKING:
    from app.models.activity_log import ActivityLog
    from app.models.client_company import ClientCompany
    from app.models.ocr_result import OcrResult
    from app.models.user import User


class Document(Base, UUIDTimestampMixin):
    __tablename__ = "documents"

    client_company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("client_companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    uploaded_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_file_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, name="document_types"),
        nullable=False,
        default=DocumentType.OTHER,
        index=True,
    )
    document_status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus, name="document_statuses"),
        nullable=False,
        default=DocumentStatus.UPLOADED,
        index=True,
    )

    client_company: Mapped["ClientCompany"] = relationship(back_populates="documents")
    uploaded_by: Mapped["User"] = relationship(back_populates="uploaded_documents")
    ocr_result: Mapped["OcrResult | None"] = relationship(
        back_populates="document",
        cascade="all, delete-orphan",
        uselist=False,
    )
    activity_logs: Mapped[list["ActivityLog"]] = relationship(
        back_populates="document",
        cascade="all, delete-orphan",
    )
