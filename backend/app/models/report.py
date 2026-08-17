import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Enum,
    Index,
    JSON,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class ReportType(str, enum.Enum):
    SALES = "sales"
    FINANCIAL = "financial"
    ACCOUNTING = "accounting"
    CRM = "crm"
    PROJECTS = "projects"
    HR = "hr"
    CUSTOM = "custom"


class SavedReport(Base):
    __tablename__ = "saved_reports"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    report_type = Column(Enum(ReportType), nullable=False, index=True)
    period = Column(String(50), nullable=True)  # ex: 2026-08, 2026-Q3, custom
    filters = Column(JSON, nullable=True)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    company = relationship("Company")
    user = relationship("User")

    __table_args__ = (
        Index("ix_saved_reports_company_type", "company_id", "report_type"),
    )
