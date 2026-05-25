"""Update client company management fields.

Revision ID: 20260526_0003
Revises: 20260525_0002
Create Date: 2026-05-26 00:45:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260526_0003"
down_revision: Union[str, None] = "20260525_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index(op.f("ix_client_companies_name"), table_name="client_companies")
    op.alter_column(
        "client_companies",
        "name",
        new_column_name="company_name",
        existing_type=sa.String(length=255),
        existing_nullable=False,
    )
    op.alter_column(
        "client_companies",
        "tax_code",
        existing_type=sa.String(length=100),
        nullable=True,
    )
    op.add_column("client_companies", sa.Column("contact_person", sa.String(length=255), nullable=True))
    op.add_column("client_companies", sa.Column("phone_number", sa.String(length=50), nullable=True))
    op.add_column("client_companies", sa.Column("email", sa.String(length=255), nullable=True))
    op.add_column("client_companies", sa.Column("description", sa.Text(), nullable=True))
    op.add_column(
        "client_companies",
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
    )
    op.create_index(
        op.f("ix_client_companies_company_name"),
        "client_companies",
        ["company_name"],
        unique=False,
    )
    op.create_index(
        op.f("ix_client_companies_contact_person"),
        "client_companies",
        ["contact_person"],
        unique=False,
    )
    op.create_index(op.f("ix_client_companies_email"), "client_companies", ["email"], unique=False)
    op.create_index(
        op.f("ix_client_companies_is_active"),
        "client_companies",
        ["is_active"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_client_companies_is_active"), table_name="client_companies")
    op.drop_index(op.f("ix_client_companies_email"), table_name="client_companies")
    op.drop_index(op.f("ix_client_companies_contact_person"), table_name="client_companies")
    op.drop_index(op.f("ix_client_companies_company_name"), table_name="client_companies")
    op.drop_column("client_companies", "is_active")
    op.drop_column("client_companies", "description")
    op.drop_column("client_companies", "email")
    op.drop_column("client_companies", "phone_number")
    op.drop_column("client_companies", "contact_person")
    op.alter_column(
        "client_companies",
        "tax_code",
        existing_type=sa.String(length=100),
        nullable=False,
    )
    op.alter_column(
        "client_companies",
        "company_name",
        new_column_name="name",
        existing_type=sa.String(length=255),
        existing_nullable=False,
    )
    op.create_index(op.f("ix_client_companies_name"), "client_companies", ["name"], unique=False)
