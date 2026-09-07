from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class AccountCreate(BaseModel):
    company_id: int = Field(default=1)
    account_code: str = Field(..., min_length=1, max_length=50, description="Ex: 1.1.1, 7.1.1")
    account_name: str = Field(..., min_length=2, max_length=255)
    account_type: str = Field(..., description="asset, liability, equity, revenue, expense")
    is_header: bool = Field(default=False)
    parent_id: Optional[int] = None


class AccountResponse(BaseModel):
    id: int
    company_id: int
    account_code: str
    account_name: str
    account_type: str
    is_header: bool
    parent_id: Optional[int] = None
    debit_balance: Decimal
    credit_balance: Decimal
    current_balance: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JournalEntryCreate(BaseModel):
    company_id: int = Field(default=1)
    debit_account_id: int
    credit_account_id: int
    amount: Decimal = Field(..., gt=0, description="Valor do lançamento em MZN")
    description: str = Field(..., min_length=3, max_length=500)
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    entry_date: Optional[datetime] = None

    @field_validator("credit_account_id")
    @classmethod
    def check_different_accounts(cls, v, info):
        if "debit_account_id" in info.data and v == info.data["debit_account_id"]:
            raise ValueError("A conta a debitar e a creditar não podem ser a mesma.")
        return v


class JournalEntryResponse(BaseModel):
    id: int
    company_id: int
    entry_date: datetime
    entry_number: str
    debit_account_id: int
    debit_account_code: Optional[str] = None
    debit_account_name: Optional[str] = None
    credit_account_id: int
    credit_account_code: Optional[str] = None
    credit_account_name: Optional[str] = None
    amount: Decimal
    description: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    created_by_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TrialBalanceItem(BaseModel):
    account_code: str
    account_name: str
    account_type: str
    total_debit: Decimal
    total_credit: Decimal
    debit_balance: Decimal
    credit_balance: Decimal


class TrialBalanceResponse(BaseModel):
    date: str
    items: List[TrialBalanceItem]
    sum_total_debits: Decimal
    sum_total_credits: Decimal
    is_balanced: bool


class IncomeStatementResponse(BaseModel):
    period_from: str
    period_to: str
    total_revenues: Decimal
    total_expenses: Decimal
    gross_profit: Decimal
    operating_profit: Decimal
    net_income: Decimal
    revenues_breakdown: List[Dict[str, Any]]
    expenses_breakdown: List[Dict[str, Any]]


class BalanceSheetResponse(BaseModel):
    as_of_date: str
    total_assets: Decimal
    total_liabilities: Decimal
    total_equity: Decimal
    retained_earnings: Decimal
    is_balanced: bool
    assets_breakdown: List[Dict[str, Any]]
    liabilities_breakdown: List[Dict[str, Any]]
    equity_breakdown: List[Dict[str, Any]]
