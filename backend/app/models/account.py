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
    Text,
    Index,
    func
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    account_code = Column(String(50), unique=True, nullable=False, index=True)
    account_name = Column(String(255), nullable=False)
    account_type = Column(String(50), nullable=False)  # asset, liability, equity, revenue, expense
    is_header = Column(Boolean, default=False, nullable=False)
    parent_id = Column(Integer, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    debit_balance = Column(Numeric(15, 2), default=0.00, nullable=False)
    credit_balance = Column(Numeric(15, 2), default=0.00, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="accounts")
    parent = relationship("Account", remote_side=[id], backref="children")
    debit_entries = relationship("JournalEntry", foreign_keys="JournalEntry.debit_account_id", back_populates="debit_account")
    credit_entries = relationship("JournalEntry", foreign_keys="JournalEntry.credit_account_id", back_populates="credit_account")

    @property
    def current_balance(self) -> Decimal:
        """
        Regra PGC-NIRF Moçambique:
        - Activo (asset) e Gastos/Custos (expense): Débito - Crédito
        - Passivo (liability), Capital Próprio (equity) e Rendimentos/Vendas (revenue): Crédito - Débito
        """
        d = self.debit_balance or Decimal("0.00")
        c = self.credit_balance or Decimal("0.00")
        if self.account_type.lower() in ["asset", "expense", "activo", "gasto"]:
            return d - c
        return c - d


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    entry_date = Column(DateTime(timezone=True), nullable=False, default=func.now())
    entry_number = Column(String(100), unique=True, nullable=False, index=True)
    debit_account_id = Column(Integer, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=False)
    credit_account_id = Column(Integer, ForeignKey("accounts.id", ondelete="RESTRICT"), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    description = Column(Text, nullable=True)
    reference_type = Column(String(50), nullable=True)
    reference_id = Column(Integer, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="journal_entries")
    debit_account = relationship("Account", foreign_keys=[debit_account_id], back_populates="debit_entries")
    credit_account = relationship("Account", foreign_keys=[credit_account_id], back_populates="credit_entries")
    created_by = relationship("User", back_populates="journal_entries")

    __table_args__ = (
        Index("ix_journal_entries_company_entry_date", "company_id", "entry_date"),
    )
