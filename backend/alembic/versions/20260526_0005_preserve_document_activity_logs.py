"""Preserve document activity logs after document deletion.

Revision ID: 20260526_0005
Revises: 20260526_0004
Create Date: 2026-05-26 02:35:00.000000
"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260526_0005"
down_revision: Union[str, None] = "20260526_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        op.f("fk_activity_logs_document_id_documents"),
        "activity_logs",
        type_="foreignkey",
    )
    op.create_foreign_key(
        op.f("fk_activity_logs_document_id_documents"),
        "activity_logs",
        "documents",
        ["document_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        op.f("fk_activity_logs_document_id_documents"),
        "activity_logs",
        type_="foreignkey",
    )
    op.create_foreign_key(
        op.f("fk_activity_logs_document_id_documents"),
        "activity_logs",
        "documents",
        ["document_id"],
        ["id"],
        ondelete="CASCADE",
    )
