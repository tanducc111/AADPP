"""Add OCR review workflow fields and line items.

Revision ID: 20260526_0006
Revises: 20260526_0005
Create Date: 2026-05-26 03:20:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260526_0006"
down_revision: Union[str, None] = "20260526_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

document_types = postgresql.ENUM(
    "VAT_INVOICE",
    "RECEIPT",
    "PAYMENT_VOUCHER",
    "IMPORT_WAREHOUSE",
    "EXPORT_WAREHOUSE",
    "OTHER",
    name="document_types",
    create_type=False,
)


def upgrade() -> None:
    op.add_column("ocr_results", sa.Column("document_type", document_types, nullable=True))
    op.add_column("ocr_results", sa.Column("company_name", sa.String(length=255), nullable=True))
    op.add_column("ocr_results", sa.Column("tax_code", sa.String(length=100), nullable=True))
    op.add_column("ocr_results", sa.Column("invoice_number", sa.String(length=100), nullable=True))
    op.add_column("ocr_results", sa.Column("invoice_date", sa.Date(), nullable=True))
    op.add_column("ocr_results", sa.Column("subtotal", sa.Numeric(precision=18, scale=2), nullable=True))
    op.add_column("ocr_results", sa.Column("vat_amount", sa.Numeric(precision=18, scale=2), nullable=True))
    op.add_column("ocr_results", sa.Column("total_amount", sa.Numeric(precision=18, scale=2), nullable=True))
    op.add_column("ocr_results", sa.Column("currency", sa.String(length=10), nullable=True))
    op.add_column(
        "ocr_results",
        sa.Column("raw_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column("ocr_results", sa.Column("reviewed_by_user_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("ocr_results", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("ocr_results", sa.Column("approved_by_user_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("ocr_results", sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True))
    op.alter_column(
        "ocr_results",
        "confidence_score",
        existing_type=sa.Numeric(precision=5, scale=2),
        type_=sa.Numeric(precision=5, scale=4),
        existing_nullable=True,
    )
    op.create_index(op.f("ix_ocr_results_document_type"), "ocr_results", ["document_type"], unique=False)
    op.create_index(op.f("ix_ocr_results_company_name"), "ocr_results", ["company_name"], unique=False)
    op.create_index(op.f("ix_ocr_results_tax_code"), "ocr_results", ["tax_code"], unique=False)
    op.create_index(op.f("ix_ocr_results_invoice_number"), "ocr_results", ["invoice_number"], unique=False)
    op.create_index(op.f("ix_ocr_results_invoice_date"), "ocr_results", ["invoice_date"], unique=False)
    op.create_index(
        op.f("ix_ocr_results_reviewed_by_user_id"),
        "ocr_results",
        ["reviewed_by_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_ocr_results_approved_by_user_id"),
        "ocr_results",
        ["approved_by_user_id"],
        unique=False,
    )
    op.create_foreign_key(
        op.f("fk_ocr_results_reviewed_by_user_id_users"),
        "ocr_results",
        "users",
        ["reviewed_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        op.f("fk_ocr_results_approved_by_user_id_users"),
        "ocr_results",
        "users",
        ["approved_by_user_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_table(
        "line_items",
        sa.Column("ocr_result_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("item_name", sa.String(length=500), nullable=True),
        sa.Column("quantity", sa.Numeric(precision=18, scale=4), nullable=True),
        sa.Column("unit_price", sa.Numeric(precision=18, scale=2), nullable=True),
        sa.Column("amount", sa.Numeric(precision=18, scale=2), nullable=True),
        sa.Column("vat_rate", sa.Numeric(precision=7, scale=4), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["ocr_result_id"],
            ["ocr_results.id"],
            name=op.f("fk_line_items_ocr_result_id_ocr_results"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_line_items")),
    )
    op.create_index(op.f("ix_line_items_ocr_result_id"), "line_items", ["ocr_result_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_line_items_ocr_result_id"), table_name="line_items")
    op.drop_table("line_items")
    op.drop_constraint(
        op.f("fk_ocr_results_approved_by_user_id_users"),
        "ocr_results",
        type_="foreignkey",
    )
    op.drop_constraint(
        op.f("fk_ocr_results_reviewed_by_user_id_users"),
        "ocr_results",
        type_="foreignkey",
    )
    op.drop_index(op.f("ix_ocr_results_approved_by_user_id"), table_name="ocr_results")
    op.drop_index(op.f("ix_ocr_results_reviewed_by_user_id"), table_name="ocr_results")
    op.drop_index(op.f("ix_ocr_results_invoice_date"), table_name="ocr_results")
    op.drop_index(op.f("ix_ocr_results_invoice_number"), table_name="ocr_results")
    op.drop_index(op.f("ix_ocr_results_tax_code"), table_name="ocr_results")
    op.drop_index(op.f("ix_ocr_results_company_name"), table_name="ocr_results")
    op.drop_index(op.f("ix_ocr_results_document_type"), table_name="ocr_results")
    op.alter_column(
        "ocr_results",
        "confidence_score",
        existing_type=sa.Numeric(precision=5, scale=4),
        type_=sa.Numeric(precision=5, scale=2),
        existing_nullable=True,
    )
    op.drop_column("ocr_results", "approved_at")
    op.drop_column("ocr_results", "approved_by_user_id")
    op.drop_column("ocr_results", "reviewed_at")
    op.drop_column("ocr_results", "reviewed_by_user_id")
    op.drop_column("ocr_results", "raw_json")
    op.drop_column("ocr_results", "currency")
    op.drop_column("ocr_results", "total_amount")
    op.drop_column("ocr_results", "vat_amount")
    op.drop_column("ocr_results", "subtotal")
    op.drop_column("ocr_results", "invoice_date")
    op.drop_column("ocr_results", "invoice_number")
    op.drop_column("ocr_results", "tax_code")
    op.drop_column("ocr_results", "company_name")
    op.drop_column("ocr_results", "document_type")
