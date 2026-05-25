"""Create initial accounting document schema.

Revision ID: 20260525_0001
Revises:
Create Date: 2026-05-25 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260525_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

user_roles = postgresql.ENUM("ADMIN", "ACCOUNTANT", name="user_roles", create_type=False)
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
    bind = op.get_bind()
    user_roles.create(bind, checkfirst=True)
    document_types.create(bind, checkfirst=True)
    document_statuses.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", user_roles, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_role"), "users", ["role"], unique=False)

    op.create_table(
        "client_companies",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("tax_code", sa.String(length=100), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("created_by_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.id"],
            name=op.f("fk_client_companies_created_by_user_id_users"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_client_companies")),
        sa.UniqueConstraint("tax_code", name=op.f("uq_client_companies_tax_code")),
    )
    op.create_index(op.f("ix_client_companies_created_by_user_id"), "client_companies", ["created_by_user_id"], unique=False)
    op.create_index(op.f("ix_client_companies_name"), "client_companies", ["name"], unique=False)
    op.create_index(op.f("ix_client_companies_tax_code"), "client_companies", ["tax_code"], unique=False)

    op.create_table(
        "documents",
        sa.Column("client_company_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("uploaded_by_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("original_file_name", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("document_type", document_types, nullable=False),
        sa.Column("document_status", document_statuses, nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["client_company_id"],
            ["client_companies.id"],
            name=op.f("fk_documents_client_company_id_client_companies"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by_user_id"],
            ["users.id"],
            name=op.f("fk_documents_uploaded_by_user_id_users"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_documents")),
    )
    op.create_index(op.f("ix_documents_client_company_id"), "documents", ["client_company_id"], unique=False)
    op.create_index(op.f("ix_documents_document_status"), "documents", ["document_status"], unique=False)
    op.create_index(op.f("ix_documents_document_type"), "documents", ["document_type"], unique=False)
    op.create_index(op.f("ix_documents_original_file_name"), "documents", ["original_file_name"], unique=False)
    op.create_index(op.f("ix_documents_uploaded_by_user_id"), "documents", ["uploaded_by_user_id"], unique=False)

    op.create_table(
        "activity_logs",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("event_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["document_id"],
            ["documents.id"],
            name=op.f("fk_activity_logs_document_id_documents"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_activity_logs_user_id_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_activity_logs")),
    )
    op.create_index(op.f("ix_activity_logs_action"), "activity_logs", ["action"], unique=False)
    op.create_index(op.f("ix_activity_logs_document_id"), "activity_logs", ["document_id"], unique=False)
    op.create_index(op.f("ix_activity_logs_user_id"), "activity_logs", ["user_id"], unique=False)

    op.create_table(
        "ocr_results",
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("raw_text", sa.Text(), nullable=True),
        sa.Column("confidence_score", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["document_id"],
            ["documents.id"],
            name=op.f("fk_ocr_results_document_id_documents"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ocr_results")),
        sa.UniqueConstraint("document_id", name=op.f("uq_ocr_results_document_id")),
    )
    op.create_index(op.f("ix_ocr_results_document_id"), "ocr_results", ["document_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ocr_results_document_id"), table_name="ocr_results")
    op.drop_table("ocr_results")
    op.drop_index(op.f("ix_activity_logs_user_id"), table_name="activity_logs")
    op.drop_index(op.f("ix_activity_logs_document_id"), table_name="activity_logs")
    op.drop_index(op.f("ix_activity_logs_action"), table_name="activity_logs")
    op.drop_table("activity_logs")
    op.drop_index(op.f("ix_documents_uploaded_by_user_id"), table_name="documents")
    op.drop_index(op.f("ix_documents_original_file_name"), table_name="documents")
    op.drop_index(op.f("ix_documents_document_type"), table_name="documents")
    op.drop_index(op.f("ix_documents_document_status"), table_name="documents")
    op.drop_index(op.f("ix_documents_client_company_id"), table_name="documents")
    op.drop_table("documents")
    op.drop_index(op.f("ix_client_companies_tax_code"), table_name="client_companies")
    op.drop_index(op.f("ix_client_companies_name"), table_name="client_companies")
    op.drop_index(op.f("ix_client_companies_created_by_user_id"), table_name="client_companies")
    op.drop_table("client_companies")
    op.drop_index(op.f("ix_users_role"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    document_statuses.drop(bind, checkfirst=True)
    document_types.drop(bind, checkfirst=True)
    user_roles.drop(bind, checkfirst=True)
