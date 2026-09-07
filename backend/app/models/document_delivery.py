from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Index,
    Text,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class DocumentDelivery(Base):
    __tablename__ = "document_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)  # invoice, receipt, quote, purchase_order
    document_id = Column(Integer, nullable=False)
    customer_phone = Column(String(50), nullable=True)  # +25884...
    customer_email = Column(String(255), nullable=True)
    delivery_method = Column(String(20), nullable=False)  # whatsapp, sms, email
    status = Column(String(50), default="pending", nullable=False)  # pending, sent, failed, delivered
    pdf_url = Column(String(500), nullable=False)
    message_id = Column(String(100), nullable=True)  # Twilio Message SID
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")

    __table_args__ = (
        Index("ix_doc_deliveries_company_status", "company_id", "status"),
        Index("ix_doc_deliveries_type_id", "document_type", "document_id"),
    )
