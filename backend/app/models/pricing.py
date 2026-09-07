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
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class MarketProductType(str, enum.Enum):
    EGG_DOZEN = "egg_dozen"  # Dúzia de Ovos (12 ovos)
    EGG_CRATE = "egg_crate"  # Cartela de Ovos (30 ovos)
    LIVE_CHICKEN = "live_chicken"  # Frango Vivo (Corte)
    SLAUGHTERED_CHICKEN = "slaughtered_chicken"  # Frango Abatido/Limpo (kg)
    QUAIL_EGG_TRAY = "quail_egg_tray"  # Cartela de Ovos de Codorna (24 ovos)
    QUAIL_LIVE = "quail_live"  # Codorna Viva
    DUCK_LIVE = "duck_live"  # Pato Vivo


class PriceSource(str, enum.Enum):
    PRODUCER_DATA = "producer_data"
    MARKET_SURVEY = "market_survey"
    SIMAP_GOV = "simap_gov"  # Sistema de Informação de Mercados Agrícolas de Moçambique


class MarketPrice(Base):
    __tablename__ = "poultry_market_prices"

    id = Column(Integer, primary_key=True, index=True)
    product_type = Column(SQLEnum(MarketProductType), nullable=False, index=True)
    region = Column(String(100), default="Maputo/Matola", nullable=False, index=True)
    current_price = Column(Numeric(12, 2), nullable=False)
    min_price = Column(Numeric(12, 2), nullable=True)
    max_price = Column(Numeric(12, 2), nullable=True)
    price_date = Column(Date, default=date.today, nullable=False, index=True)
    source = Column(SQLEnum(PriceSource), default=PriceSource.MARKET_SURVEY, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ProducerPrice(Base):
    __tablename__ = "poultry_producer_prices"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    product_type = Column(SQLEnum(MarketProductType), nullable=False, index=True)
    unit_price = Column(Numeric(12, 2), nullable=False)
    min_order_quantity = Column(Integer, default=1, nullable=False)
    bulk_discount_percent = Column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    notes = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company")
