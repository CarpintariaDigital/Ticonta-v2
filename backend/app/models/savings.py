from datetime import datetime, date
from decimal import Decimal
import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    Date,
    Enum,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class SavingsGroupStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"


class SavingsMemberStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class SavingsPaymentMethod(str, enum.Enum):
    CASH = "CASH"
    MPESA = "MPESA"
    TRANSFER = "TRANSFER"


class SavingsLoanStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REPAID = "REPAID"
    DEFAULTED = "DEFAULTED"


class SavingsGroup(Base):
    __tablename__ = "savings_groups"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    interest_rate = Column(Numeric(5, 2), default=Decimal("10.00"), nullable=False)  # % mensal
    cycle_months = Column(Integer, default=12, nullable=False)
    status = Column(Enum(SavingsGroupStatus), default=SavingsGroupStatus.ACTIVE, nullable=False)
    start_date = Column(Date, default=date.today, nullable=False)
    end_date = Column(Date, nullable=True)
    admin_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    members = relationship("SavingsMember", back_populates="group", cascade="all, delete-orphan")
    deposits = relationship("SavingsDeposit", back_populates="group", cascade="all, delete-orphan")
    loans = relationship("SavingsLoan", back_populates="group", cascade="all, delete-orphan")


class SavingsMember(Base):
    __tablename__ = "savings_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("savings_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    total_deposited = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_borrowed = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_repaid = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    status = Column(Enum(SavingsMemberStatus), default=SavingsMemberStatus.ACTIVE, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    group = relationship("SavingsGroup", back_populates="members")
    deposits = relationship("SavingsDeposit", back_populates="member", cascade="all, delete-orphan")
    loans = relationship("SavingsLoan", back_populates="member", cascade="all, delete-orphan")


class SavingsDeposit(Base):
    __tablename__ = "savings_deposits"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("savings_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(Integer, ForeignKey("savings_members.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    deposited_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    payment_method = Column(Enum(SavingsPaymentMethod), default=SavingsPaymentMethod.CASH, nullable=False)
    notes = Column(Text, nullable=True)

    group = relationship("SavingsGroup", back_populates="deposits")
    member = relationship("SavingsMember", back_populates="deposits")


class SavingsLoan(Base):
    __tablename__ = "savings_loans"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("savings_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(Integer, ForeignKey("savings_members.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    interest_rate = Column(Numeric(5, 2), nullable=False)
    monthly_payment = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_repayable = Column(Numeric(12, 2), nullable=False)
    amount_repaid = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    disbursed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(SavingsLoanStatus), default=SavingsLoanStatus.ACTIVE, nullable=False)

    group = relationship("SavingsGroup", back_populates="loans")
    member = relationship("SavingsMember", back_populates="loans")
    repayments = relationship("SavingsRepayment", back_populates="loan", cascade="all, delete-orphan")


class SavingsRepayment(Base):
    __tablename__ = "savings_repayments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("savings_loans.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    principal_portion = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    interest_portion = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    repaid_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    payment_method = Column(Enum(SavingsPaymentMethod), default=SavingsPaymentMethod.CASH, nullable=False)

    loan = relationship("SavingsLoan", back_populates="repayments")
