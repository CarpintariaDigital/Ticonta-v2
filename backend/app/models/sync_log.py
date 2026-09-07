from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    ForeignKey,
    Index,
    Boolean,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    device_id = Column(String(100), nullable=True, index=True)
    client_mutation_id = Column(String(100), unique=True, nullable=False, index=True)  # Idempotência
    entity = Column(String(100), nullable=False, index=True)  # Product, Sale, Customer, Account, etc.
    entity_id = Column(Integer, nullable=True)
    operation = Column(String(20), nullable=False)  # CREATE, UPDATE, DELETE
    client_timestamp = Column(DateTime(timezone=True), nullable=False)
    server_timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    payload = Column(JSON, nullable=True)
    status = Column(String(50), default="APPLIED", nullable=False)  # APPLIED, CONFLICT_RESOLVED, REJECTED
    conflict_details = Column(JSON, nullable=True)

    # Relationships
    company = relationship("Company")
    user = relationship("User")

    __table_args__ = (
        Index("ix_sync_logs_company_server_timestamp", "company_id", "server_timestamp"),
        Index("ix_sync_logs_entity_entity_id", "entity", "entity_id"),
    )
