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
    JSON,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class WorkOrderStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    order_number = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=False)
    status = Column(Enum(WorkOrderStatus), default=WorkOrderStatus.PENDING, nullable=False, index=True)
    budget = Column(Numeric(15, 2), default=0.00, nullable=False)
    actual_cost = Column(Numeric(15, 2), default=0.00, nullable=False)
    start_date = Column(Date, default=func.current_date(), nullable=False)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    project = relationship("Project")
    materials = relationship("WorkOrderMaterial", back_populates="work_order", cascade="all, delete-orphan")
    budget_calculation = relationship("BudgetCalculation", back_populates="work_order", uselist=False, cascade="all, delete-orphan")
    cutting_plans = relationship("CuttingPlan", back_populates="work_order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_work_orders_company_status", "company_id", "status"),
    )


class WorkOrderMaterial(Base):
    __tablename__ = "work_order_materials"

    id = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="un", nullable=False)  # m2, un, kg, ml
    unit_price = Column(Numeric(15, 2), nullable=False)
    total_cost = Column(Numeric(15, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    work_order = relationship("WorkOrder", back_populates="materials")


class BudgetCalculation(Base):
    __tablename__ = "budget_calculations"

    id = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=True)
    material_cost = Column(Numeric(15, 2), nullable=False)
    labor_hours = Column(Numeric(10, 2), nullable=False)
    labor_rate = Column(Numeric(15, 2), nullable=False)
    labor_cost = Column(Numeric(15, 2), nullable=False)
    overhead_percentage = Column(Numeric(5, 2), default=15.00, nullable=False)
    overhead_cost = Column(Numeric(15, 2), nullable=False)
    total_direct_cost = Column(Numeric(15, 2), nullable=False)
    margin_percentage = Column(Numeric(5, 2), nullable=False)
    final_price = Column(Numeric(15, 2), nullable=False)
    profit = Column(Numeric(15, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    work_order = relationship("WorkOrder", back_populates="budget_calculation")


class CuttingPlan(Base):
    __tablename__ = "cutting_plans"

    id = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=True)
    sheet_length = Column(Numeric(10, 2), nullable=False)  # mm
    sheet_width = Column(Numeric(10, 2), nullable=False)   # mm
    total_sheets_needed = Column(Integer, default=1, nullable=False)
    total_pieces = Column(Integer, nullable=False)
    used_area = Column(Numeric(15, 4), nullable=False)     # m2
    total_sheet_area = Column(Numeric(15, 4), nullable=False)
    efficiency = Column(Numeric(5, 2), nullable=False)     # % aproveitamento
    waste_percentage = Column(Numeric(5, 2), nullable=False)
    layout_data = Column(JSON, nullable=True)              # posições (x, y, w, h)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    work_order = relationship("WorkOrder", back_populates="cutting_plans")
