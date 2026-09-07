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


class TableStatus(str, enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    DIRTY = "dirty"


class TableLocation(str, enum.Enum):
    INDOOR = "indoor"
    OUTDOOR = "outdoor"
    BAR = "bar"


class MenuCategory(str, enum.Enum):
    APPETIZERS = "appetizers"
    MAINS = "mains"
    SIDES = "sides"
    DRINKS = "drinks"
    DESSERTS = "desserts"


class ItemPrepStatus(str, enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"


class OrderStatus(str, enum.Enum):
    OPEN = "open"
    PENDING_PAYMENT = "pending_payment"
    PAID = "paid"
    CANCELLED = "cancelled"


class Table(Base):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    table_number = Column(String(50), nullable=False, index=True)  # e.g., "01", "02", "99"
    capacity = Column(Integer, nullable=False, default=4)  # pessoas
    status = Column(String(50), nullable=False, default=TableStatus.AVAILABLE.value)  # available, occupied, reserved, dirty
    location = Column(String(50), nullable=False, default=TableLocation.INDOOR.value)  # indoor, outdoor, bar
    reserved_for = Column(String(100), nullable=True)  # Nome do cliente reservado
    reserved_contact = Column(String(100), nullable=True)  # Contacto / Telefone
    reservation_time = Column(DateTime(timezone=True), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    orders = relationship("RestaurantOrder", back_populates="table", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_restaurant_tables_company_number", "company_id", "table_number"),
    )


class MenuItem(Base):
    __tablename__ = "restaurant_menu_items"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False, index=True)  # Matapa com camarão, Frango peri-peri, etc.
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default=MenuCategory.MAINS.value, index=True)  # appetizers, mains, sides, drinks, desserts
    price = Column(Numeric(15, 2), nullable=False)
    preparation_time = Column(Integer, nullable=False, default=15)  # minutos
    image_url = Column(String(500), nullable=True)
    dietary_info = Column(String(255), nullable=True)  # spicy, vegetarian, gluten-free, halal
    available = Column(Boolean, default=True, nullable=False)  # False se falta ingrediente na cozinha
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    order_items = relationship("OrderItem", back_populates="menu_item")
    product = relationship("Product")

    __table_args__ = (
        Index("ix_restaurant_menu_company_category", "company_id", "category"),
    )


class OrderItem(Base):
    __tablename__ = "restaurant_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("restaurant_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("restaurant_menu_items.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(15, 2), nullable=False)
    subtotal = Column(Numeric(15, 2), nullable=False)
    special_requests = Column(String(255), nullable=True)  # "Extra spicy", "Sem sal", "Alergia a marisco"
    preparation_status = Column(String(50), nullable=False, default=ItemPrepStatus.PENDING.value, index=True)  # pending, preparing, ready, served
    started_at = Column(DateTime(timezone=True), nullable=True)
    ready_at = Column(DateTime(timezone=True), nullable=True)
    served_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    order = relationship("RestaurantOrder", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")


class RestaurantOrder(Base):
    __tablename__ = "restaurant_orders"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    order_number = Column(String(50), unique=True, nullable=False, index=True)  # R-001, R-002...
    table_id = Column(Integer, ForeignKey("restaurant_tables.id", ondelete="SET NULL"), nullable=True, index=True)  # Nullable para takeaway / delivery
    guest_count = Column(Integer, nullable=False, default=1)
    status = Column(String(50), nullable=False, default=OrderStatus.OPEN.value, index=True)  # open, pending_payment, paid, cancelled
    opened_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    subtotal = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)
    tax = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # IVA
    service_charge = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Taxa de serviço
    total = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)
    amount_paid = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)
    payment_method = Column(String(50), nullable=True)  # cash, mpesa, emola, pos, card, mixed
    notes = Column(Text, nullable=True)
    waiter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sale_id = Column(Integer, ForeignKey("sales.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    table = relationship("Table", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", order_by="OrderItem.created_at")
    splits = relationship("OrderSplit", back_populates="order", cascade="all, delete-orphan", order_by="OrderSplit.split_number")
    waiter = relationship("User")
    sale = relationship("Sale")

    __table_args__ = (
        Index("ix_restaurant_orders_company_status", "company_id", "status"),
        Index("ix_restaurant_orders_opened_at", "opened_at"),
    )


class OrderSplit(Base):
    __tablename__ = "restaurant_order_splits"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("restaurant_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    split_number = Column(Integer, nullable=False)
    guest_name = Column(String(100), nullable=True)
    amount = Column(Numeric(15, 2), nullable=False)
    payment_method = Column(String(50), nullable=True)  # cash, mpesa, emola, pos, card
    payment_status = Column(String(50), nullable=False, default="pending")  # pending, paid
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    order = relationship("RestaurantOrder", back_populates="splits")
