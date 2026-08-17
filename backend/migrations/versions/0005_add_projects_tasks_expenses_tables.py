"""0005_add_projects_tasks_expenses_tables

Revision ID: 0005_add_projects_tasks_expenses_tables
Revises: 0004_add_crm_leads_tables
Create Date: 2026-08-14 23:36:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0005_add_projects_tasks_expenses_tables"
down_revision: Union[str, None] = "0004_add_crm_leads_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Project tasks
    op.create_table(
        "project_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum("pending", "in_progress", "completed", name="taskstatus"), server_default="pending", nullable=False),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_project_tasks_id", "project_tasks", ["id"], unique=False)
    op.create_index("ix_project_tasks_project_status", "project_tasks", ["project_id", "status"], unique=False)

    # 2. Project expenses
    op.create_table(
        "project_expenses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("amount", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.Column("category", sa.String(length=100), server_default="material", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_project_expenses_id", "project_expenses", ["id"], unique=False)
    op.create_index("ix_project_expenses_project_date", "project_expenses", ["project_id", "date"], unique=False)


def downgrade() -> None:
    op.drop_table("project_expenses")
    op.drop_table("project_tasks")
