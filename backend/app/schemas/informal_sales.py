from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# Informal Customer Schemas
# ==========================================
class QuickCustomerCreate(BaseModel):
    name: str = Field(..., min_length=2, description="Nome do cliente informal")
    phone: Optional[str] = Field(None, description="Número de telefone (ex: +258841234567)")
    location: Optional[str] = Field(None, description="Bairro / Rua / Ponto de referência")
    trusted_credit_limit: Optional[Decimal] = Field(Decimal("5000.00"), ge=0, description="Limite máximo de fiado")
    notes: Optional[str] = Field(None, description="Observações de confiança ou preferências")
    company_id: Optional[int] = 1


class InformalCustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_picture: Optional[str] = None
    trusted_credit_limit: Optional[Decimal] = None
    payment_reliability: Optional[Decimal] = None
    notes: Optional[str] = None
    verified: Optional[bool] = None
    active: Optional[bool] = None


class InformalCustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    profile_picture: Optional[str] = None
    total_purchases: Decimal
    total_owed: Decimal
    trusted_credit_limit: Decimal
    payment_reliability: Decimal
    notes: Optional[str] = None
    verified: bool
    last_purchase_date: Optional[datetime] = None
    last_purchase_amount: Optional[Decimal] = None
    active: bool
    created_at: datetime
    updated_at: datetime


# ==========================================
# Debit & Partial Payment Schemas
# ==========================================
class PartialPaymentItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    debit_id: int
    amount: Decimal
    payment_method: str
    paid_at: datetime
    notes: Optional[str] = None
    created_at: datetime


class DebitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_location: Optional[str] = None
    sale_id: Optional[int] = None
    total_amount: Decimal
    initial_paid: Decimal
    amount_owed: Decimal
    amount_paid: Decimal
    due_date: Optional[datetime] = None
    status: str  # active, partially_paid, paid, overdue, cancelled
    notes: Optional[str] = None
    reminder_count: int
    last_reminder_sent_at: Optional[datetime] = None
    is_overdue: bool = False
    days_overdue: int = 0
    created_at: datetime
    updated_at: datetime
    partial_payments: List[PartialPaymentItem] = []


class CustomerDebitSummary(BaseModel):
    customer_id: int
    customer_name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    total_purchases: Decimal
    total_owed: Decimal
    trusted_credit_limit: Decimal
    payment_reliability: Decimal
    active_debits_count: int
    active_debits: List[DebitResponse] = []


class PartialPaymentCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Valor que o cliente está amortizando/pagando")
    payment_method: str = Field("mpesa", description="Método: cash, mpesa, emola, pos, card")
    notes: Optional[str] = Field(None, description="Observação sobre a amortização")
    send_notification: bool = Field(True, description="Enviar comprovativo de pagamento via WhatsApp/SMS")


class PartialPaymentResult(BaseModel):
    payment_id: int
    debit_id: int
    amount_paid_now: Decimal
    total_amortized: Decimal
    remaining_balance: Decimal
    debit_status: str
    notification_sent: bool
    notification_message: Optional[str] = None
    message: str


# ==========================================
# Sale With Debit Schemas
# ==========================================
class SaleDebitItemInput(BaseModel):
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    quantity: Decimal = Field(Decimal("1.0"), gt=0)
    unit_price: Decimal = Field(..., ge=0)
    tax_rate: Optional[Decimal] = Decimal("16.00")


class SaleWithDebitCreate(BaseModel):
    customer_id: int = Field(..., description="ID do cliente informal")
    items: List[SaleDebitItemInput] = Field(..., min_length=1)
    amount_paid_now: Optional[Decimal] = Field(Decimal("0.00"), ge=0, description="Valor pago de entrada")
    due_date: Optional[datetime] = Field(None, description="Data limite prometida para quitação do fiado")
    payment_method: str = Field("cash", description="Método da entrada: cash, mpesa, emola, pos, card")
    notes: Optional[str] = Field(None, description="Observações da venda ou acordo de pagamento")
    company_id: Optional[int] = 1


class SaleWithDebitResponse(BaseModel):
    sale_id: Optional[int] = None
    invoice_number: str
    debit_id: Optional[int] = None
    customer_id: int
    customer_name: str
    customer_phone: Optional[str] = None
    total_amount: Decimal
    amount_paid_now: Decimal
    amount_owed: Decimal
    due_date: Optional[datetime] = None
    status: str
    payment_reliability_score: Decimal
    message: str


# ==========================================
# Reminder & Notification Schemas
# ==========================================
class SendReminderRequest(BaseModel):
    channel: str = Field("whatsapp", description="Canal de envio: whatsapp ou sms")
    custom_message: Optional[str] = Field(None, description="Mensagem customizada opcional")


class SendReminderResponse(BaseModel):
    debit_id: int
    customer_name: str
    recipient: str
    channel: str
    message: str
    status: str
    sent_at: datetime


# ==========================================
# Reports & Credit Risk Schemas
# ==========================================
class CreditRiskCustomer(BaseModel):
    customer_id: int
    name: str
    phone: Optional[str] = None
    location: Optional[str] = None
    total_owed: Decimal
    trusted_credit_limit: Decimal
    payment_reliability: Decimal
    risk_level: str  # high, medium, low
    overdue_debits_count: int
    overdue_amount: Decimal


class CreditRiskReportResponse(BaseModel):
    company_id: int
    total_debt_at_risk: Decimal
    high_risk_customers_count: int
    medium_risk_customers_count: int
    low_risk_customers_count: int
    customers: List[CreditRiskCustomer]


class CashFlowForecastItem(BaseModel):
    period_label: str  # "Vencidos", "Hoje", "Esta Semana", "Próximos 15 Dias", "Próximo Mês"
    expected_amount: Decimal
    debit_count: int
    customer_names: List[str]


class CashFlowForecastResponse(BaseModel):
    company_id: int
    total_outstanding_debt: Decimal
    overdue_amount: Decimal
    due_today_amount: Decimal
    due_this_week_amount: Decimal
    forecast_timeline: List[CashFlowForecastItem]


class RevenueBreakdownResponse(BaseModel):
    company_id: int
    immediate_cash_revenue: Decimal
    debit_credit_revenue: Decimal
    total_revenue: Decimal
    total_recovered_debt: Decimal
    debit_recovery_rate_percent: Decimal
