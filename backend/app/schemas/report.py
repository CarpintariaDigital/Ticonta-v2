from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.report import ReportType


class SalesReportData(BaseModel):
    period: str
    total_sales_count: int
    total_revenue: Decimal
    total_tax_collected: Decimal
    average_ticket: Decimal
    payment_methods_breakdown: Dict[str, Decimal]
    top_products: List[Dict[str, Any]]
    top_customers: List[Dict[str, Any]]
    daily_timeline: List[Dict[str, Any]]


class FinancialReportData(BaseModel):
    period: str
    total_income: Decimal
    total_expenses: Decimal
    net_cash_flow: Decimal
    total_receivables: Decimal  # Clientes em débito
    cash_in_hand: Decimal
    bank_balances: Decimal
    profit_margin_percentage: float


class CRMReportData(BaseModel):
    period: str
    total_leads: int
    pipeline_total_value: Decimal
    weighted_pipeline_value: Decimal
    win_rate_percentage: float
    leads_by_stage: Dict[str, int]
    leads_by_source: Dict[str, int]
    average_days_in_stage: float


class ProjectsReportData(BaseModel):
    period: str
    total_projects: int
    active_projects: int
    completed_projects: int
    total_budget_contracted: Decimal
    total_actual_expenses: Decimal
    overall_profit: Decimal
    average_progress_percentage: float
    expenses_by_category: Dict[str, Decimal]


class HRReportData(BaseModel):
    period: str
    total_employees: int
    total_gross_payroll: Decimal
    total_inss_employee: Decimal
    total_inss_employer: Decimal
    total_inss_guia: Decimal
    total_irps_retained: Decimal
    total_net_disbursed: Decimal
    average_salary: Decimal
    attendance_rate_percentage: float


class CustomReportConfig(BaseModel):
    title: str = Field(..., min_length=2)
    report_type: ReportType
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    include_metrics: List[str] = []
    company_id: int = Field(default=1)


class SavedReportResponse(BaseModel):
    id: int
    company_id: int
    title: str
    report_type: ReportType
    period: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    data: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
