from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Index,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class BarcodeScanLog(Base):
    __tablename__ = "barcode_scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    barcode = Column(String(100), nullable=False, index=True)
    scanned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    product = relationship("Product")
    user = relationship("User")

    __table_args__ = (
        Index("ix_barcode_scans_company_time", "company_id", "scanned_at"),
    )
