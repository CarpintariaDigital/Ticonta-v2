import enum
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    Date,
    ForeignKey,
    Text,
    Enum,
    Index,
    Boolean,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LEAVE = "leave"
    SICK = "sick"


class PayrollStatus(str, enum.Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    PAID = "paid"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    nuit = Column(String(50), nullable=True, index=True)
    inss_number = Column(String(50), nullable=True)
    position = Column(String(100), nullable=False)
    department = Column(String(100), default="Geral", nullable=False)
    salary = Column(Numeric(15, 2), nullable=False)  # Salário Base em MZN
    start_date = Column(Date, default=func.current_date(), nullable=False)
    end_date = Column(Date, nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    attendances = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    payrolls = relationship("Payroll", back_populates="employee", cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    __table_args__ = (
        Index("ix_employees_company_active", "company_id", "active"),
    )


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.PRESENT, nullable=False)
    hours = Column(Numeric(4, 2), default=8.00, nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    employee = relationship("Employee", back_populates="attendances")

    __table_args__ = (
        Index("ix_attendances_employee_date", "employee_id", "date", unique=True),
    )


class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    period = Column(String(7), nullable=False, index=True)  # YYYY-MM (ex: 2026-08)
    gross_salary = Column(Numeric(15, 2), nullable=False)
    inss_employee = Column(Numeric(15, 2), nullable=False)  # 3%
    inss_employer = Column(Numeric(15, 2), nullable=False)  # 4%
    irps = Column(Numeric(15, 2), default=0.00, nullable=False)  # Retenção IRPS / IRT
    other_deductions = Column(Numeric(15, 2), default=0.00, nullable=False)
    net_salary = Column(Numeric(15, 2), nullable=False)
    status = Column(Enum(PayrollStatus), default=PayrollStatus.DRAFT, nullable=False)
    payment_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    employee = relationship("Employee", back_populates="payrolls")

    __table_args__ = (
        Index("ix_payrolls_company_period", "company_id", "period"),
        Index("ix_payrolls_employee_period", "employee_id", "period", unique=True),
    )
