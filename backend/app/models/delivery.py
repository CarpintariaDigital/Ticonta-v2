import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    ForeignKey,
    Text,
    Index,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    order_id = Column(Integer, ForeignKey("takeaway_orders.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Motorista / Entregador
    delivery_person_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    delivery_person_name = Column(String(150), nullable=True)  # Ex: "Rider Américo"
    delivery_person_phone = Column(String(50), nullable=True)  # Ex: "+258 84 999 8877"

    delivery_address = Column(String(300), nullable=False)
    delivery_phone = Column(String(50), nullable=False)
    
    estimated_delivery_time = Column(DateTime(timezone=True), nullable=True)
    actual_delivery_time = Column(DateTime(timezone=True), nullable=True)
    
    delivery_fee = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)
    delivery_status = Column(String(30), nullable=False, default=DeliveryStatus.PENDING.value, index=True)
    tracking_code = Column(String(64), unique=True, nullable=False, index=True)
    notes = Column(Text, nullable=True)  # Instruções ao entregador (ex: "Tocar campainha 3B")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    order = relationship("TakeawayOrder", back_populates="delivery")
    company = relationship("Company")
    delivery_person = relationship("User")

    __table_args__ = (
        Index("ix_deliveries_company_status", "company_id", "delivery_status"),
    )
