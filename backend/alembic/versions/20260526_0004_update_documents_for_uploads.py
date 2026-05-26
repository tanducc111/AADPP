"""Update document upload management fields.

Revision ID: 20260526_0004
Revises: 20260526_0003
Create Date: 2026-05-26 02:10:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260526_0004"
down_revision: Union[str, None] = "20260526_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

document_statuses = postgresql.ENUM(
    "UPLOADED",
    "PROCESSING",
    "OCR_DONE",
    "REVIEWED",
    "APPROVED",
    "FAILED",
    name="document_statuses",
    create_type=False,
)


def upgrade() -> None:
    op.drop_index(op.f("ix_documents_document_status"), table_name="documents")
    op.alter_column(
        "documents",
        "file_name",
        new_column_name="stored_file_name",
        existing_type=sa.String(length=255),
        existing_nullable=False,
    )
    op.alter_column(
        "documents",
        "storage_path",
        new_column_name="file_path",
        existing_type=sa.String(length=500),
        existing_nullable=False,
    )
    op.alter_column(
        "documents",
        "file_size_bytes",
        new_column_name="file_size",
        existing_type=sa.BigInteger(),
        existing_nullable=False,
    )
    op.alter_column(
        "documents",
        "document_status",
        new_column_name="status",
        existing_type=document_statuses,
        existing_nullable=False,
    )
    op.add_column("documents", sa.Column("document_category", sa.String(length=100), nullable=True))
    op.add_column("documents", sa.Column("note", sa.Text(), nullable=True))
    op.add_column(
        "documents",
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        op.f("ix_documents_document_category"),
        "documents",
        ["document_category"],
        unique=False,
    )
    op.create_index(op.f("ix_documents_status"), "documents", ["status"], unique=False)
    op.create_index(op.f("ix_documents_uploaded_at"), "documents", ["uploaded_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_documents_uploaded_at"), table_name="documents")
    op.drop_index(op.f("ix_documents_status"), table_name="documents")
    op.drop_index(op.f("ix_documents_document_category"), table_name="documents")
    op.drop_column("documents", "uploaded_at")
    op.drop_column("documents", "note")
    op.drop_column("documents", "document_category")
    op.alter_column(
        "documents",
        "status",
        new_column_name="document_status",
        existing_type=document_statuses,
        existing_nullable=False,
    )
    op.alter_column(
        "documents",
        "file_size",
        new_column_name="file_size_bytes",
        existing_type=sa.BigInteger(),
        existing_nullable=False,
    )
    op.alter_column(
        "documents",
        "file_path",
        new_column_name="storage_path",
        existing_type=sa.String(length=500),
        existing_nullable=False,
    )
    op.alter_column(
        "documents",
        "stored_file_name",
        new_column_name="file_name",
        existing_type=sa.String(length=255),
        existing_nullable=False,
    )
    op.create_index(
        op.f("ix_documents_document_status"),
        "documents",
        ["document_status"],
        unique=False,
    )
