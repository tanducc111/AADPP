import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import DocumentType
from app.models.mixins import UUIDTimestampMixin

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.user import User


class OcrResult(Base, UUIDTimestampMixin):
    __tablename__ = "ocr_results"

    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    document_type: Mapped[DocumentType | None] = mapped_column(
        Enum(DocumentType, name="document_types"),
        nullable=True,
        index=True,
    )
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    tax_code: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    invoice_number: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    invoice_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    subtotal: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    vat_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    total_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(10), nullable=True)
    confidence_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_json: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    reviewed_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    document: Mapped["Document"] = relationship(back_populates="ocr_result")
    line_items: Mapped[list["LineItem"]] = relationship(
        back_populates="ocr_result",
        cascade="all, delete-orphan",
    )
    reviewed_by: Mapped["User | None"] = relationship(
        foreign_keys=[reviewed_by_user_id],
    )
    approved_by: Mapped["User | None"] = relationship(
        foreign_keys=[approved_by_user_id],
    )


class LineItem(Base, UUIDTimestampMixin):
    __tablename__ = "line_items"

    ocr_result_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ocr_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    unit_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    vat_rate: Mapped[Decimal | None] = mapped_column(Numeric(7, 4), nullable=True)

    ocr_result: Mapped["OcrResult"] = relationship(back_populates="line_items")
