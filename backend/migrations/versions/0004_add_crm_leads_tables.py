"""0004_add_crm_leads_tables

Revision ID: 0004_add_crm_leads_tables
Revises: 0003_add_sync_logs_table
Create Date: 2026-08-14 23:28:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0004_add_crm_leads_tables"
down_revision: Union[str, None] = "0003_add_sync_logs_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Expandir tabela de customers com campos CRM
    op.add_column("customers", sa.Column("lifecycle_stage", sa.String(length=50), server_default="cliente", nullable=False))
    op.add_column("customers", sa.Column("next_action", sa.String(length=255), nullable=True))
    op.add_column("customers", sa.Column("last_interaction", sa.DateTime(timezone=True), nullable=True))

    # 2. Criar tabela de leads
    op.create_table(
        "leads",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("stage", sa.Enum("novo", "proposta", "ganho", "perdido", name="leadstage"), nullable=False),
        sa.Column("value", sa.Numeric(precision=15, scale=2), server_default="0.00", nullable=False),
        sa.Column("probability", sa.Integer(), server_default="10", nullable=False),
        sa.Column("source", sa.String(length=100), server_default="direct", nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("assigned_user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assigned_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_leads_id", "leads", ["id"], unique=False)
    op.create_index("ix_leads_name", "leads", ["name"], unique=False)
    op.create_index("ix_leads_stage", "leads", ["stage"], unique=False)
    op.create_index("ix_leads_company_stage", "leads", ["company_id", "stage"], unique=False)
    op.create_index("ix_leads_company_source", "leads", ["company_id", "source"], unique=False)

    # 3. Criar tabela de interactions
    op.create_table(
        "interactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("lead_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("date", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_interactions_id", "interactions", ["id"], unique=False)
    op.create_index("ix_interactions_lead_date", "interactions", ["lead_id", "date"], unique=False)


def downgrade() -> None:
    op.drop_table("interactions")
    op.drop_table("leads")
    op.drop_column("customers", "last_interaction")
    op.drop_column("customers", "next_action")
    op.drop_column("customers", "lifecycle_stage")
