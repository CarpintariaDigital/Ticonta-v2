import enum
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    Numeric,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    Index,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class PoultrySpecies(str, enum.Enum):
    CHICKEN_BROILER = "chicken_broiler"  # Frango de corte
    CHICKEN_LAYER = "chicken_layer"      # Galinha poedeira
    QUAIL = "quail"                      # Codorna
    DUCK = "duck"                        # Pato


class FlockStatus(str, enum.Enum):
    GROWING = "growing"        # Em crescimento / engorda
    PRODUCING = "producing"    # Em postura (ovos)
    SOLD = "sold"              # Vendido / Abatido
    CULLED = "culled"          # Descarte sanitário
    CLOSED = "closed"          # Encerrado


class EggQuality(str, enum.Enum):
    GRADE_A = "grade_a"        # Grau A (Tamanho padrão, casca perfeita)
    GRADE_B = "grade_b"        # Grau B (Médio / pequenas imperfeições)
    GRADE_C = "grade_c"        # Grau C (Industrial / rachados limpos)


class Farm(Base):
    __tablename__ = "poultry_farms"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, default=1)
    name = Column(String(150), nullable=False)  # Ex: "Quinta Agro-Pecuária Matola"
    location = Column(String(255), nullable=False)  # Bairro, Distrito, Província
    total_capacity = Column(Integer, nullable=False, default=1000)  # Capacidade instalada de aves
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    owner = relationship("User")
    flocks = relationship("Flock", back_populates="farm", cascade="all, delete-orphan", order_by="desc(Flock.created_at)")
    feed_stocks = relationship("FeedManagement", back_populates="farm", cascade="all, delete-orphan")


class Flock(Base):
    __tablename__ = "poultry_flocks"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("poultry_farms.id", ondelete="CASCADE"), nullable=False, index=True)
    flock_number = Column(String(50), nullable=False, index=True)  # Ex: "LOTE-001", "LOTE-2026-08"
    species = Column(String(50), nullable=False, default=PoultrySpecies.CHICKEN_BROILER.value)
    
    quantity_at_start = Column(Integer, nullable=False)  # Quantidade inicial de pintos
    quantity_current = Column(Integer, nullable=False)   # Quantidade viva atual
    
    cost_per_bird = Column(Numeric(15, 2), nullable=False, default=Decimal("55.00"))  # Preço unitário do pinto de 1 dia (MZN)
    feed_type = Column(String(100), nullable=True)  # Ração inicial, crescimento, acabamento
    
    start_date = Column(Date, nullable=False, default=date.today)
    expected_slaughter_date = Column(Date, nullable=True)  # Para frangos de corte (~35-42 dias)
    expected_first_lay_date = Column(Date, nullable=True)  # Para poedeiras (~18-20 semanas)
    
    status = Column(String(30), nullable=False, default=FlockStatus.GROWING.value, index=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="flocks")
    egg_productions = relationship("EggProduction", back_populates="flock", cascade="all, delete-orphan", order_by="desc(EggProduction.production_date)")
    feed_consumptions = relationship("FeedConsumption", back_populates="flock", cascade="all, delete-orphan", order_by="desc(FeedConsumption.consumption_date)")
    health_records = relationship("HealthRecord", back_populates="flock", cascade="all, delete-orphan", order_by="desc(HealthRecord.record_date)")
    mortality_records = relationship("MortalityRecord", back_populates="flock", cascade="all, delete-orphan", order_by="desc(MortalityRecord.record_date)")

    __table_args__ = (
        Index("ix_poultry_flocks_farm_status", "farm_id", "status"),
    )


class EggProduction(Base):
    __tablename__ = "poultry_egg_productions"

    id = Column(Integer, primary_key=True, index=True)
    flock_id = Column(Integer, ForeignKey("poultry_flocks.id", ondelete="CASCADE"), nullable=False, index=True)
    production_date = Column(Date, nullable=False, default=date.today, index=True)
    quantity = Column(Integer, nullable=False)  # Ovos colhidos no dia
    quality = Column(String(20), nullable=False, default=EggQuality.GRADE_A.value)  # grade_a, grade_b, grade_c
    broken_quantity = Column(Integer, default=0, nullable=False)  # Ovos rachados / quebrados
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    flock = relationship("Flock", back_populates="egg_productions")


class FeedManagement(Base):
    __tablename__ = "poultry_feed_stocks"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("poultry_farms.id", ondelete="CASCADE"), nullable=False, index=True)
    feed_type = Column(String(100), nullable=False)  # Ex: "Ração Inicial 50kg", "Ração Postura 50kg"
    cost_per_bag = Column(Numeric(15, 2), nullable=False)  # Preço por saco (MZN)
    bag_weight_kg = Column(Numeric(10, 2), nullable=False, default=Decimal("50.00"))
    quantity_in_stock = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))  # Quantidade de sacos em armazém
    supplier = Column(String(150), nullable=True)  # Fornecedor (ex: Novagric, Higest, Tiger Feeds)
    date_last_purchase = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="feed_stocks")


class FeedConsumption(Base):
    __tablename__ = "poultry_feed_consumptions"

    id = Column(Integer, primary_key=True, index=True)
    flock_id = Column(Integer, ForeignKey("poultry_flocks.id", ondelete="CASCADE"), nullable=False, index=True)
    feed_id = Column(Integer, ForeignKey("poultry_feed_stocks.id", ondelete="SET NULL"), nullable=True)
    consumption_date = Column(Date, nullable=False, default=date.today, index=True)
    bags_used = Column(Numeric(10, 2), nullable=False)  # Ex: 2.5 sacos
    kg_used = Column(Numeric(10, 2), nullable=False)    # Ex: 125 kg
    cost = Column(Numeric(15, 2), nullable=False)       # Custo monetário consumido (MZN)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    flock = relationship("Flock", back_populates="feed_consumptions")
    feed_stock = relationship("FeedManagement")


class HealthRecord(Base):
    __tablename__ = "poultry_health_records"

    id = Column(Integer, primary_key=True, index=True)
    flock_id = Column(Integer, ForeignKey("poultry_flocks.id", ondelete="CASCADE"), nullable=False, index=True)
    record_date = Column(Date, nullable=False, default=date.today, index=True)
    disease = Column(String(150), nullable=False)  # Newcastle, Gumboro, Coccidiose, Coriza, etc.
    birds_affected = Column(Integer, default=0, nullable=False)
    treatment = Column(String(255), nullable=False)  # Antibiótico, Vacinação na água, Vitaminas
    cost = Column(Numeric(15, 2), default=Decimal("0.00"), nullable=False)  # Custo do medicamento/vacina
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    flock = relationship("Flock", back_populates="health_records")


class MortalityRecord(Base):
    __tablename__ = "poultry_mortality_records"

    id = Column(Integer, primary_key=True, index=True)
    flock_id = Column(Integer, ForeignKey("poultry_flocks.id", ondelete="CASCADE"), nullable=False, index=True)
    record_date = Column(Date, nullable=False, default=date.today, index=True)
    quantity = Column(Integer, nullable=False)  # Quantidade de aves mortas
    cause = Column(String(100), nullable=False, default="unknown")  # disease, predator, heat_stress, smothering, unknown
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    flock = relationship("Flock", back_populates="mortality_records")
