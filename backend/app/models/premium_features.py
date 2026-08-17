from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Numeric,
    DateTime,
    ForeignKey,
    Index,
    Text,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class PremiumFeature(Base):
    __tablename__ = "premium_features"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)  # whatsapp_delivery, sms_delivery, email_delivery, barcode_scanner
    description = Column(Text, nullable=True)
    monthly_cost_mzn = Column(Numeric(15, 2), default=0.00, nullable=False)
    category = Column(String(50), nullable=False)  # communication, pos, automation
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    company_features = relationship("CompanyPremiumFeature", back_populates="feature", cascade="all, delete-orphan")


class CompanyPremiumFeature(Base):
    __tablename__ = "company_premium_features"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    feature_id = Column(Integer, ForeignKey("premium_features.id", ondelete="CASCADE"), nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    activated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    activated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    deactivated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    company = relationship("Company")
    feature = relationship("PremiumFeature", back_populates="company_features")
    activated_by = relationship("User")

    __table_args__ = (
        Index("ix_company_feature_unique", "company_id", "feature_id", unique=True),
    )
