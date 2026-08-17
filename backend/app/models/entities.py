from datetime import datetime
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
    JSON,
    Index,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


from app.models.user import User


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    nuit = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    province = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    currency = Column(String(10), default="MZN", nullable=False)
    
    # Licensing Fields
    license_key = Column(String(100), unique=True, nullable=True, index=True)
    plan = Column(String(50), nullable=True)  # basic, professional, complete, enterprise
    active_modules = Column(JSON, nullable=True)
    license_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Document Delivery Features (Twilio / Messaging)
    has_whatsapp_delivery = Column(Boolean, default=True, nullable=False)
    has_sms_delivery = Column(Boolean, default=True, nullable=False)
    has_email_delivery = Column(Boolean, default=True, nullable=False)
    whatsapp_phone_number = Column(String(50), nullable=True)
    sms_phone_number = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    customers = relationship("Customer", back_populates="company", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="company", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="company", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="company", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="company", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="company", cascade="all, delete-orphan")
    employees = relationship("Employee", back_populates="company", cascade="all, delete-orphan")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    nuit = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    debt_amount = Column(Numeric(15, 2), default=0.00, nullable=False)
    total_spent = Column(Numeric(15, 2), default=0.00, nullable=False)

    # CRM Expanded Fields
    lifecycle_stage = Column(String(50), default="cliente", nullable=False)  # prospecto, cliente, ex-cliente
    next_action = Column(String(255), nullable=True)
    last_interaction = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    company = relationship("Company", back_populates="customers")
    sales = relationship("Sale", back_populates="customer")

    __table_args__ = (
        Index("ix_customers_company_id", "company_id"),
    )


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    unit_price = Column(Numeric(15, 2), nullable=False)
    cost_price = Column(Numeric(15, 2), default=0.00, nullable=False)
    quantity = Column(Numeric(15, 3), default=0.000, nullable=False)
    iva_rate = Column(Numeric(5, 2), default=16.00, nullable=False)
    active = Column(Boolean, default=True, nullable=False)

    # Barcode Scanning Fields
    barcode = Column(String(100), nullable=True, index=True)
    barcode_format = Column(String(50), default="EAN-13", nullable=True)  # EAN-13, UPC-A, Code-128, QR-Code
    barcode_image = Column(String(500), nullable=True)
    scan_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    company = relationship("Company", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")

    __table_args__ = (
        Index("ix_products_company_sku", "company_id", "sku"),
        Index("ix_products_company_barcode", "company_id", "barcode"),
    )


from app.models.sale import Sale, SaleItem, Payment


from app.models.account import Account, JournalEntry


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    company = relationship("Company", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_log_company_timestamp", "company_id", "timestamp"),
    )


from app.models.project import Project
from app.models.employee import Employee, Attendance, Payroll
