from decimal import Decimal
from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class RestaurantSettings(Base):
    __tablename__ = "restaurant_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    service_charge_percent = Column(Numeric(5, 2), default=Decimal("10.00"), nullable=False)  # 10% padrão
    tax_percent = Column(Numeric(5, 2), default=Decimal("16.00"), nullable=False)  # IVA 16% Moçambique
    auto_clean_tables = Column(Boolean, default=False, nullable=False)  # Se True, mesa fecha como available em vez de dirty
    operating_hours = Column(Text, nullable=True)  # JSON string com horários de funcionamento
    menu_categories = Column(Text, nullable=True)  # JSON string com categorias
    urgent_prep_time_minutes = Column(Integer, default=10, nullable=False)  # Tempo para KDS marcar vermelho
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
