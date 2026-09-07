import enum
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Numeric,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    Index,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class DebitStatus(str, enum.Enum):
    ACTIVE = "active"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class Debit(Base):
    __tablename__ = "debits"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    customer_id = Column(Integer, ForeignKey("informal_customers.id", ondelete="CASCADE"), nullable=False, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id", ondelete="SET NULL"), nullable=True, index=True)
    total_amount = Column(Numeric(15, 2), nullable=False)  # Valor total da compra fiada
    initial_paid = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Valor pago na entrada
    amount_owed = Column(Numeric(15, 2), nullable=False)  # Saldo devedor restante
    amount_paid = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Total amortizado até agora
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)  # Data limite acordada
    status = Column(String(50), nullable=False, default=DebitStatus.ACTIVE.value, index=True)  # active, partially_paid, paid, overdue, cancelled
    notes = Column(Text, nullable=True)  # Observações de pagamento (ex: "Promete pagar sexta")
    reminder_count = Column(Integer, default=0, nullable=False)
    last_reminder_sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    customer = relationship("InformalCustomer", back_populates="debits")
    sale = relationship("Sale")
    partial_payments = relationship("PartialPayment", back_populates="debit", cascade="all, delete-orphan", order_by="desc(PartialPayment.paid_at)")

    __table_args__ = (
        Index("ix_debits_company_status", "company_id", "status"),
        Index("ix_debits_company_due_date", "company_id", "due_date"),
    )


class PartialPayment(Base):
    __tablename__ = "debit_partial_payments"

    id = Column(Integer, primary_key=True, index=True)
    debit_id = Column(Integer, ForeignKey("debits.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)  # Valor amortizado nesta parcela
    payment_method = Column(String(50), nullable=False, default="cash")  # cash, mpesa, emola, pos, card
    paid_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    debit = relationship("Debit", back_populates="partial_payments")
