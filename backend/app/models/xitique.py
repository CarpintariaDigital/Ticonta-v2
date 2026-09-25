from datetime import datetime, date
from decimal import Decimal
import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    Date,
    Enum,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class XitiqueType(str, enum.Enum):
    MONETARY = "MONETARY"
    PRODUCTS = "PRODUCTS"


class XitiquePeriod(str, enum.Enum):
    WEEKLY = "WEEKLY"
    BIWEEKLY = "BIWEEKLY"
    MONTHLY = "MONTHLY"


class XitiqueOrderType(str, enum.Enum):
    FIXED = "FIXED"
    LOTTERY = "LOTTERY"


class XitiqueStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    SUSPENDED = "SUSPENDED"


class MemberStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DEFAULTED = "DEFAULTED"
    REMOVED = "REMOVED"


class ContributionStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    LATE = "LATE"
    WAIVED = "WAIVED"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    MPESA = "MPESA"
    TRANSFER = "TRANSFER"


class DeliveryStatus(str, enum.Enum):
    PENDING = "PENDING"
    DELIVERED = "DELIVERED"


class XitiqueGroup(Base):
    __tablename__ = "xitique_groups"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(XitiqueType), default=XitiqueType.MONETARY, nullable=False)
    product_description = Column(String(255), nullable=True)
    contribution_value = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="MZN", nullable=False)
    period = Column(Enum(XitiquePeriod), default=XitiquePeriod.MONTHLY, nullable=False)
    total_members = Column(Integer, nullable=False, default=1)
    current_round = Column(Integer, nullable=False, default=1)
    total_rounds = Column(Integer, nullable=False, default=1)
    order_type = Column(Enum(XitiqueOrderType), default=XitiqueOrderType.FIXED, nullable=False)
    status = Column(Enum(XitiqueStatus), default=XitiqueStatus.ACTIVE, nullable=False)
    start_date = Column(Date, default=date.today, nullable=False)
    end_date = Column(Date, nullable=True)
    admin_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    members = relationship("XitiqueMember", back_populates="group", cascade="all, delete-orphan")
    contributions = relationship("XitiqueContribution", back_populates="group", cascade="all, delete-orphan")
    deliveries = relationship("XitiqueDelivery", back_populates="group", cascade="all, delete-orphan")


class XitiqueMember(Base):
    __tablename__ = "xitique_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("xitique_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    receive_order = Column(Integer, nullable=False, default=1)
    status = Column(Enum(MemberStatus), default=MemberStatus.ACTIVE, nullable=False)
    total_paid = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_received = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    group = relationship("XitiqueGroup", back_populates="members")
    contributions = relationship("XitiqueContribution", back_populates="member", cascade="all, delete-orphan")
    deliveries = relationship("XitiqueDelivery", back_populates="member", cascade="all, delete-orphan")


class XitiqueContribution(Base):
    __tablename__ = "xitique_contributions"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("xitique_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(Integer, ForeignKey("xitique_members.id", ondelete="CASCADE"), nullable=False, index=True)
    round_number = Column(Integer, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    paid_at = Column(DateTime, nullable=True)
    status = Column(Enum(ContributionStatus), default=ContributionStatus.PENDING, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=True)

    group = relationship("XitiqueGroup", back_populates="contributions")
    member = relationship("XitiqueMember", back_populates="contributions")


class XitiqueDelivery(Base):
    __tablename__ = "xitique_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("xitique_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    member_id = Column(Integer, ForeignKey("xitique_members.id", ondelete="CASCADE"), nullable=False, index=True)
    round_number = Column(Integer, nullable=False)
    amount_delivered = Column(Numeric(12, 2), nullable=False)
    delivered_at = Column(DateTime, nullable=True)
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.PENDING, nullable=False)
    notes = Column(Text, nullable=True)

    group = relationship("XitiqueGroup", back_populates="deliveries")
    member = relationship("XitiqueMember", back_populates="deliveries")
