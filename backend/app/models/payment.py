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


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class UnifiedPayment(Base):
    __tablename__ = "unified_payments"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    
    # Generic reference to any module's sale / order
    sale_id = Column(Integer, nullable=True, index=True)  # POS, Restaurant, Takeaway, Informal, etc.
    module_source = Column(String(50), nullable=False, default="pos", index=True)  # pos, restaurant, takeaway, informal, manufacturing, project
    invoice_number = Column(String(100), nullable=True, index=True)
    
    customer_id = Column(Integer, nullable=True, index=True)
    customer_name = Column(String(150), nullable=True)
    customer_phone = Column(String(50), nullable=True)

    amount_total = Column(Numeric(15, 2), nullable=False)  # Total da venda / ordem
    amount_paid = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Total já amortizado
    amount_owed = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Saldo devedor restante
    
    payment_method = Column(String(50), nullable=False, default="cash")  # cash, card, mpesa, emola, transfer, pos, split
    status = Column(String(30), nullable=False, default=PaymentStatus.PENDING.value, index=True)
    
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)  # Data limite se houver crédito/fiado
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    transactions = relationship("PaymentTransaction", back_populates="payment", cascade="all, delete-orphan", order_by="desc(PaymentTransaction.paid_at)")

    __table_args__ = (
        Index("ix_unified_payments_company_status", "company_id", "status"),
        Index("ix_unified_payments_sale_module", "sale_id", "module_source"),
    )


class PaymentTransaction(Base):
    __tablename__ = "unified_payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("unified_payments.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)  # Valor amortizado nesta transação
    payment_method = Column(String(50), nullable=False, default="cash")  # cash, card, mpesa, emola, transfer, pos
    transaction_id = Column(String(100), nullable=True, index=True)  # Referência externa (ex: M-Pesa TxID MP26081701)
    notes = Column(String(255), nullable=True)
    paid_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    payment = relationship("UnifiedPayment", back_populates="transactions")
