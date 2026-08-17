"""0003_add_sync_logs_table

Revision ID: 0003_add_sync_logs_table
Revises: 0002_add_payments_table
Create Date: 2026-08-14 20:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0003_add_sync_logs_table"
down_revision: Union[str, None] = "0002_add_payments_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sync_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("device_id", sa.String(length=100), nullable=True),
        sa.Column("client_mutation_id", sa.String(length=100), nullable=False),
        sa.Column("entity", sa.String(length=100), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=True),
        sa.Column("operation", sa.String(length=20), nullable=False),
        sa.Column("client_timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("server_timestamp", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="APPLIED", nullable=False),
        sa.Column("conflict_details", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("client_mutation_id"),
    )
    op.create_index("ix_sync_logs_id", "sync_logs", ["id"], unique=False)
    op.create_index("ix_sync_logs_device_id", "sync_logs", ["device_id"], unique=False)
    op.create_index("ix_sync_logs_client_mutation_id", "sync_logs", ["client_mutation_id"], unique=True)
    op.create_index("ix_sync_logs_entity", "sync_logs", ["entity"], unique=False)
    op.create_index("ix_sync_logs_company_server_timestamp", "sync_logs", ["company_id", "server_timestamp"], unique=False)
    op.create_index("ix_sync_logs_entity_entity_id", "sync_logs", ["entity", "entity_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_sync_logs_entity_entity_id", table_name="sync_logs")
    op.drop_index("ix_sync_logs_company_server_timestamp", table_name="sync_logs")
    op.drop_index("ix_sync_logs_entity", table_name="sync_logs")
    op.drop_index("ix_sync_logs_client_mutation_id", table_name="sync_logs")
    op.drop_index("ix_sync_logs_device_id", table_name="sync_logs")
    op.drop_index("ix_sync_logs_id", table_name="sync_logs")
    op.drop_table("sync_logs")
