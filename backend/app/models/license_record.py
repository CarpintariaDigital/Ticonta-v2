from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from app.core.database import Base


class LicenseRecord(Base):
    __tablename__ = "license_records"

    id = Column(Integer, primary_key=True, index=True)
    license_key = Column(String(100), unique=True, index=True, nullable=False)
    nuit = Column(String(20), index=True, nullable=False)
    machine_id = Column(String(100), index=True, nullable=False)
    plan = Column(String(50), nullable=False, default="base")
    client_name = Column(String(255), nullable=True)
    client_email = Column(String(255), nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
