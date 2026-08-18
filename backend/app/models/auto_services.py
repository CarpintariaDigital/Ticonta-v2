from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Boolean,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Vehicle(Base):
    """Registo do veículo com histórico completo de manutenções e intervenções."""
    __tablename__ = "auto_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    
    license_plate = Column(String(20), nullable=False, index=True)  # Matrícula (ex: ABC-123-MC)
    make = Column(String(50), nullable=False)                       # Marca (ex: Toyota)
    model = Column(String(50), nullable=False)                      # Modelo (ex: Hilux GD6)
    year = Column(Integer, nullable=True)                           # Ano de fabrico (ex: 2022)
    vin = Column(String(50), nullable=True, index=True)             # Chassi / VIN
    color = Column(String(40), nullable=True)                       # Cor
    fuel_type = Column(String(30), default="diesel")                # diesel, petrol, electric, hybrid
    mileage_km = Column(Integer, default=0)                         # Quilometragem atual
    engine_size = Column(String(30), nullable=True)                 # ex: 2.8L D-4D Turbo
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    service_orders = relationship("ServiceOrder", back_populates="vehicle", cascade="all, delete-orphan")
    diagnostic_reports = relationship("DiagnosticReport", back_populates="vehicle", cascade="all, delete-orphan")


class MechanicTechnician(Base):
    """Mecânico ou técnico especialista da oficina."""
    __tablename__ = "auto_technicians"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    specialty = Column(String(50), nullable=False)  # mechanics, bodywork, electronics_obd, painting, tuning
    phone = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    service_orders = relationship("ServiceOrder", back_populates="technician")


class ServiceOrder(Base):
    """
    Ordem de Serviço (OS) da Oficina Mecânica.
    Controla todo o fluxo: Orçamento -> Entrada -> Execução -> Estufa/Box -> Qualidade -> Faturação.
    """
    __tablename__ = "auto_service_orders"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    order_number = Column(String(40), unique=True, index=True, nullable=False)  # ex: OS-2026/0001
    
    vehicle_id = Column(Integer, ForeignKey("auto_vehicles.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    technician_id = Column(Integer, ForeignKey("auto_technicians.id"), nullable=True, index=True)

    # Tipo de serviço principal
    # maintenance, bodywork_chapa, diagnosis, painting, tuning, full_service
    service_type = Column(String(40), default="maintenance", nullable=False)

    # Estado no Quadro de Boxes / Kanban
    # quote, approved, in_progress, paint_booth, quality_test, ready, invoiced, cancelled
    status = Column(String(30), default="quote", nullable=False, index=True)

    # Checklist de Entrada e Inspeção 360º
    entry_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    estimated_delivery = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    entry_mileage = Column(Integer, nullable=True)
    fuel_level = Column(String(20), default="1/2")  # empty, 1/4, 1/2, 3/4, full
    visible_damages = Column(JSON, default=list)    # [{"area": "porta_esq", "damage": "risco_profundo"}]
    belongings_left = Column(Text, nullable=True)   # Objetos pessoais deixados no veículo
    customer_complaint = Column(Text, nullable=True) # Queixa / Sintomas relatados
    diagnostic_summary = Column(Text, nullable=True) # Parecer técnico inicial

    # Valores Financeiros
    total_parts = Column(Numeric(12, 2), default=Decimal("0.00"))
    total_labor = Column(Numeric(12, 2), default=Decimal("0.00"))
    discount = Column(Numeric(12, 2), default=Decimal("0.00"))
    iva_rate = Column(Numeric(5, 2), default=Decimal("16.00"))
    iva_amount = Column(Numeric(12, 2), default=Decimal("0.00"))
    total_final = Column(Numeric(12, 2), default=Decimal("0.00"))

    # Venda / Fatura associada
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    vehicle = relationship("Vehicle", back_populates="service_orders")
    technician = relationship("MechanicTechnician", back_populates="service_orders")
    items = relationship("ServiceOrderItem", back_populates="service_order", cascade="all, delete-orphan")
    diagnostic_reports = relationship("DiagnosticReport", back_populates="service_order", cascade="all, delete-orphan")
    paint_tuning_specs = relationship("PaintTuningSpec", back_populates="service_order", cascade="all, delete-orphan")


class ServiceOrderItem(Base):
    """Item de Ordem de Serviço (Peça, Material de Consumo ou Mão-de-Obra)."""
    __tablename__ = "auto_service_order_items"

    id = Column(Integer, primary_key=True, index=True)
    service_order_id = Column(Integer, ForeignKey("auto_service_orders.id"), nullable=False, index=True)
    
    item_type = Column(String(30), default="labor")  # part, labor, consumable, paint_material, tuning_kit
    description = Column(String(200), nullable=False)
    quantity = Column(Numeric(10, 2), default=Decimal("1.00"))
    unit_cost = Column(Numeric(12, 2), default=Decimal("0.00"))
    unit_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    total_price = Column(Numeric(12, 2), default=Decimal("0.00"))
    
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    is_completed = Column(Boolean, default=False)

    service_order = relationship("ServiceOrder", back_populates="items")


class DiagnosticReport(Base):
    """Relatório técnico de diagnóstico eletrónico OBD-II e mecânico."""
    __tablename__ = "auto_diagnostic_reports"

    id = Column(Integer, primary_key=True, index=True)
    service_order_id = Column(Integer, ForeignKey("auto_service_orders.id"), nullable=False, index=True)
    vehicle_id = Column(Integer, ForeignKey("auto_vehicles.id"), nullable=False, index=True)
    
    scanner_tool = Column(String(80), default="OBD-II Pro Scanner")
    dtc_codes = Column(JSON, default=list)  # [{"code": "P0300", "description": "Random Misfire", "severity": "high"}]
    battery_voltage = Column(Numeric(4, 2), default=Decimal("12.60"))
    alternator_charging_voltage = Column(Numeric(4, 2), default=Decimal("14.20"))
    engine_compression = Column(String(100), nullable=True)  # ex: "Cil1: 175psi, Cil2: 172psi, Cil3: 174psi, Cil4: 175psi"
    brake_pad_wear_pct = Column(Integer, default=20)          # % de desgaste dos travões
    road_test_notes = Column(Text, nullable=True)
    technician_recommendations = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    service_order = relationship("ServiceOrder", back_populates="diagnostic_reports")
    vehicle = relationship("Vehicle", back_populates="diagnostic_reports")


class PaintTuningSpec(Base):
    """Especificações técnicas para trabalhos de Pintura em Estufa e Projetos de Tuning."""
    __tablename__ = "auto_paint_tuning_specs"

    id = Column(Integer, primary_key=True, index=True)
    service_order_id = Column(Integer, ForeignKey("auto_service_orders.id"), nullable=False, index=True)
    
    # Pintura & Bate-chapa
    paint_code = Column(String(50), nullable=True)         # ex: "040 - Super White II Toyota"
    paint_finish = Column(String(30), default="metallic")  # solid, metallic, pearlescent, matte, satin
    booth_temp_c = Column(Integer, default=60)              # Temperatura da estufa (ex: 60ºC)
    coats_applied = Column(Integer, default=2)             # Demãos de tinta/verniz
    parts_to_paint = Column(JSON, default=list)            # ["capot", "parachoques_diant", "guarda_lamas_dir"]
    bodywork_straightening_required = Column(Boolean, default=False)

    # Tuning & Performance
    tuning_stage = Column(String(30), nullable=True)       # stage1, stage2, stage3, eco_tune, custom
    ecu_remap_profile = Column(String(100), nullable=True) # ex: "TiConta High Torque Remap 2.8 D4D"
    dyno_hp_before = Column(Integer, nullable=True)        # Potência original (ex: 177 HP)
    dyno_hp_after = Column(Integer, nullable=True)         # Potência estimada (ex: 225 HP)
    exhaust_modification = Column(String(100), nullable=True) # ex: "Downpipe Inox 3 polegadas"
    suspension_upgrade = Column(String(100), nullable=True)   # ex: "Kit Coilovers Rebaixado 30mm"
    sound_multimedia = Column(String(150), nullable=True)     # ex: "Subwoofer 12' + Android Auto CarPlay"
    lighting_upgrade = Column(String(100), nullable=True)     # ex: "Faróis Full LED Bi-Xenon 6000K"

    service_order = relationship("ServiceOrder", back_populates="paint_tuning_specs")
