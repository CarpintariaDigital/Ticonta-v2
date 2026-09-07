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


class License(Base):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    license_key = Column(String(100), unique=True, nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=True)
    customer_id = Column(String(50), unique=True, nullable=False, index=True)
    plan = Column(String(50), nullable=False)  # basic, professional, complete, enterprise
    issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    issued_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="active", nullable=False)  # active, expired, revoked

    # Audit Trail Fields
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    renewed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoke_reason = Column(Text, nullable=True)
    revoked_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Usage & Telemetry Tracking
    last_validated_at = Column(DateTime(timezone=True), nullable=True)
    validation_count = Column(Integer, default=0, nullable=False)
    issue_count = Column(Integer, default=1, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    issued_by = relationship("User", foreign_keys=[issued_by_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    renewed_by = relationship("User", foreign_keys=[renewed_by_id])
    revoked_by = relationship("User", foreign_keys=[revoked_by_id])

    __table_args__ = (
        Index("ix_licenses_status_expires", "status", "expires_at"),
    )
