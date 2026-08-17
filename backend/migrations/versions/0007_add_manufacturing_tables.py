"""0007_add_manufacturing_tables

Revision ID: 0007_add_manufacturing_tables
Revises: 0006_add_hr_payroll_tables
Create Date: 2026-08-14 23:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0007_add_manufacturing_tables"
down_revision: Union[str, None] = "0006_add_hr_payroll_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Work Orders
    op.create_table(
        "work_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=True),
        sa.Column("order_number", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("pending", "in_progress", "completed", "cancelled", name="workorderstatus"), server_default="pending", nullable=False),
        sa.Column("budget", sa.Numeric(precision=15, scale=2), server_default="0.00", nullable=False),
        sa.Column("actual_cost", sa.Numeric(precision=15, scale=2), server_default="0.00", nullable=False),
        sa.Column("start_date", sa.Date(), server_default=sa.text("CURRENT_DATE"), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("order_number"),
    )
    op.create_index("ix_work_orders_id", "work_orders", ["id"], unique=False)
    op.create_index("ix_work_orders_company_status", "work_orders", ["company_id", "status"], unique=False)

    # 2. Work Order Materials
    op.create_table(
        "work_order_materials",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("work_order_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("unit", sa.String(length=20), server_default="un", nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("total_cost", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["work_order_id"], ["work_orders.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_work_order_materials_id", "work_order_materials", ["id"], unique=False)


def downgrade() -> None:
    op.drop_table("work_order_materials")
    op.drop_table("work_orders")
