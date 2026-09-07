import enum
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    ForeignKey,
    Text,
    Enum,
    Index,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class LeadStage(str, enum.Enum):
    NOVO = "novo"
    PROPOSTA = "proposta"
    GANHO = "ganho"
    PERDIDO = "perdido"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    stage = Column(Enum(LeadStage), default=LeadStage.NOVO, nullable=False, index=True)
    value = Column(Numeric(15, 2), default=0.00, nullable=False)
    probability = Column(Integer, default=10, nullable=False)  # 0 a 100%
    source = Column(String(100), default="direct", nullable=False)  # website, referral, direct, whatsapp, phone
    notes = Column(Text, nullable=True)
    assigned_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    assigned_user = relationship("User", foreign_keys=[assigned_user_id])
    interactions = relationship("Interaction", back_populates="lead", cascade="all, delete-orphan", order_by="desc(Interaction.date)")

    __table_args__ = (
        Index("ix_leads_company_stage", "company_id", "stage"),
        Index("ix_leads_company_source", "company_id", "source"),
    )


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    type = Column(String(50), nullable=False)  # call, meeting, email, whatsapp, note, proposal
    description = Column(Text, nullable=False)
    date = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    lead = relationship("Lead", back_populates="interactions")
    user = relationship("User")

    __table_args__ = (
        Index("ix_interactions_lead_date", "lead_id", "date"),
    )
