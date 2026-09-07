from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    pin_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="operator")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    sales = relationship("Sale", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="created_by")
    audit_logs = relationship("AuditLog", back_populates="user")

    def is_admin(self) -> bool:
        """Check if user has admin role."""
        return self.role.lower() == "admin"

    def has_role(self, role: str) -> bool:
        """Check if user matches a specific role."""
        return self.role.lower() == role.lower()
