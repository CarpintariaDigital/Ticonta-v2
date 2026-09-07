from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.employee import AttendanceStatus, PayrollStatus


# Employee Schemas
class EmployeeCreate(BaseModel):
    company_id: int = Field(default=1)
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    nuit: Optional[str] = None
    inss_number: Optional[str] = None
    position: str = Field(..., min_length=2, max_length=100)
    department: str = Field(default="Geral")
    salary: Decimal = Field(..., gt=0, description="Salário base mensal em MZN")
    start_date: Optional[date] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    nuit: Optional[str] = None
    inss_number: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[Decimal] = None
    active: Optional[bool] = None


class EmployeeResponse(BaseModel):
    id: int
    company_id: int
    first_name: str
    last_name: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    nuit: Optional[str] = None
    inss_number: Optional[str] = None
    position: str
    department: str
    salary: Decimal
    start_date: date
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Attendance Schemas
class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: AttendanceStatus = AttendanceStatus.PRESENT
    hours: Decimal = Field(default=Decimal("8.00"), ge=0, le=24)
    notes: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    date: date
    status: AttendanceStatus
    hours: Decimal
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Payroll Schemas
class PayrollGenerateRequest(BaseModel):
    company_id: int = Field(default=1)
    period: str = Field(..., pattern=r"^\d{4}-\d{2}$", description="Formato YYYY-MM (ex: 2026-08)")


class PayrollItemResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: str
    employee_nuit: Optional[str] = None
    employee_inss: Optional[str] = None
    position: str
    period: str
    gross_salary: Decimal
    inss_employee: Decimal  # 3%
    inss_employer: Decimal  # 4%
    irps: Decimal           # Retenção IRPS / IRT
    other_deductions: Decimal
    net_salary: Decimal
    status: PayrollStatus

    model_config = ConfigDict(from_attributes=True)


class MonthlyPayrollSummaryResponse(BaseModel):
    company_id: int
    period: str
    total_employees: int
    total_gross: Decimal
    total_inss_employee: Decimal  # 3%
    total_inss_employer: Decimal  # 4%
    total_inss_due: Decimal       # 7%
    total_irps: Decimal
    total_net_payable: Decimal
    items: List[PayrollItemResponse]


class INSSDeclarationXMLResponse(BaseModel):
    company_id: int
    period: str
    xml_content: str
    filename: str
