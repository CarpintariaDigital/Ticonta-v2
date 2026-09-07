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


class TakeawayOrderType(str, enum.Enum):
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"


class TakeawayOrderStatus(str, enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    PICKED_UP = "picked_up"
    CANCELLED = "cancelled"


class TakeawayOrder(Base):
    __tablename__ = "takeaway_orders"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    order_number = Column(String(50), nullable=False, index=True)  # T-001, T-002...
    customer_name = Column(String(150), nullable=False, index=True)
    customer_phone = Column(String(50), nullable=False, index=True)
    order_type = Column(String(30), nullable=False, default=TakeawayOrderType.TAKEAWAY.value, index=True)  # takeaway, delivery
    status = Column(String(30), nullable=False, default=TakeawayOrderStatus.PENDING.value, index=True)

    delivery_address = Column(String(300), nullable=True)  # Endereço completo para entrega
    delivery_time = Column(DateTime(timezone=True), nullable=True)  # Horário agendado desejado pelo cliente
    special_instructions = Column(Text, nullable=True)  # Ponto de referência, alergias, observações

    subtotal = Column(Numeric(15, 2), nullable=False, default=Decimal("0.00"))
    delivery_fee = Column(Numeric(15, 2), nullable=False, default=Decimal("0.00"))
    tax = Column(Numeric(15, 2), nullable=False, default=Decimal("0.00"))
    total = Column(Numeric(15, 2), nullable=False, default=Decimal("0.00"))

    payment_method = Column(String(50), nullable=False, default="mpesa")  # cash, mpesa, emola, pos, card
    payment_status = Column(String(30), nullable=False, default="pending")  # pending, paid, partial

    estimated_prep_minutes = Column(Integer, default=25, nullable=False)
    estimated_delivery_minutes = Column(Integer, default=15, nullable=False)
    estimated_ready_at = Column(DateTime(timezone=True), nullable=True)
    ready_at = Column(DateTime(timezone=True), nullable=True)
    pickup_at = Column(DateTime(timezone=True), nullable=True)  # Hora real de levantamento ou entrega concluída

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    items = relationship("TakeawayOrderItem", back_populates="order", cascade="all, delete-orphan", order_by="TakeawayOrderItem.id")
    delivery = relationship("Delivery", back_populates="order", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_takeaway_orders_company_status", "company_id", "status"),
        Index("ix_takeaway_orders_company_type", "company_id", "order_type"),
    )


class TakeawayOrderItem(Base):
    __tablename__ = "takeaway_order_items"

    id = Column(Integer, primary_key=True, index=True)
    takeaway_order_id = Column(Integer, ForeignKey("takeaway_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("restaurant_menu_items.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(150), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(15, 2), nullable=False)
    subtotal = Column(Numeric(15, 2), nullable=False)
    special_requests = Column(String(255), nullable=True)
    preparation_status = Column(String(30), default="pending", nullable=False)  # pending, preparing, ready
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    order = relationship("TakeawayOrder", back_populates="items")
    menu_item = relationship("MenuItem")
