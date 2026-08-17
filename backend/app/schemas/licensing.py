from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GenerateLicenseRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, description="Nome do cliente ou empresa licenciada")
    plan: str = Field(..., description="basic, professional, complete ou enterprise")
    days: int = Field(default=365, ge=1, le=3650, description="Duração da licença em dias")


class GenerateLicenseResponse(BaseModel):
    license_key: str
    customer_id: str
    customer_name: str
    plan: str
    modules: List[str]
    issued_at: datetime
    expires_at: datetime
    price_mzn: Decimal


class ValidateLicenseRequest(BaseModel):
    license_key: str = Field(..., min_length=10, description="Chave da licença no formato TIC-XXXXX-PLAN-YYMMDD-SIGNATURE")


class ValidateLicenseResponse(BaseModel):
    valid: bool
    customer_id: Optional[str] = None
    plan: Optional[str] = None
    modules: List[str] = []
    expires_at: Optional[str] = None
    days_remaining: int = 0
    error: Optional[str] = None


class ActivateLicenseRequest(BaseModel):
    company_id: int = Field(default=1)
    license_key: str = Field(..., min_length=10)


class ActivateLicenseResponse(BaseModel):
    message: str
    company_id: int
    plan: str
    modules: List[str]
    expires_at: datetime


class LicenseStatusResponse(BaseModel):
    status: str  # licensed, unlicensed, expired, revoked
    plan: Optional[str] = None
    modules: List[str] = []
    license_key: Optional[str] = None
    expires_at: Optional[datetime] = None
    days_remaining: int = 0


class LicenseListItem(BaseModel):
    id: int
    customer_name: str
    customer_id: str
    plan: str
    license_key: str
    issued_at: datetime
    expires_at: datetime
    status: str
    days_remaining: int


class RenewLicenseRequest(BaseModel):
    days: int = Field(default=365, ge=1, le=3650)


class RenewLicenseResponse(BaseModel):
    message: str
    license_id: int
    new_expiry: datetime
    days_remaining: int


class LicensingStatsResponse(BaseModel):
    total_licenses: int
    active_licenses: int
    expired_licenses: int
    revoked_licenses: int
    by_plan: Dict[str, int]
    estimated_revenue_mzn: Decimal
