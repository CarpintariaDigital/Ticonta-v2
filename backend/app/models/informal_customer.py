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
    Index,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class InformalCustomer(Base):
    __tablename__ = "informal_customers"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    name = Column(String(150), nullable=False, index=True)
    phone = Column(String(50), nullable=True, index=True)
    location = Column(String(255), nullable=True)  # Bairro / Rua / Ponto de referência
    profile_picture = Column(String(500), nullable=True)  # URL do avatar / foto
    total_purchases = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Valor total acumulado de compras
    total_owed = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Saldo devedor atual (fiado)
    trusted_credit_limit = Column(Numeric(15, 2), default=Decimal("5000.00"), nullable=False)  # Limite de fiado autorizado
    payment_reliability = Column(Numeric(3, 2), default=Decimal("5.00"), nullable=False)  # Score de confiança (1.00 a 5.00)
    notes = Column(Text, nullable=True)  # Preferências, histórico e observações do vendedor
    verified = Column(Boolean, default=False, nullable=False)  # True se cliente já pagou com pontualidade
    last_purchase_date = Column(DateTime(timezone=True), nullable=True)
    last_purchase_amount = Column(Numeric(15, 2), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    debits = relationship("Debit", back_populates="customer", cascade="all, delete-orphan", order_by="desc(Debit.created_at)")

    __table_args__ = (
        Index("ix_informal_customers_company_phone", "company_id", "phone"),
        Index("ix_informal_customers_company_name", "company_id", "name"),
    )
