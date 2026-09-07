"""0006_add_hr_payroll_tables

Revision ID: 0006_add_hr_payroll_tables
Revises: 0005_add_projects_tasks_expenses_tables
Create Date: 2026-08-14 23:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0006_add_hr_payroll_tables"
down_revision: Union[str, None] = "0005_add_projects_tasks_expenses_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Expandir tabela employees
    op.add_column("employees", sa.Column("inss_number", sa.String(length=50), nullable=True))
    op.add_column("employees", sa.Column("department", sa.String(length=100), server_default="Geral", nullable=False))
    op.add_column("employees", sa.Column("end_date", sa.Date(), nullable=True))

    # 2. Criar attendances
    op.create_table(
        "attendances",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("status", sa.Enum("present", "absent", "leave", "sick", name="attendancestatus"), server_default="present", nullable=False),
        sa.Column("hours", sa.Numeric(precision=4, scale=2), server_default="8.00", nullable=False),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_attendances_id", "attendances", ["id"], unique=False)
    op.create_index("ix_attendances_employee_date", "attendances", ["employee_id", "date"], unique=True)

    # 3. Criar payrolls
    op.create_table(
        "payrolls",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("period", sa.String(length=7), nullable=False),
        sa.Column("gross_salary", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("inss_employee", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("inss_employer", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("irps", sa.Numeric(precision=15, scale=2), server_default="0.00", nullable=False),
        sa.Column("other_deductions", sa.Numeric(precision=15, scale=2), server_default="0.00", nullable=False),
        sa.Column("net_salary", sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column("status", sa.Enum("draft", "approved", "paid", name="payrollstatus"), server_default="draft", nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_payrolls_id", "payrolls", ["id"], unique=False)
    op.create_index("ix_payrolls_period", "payrolls", ["period"], unique=False)
    op.create_index("ix_payrolls_company_period", "payrolls", ["company_id", "period"], unique=False)
    op.create_index("ix_payrolls_employee_period", "payrolls", ["employee_id", "period"], unique=True)


def downgrade() -> None:
    op.drop_table("payrolls")
    op.drop_table("attendances")
    op.drop_column("employees", "end_date")
    op.drop_column("employees", "department")
    op.drop_column("employees", "inss_number")
