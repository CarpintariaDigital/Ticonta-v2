from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class PaymentTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    payment_id: int
    amount: Decimal
    payment_method: str
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    paid_at: datetime
    created_at: datetime


class ProcessPaymentRequest(BaseModel):
    amount_paid: Decimal = Field(..., gt=0, description="Valor pago nesta transação")
    payment_method: str = Field("cash", description="cash, card, mpesa, emola, transfer, pos")
    transaction_id: Optional[str] = Field(None, description="ID da transação externa (ex: M-Pesa TxID)")
    notes: Optional[str] = Field(None, description="Observação ou recibo")
    due_date: Optional[datetime] = Field(None, description="Data limite para quitação do restante se parcial")
    
    # Contexto opcional de inicialização (se primeiro pagamento da venda)
    amount_total: Optional[Decimal] = Field(None, description="Valor total da venda (obrigatório se novo)")
    module_source: Optional[str] = Field("pos", description="pos, restaurant, takeaway, informal, manufacturing, project")
    invoice_number: Optional[str] = Field(None, description="Número da fatura/recibo")
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    company_id: Optional[int] = 1


class SplitPaymentMethodItem(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Valor para este método de pagamento")
    payment_method: str = Field(..., description="cash, card, mpesa, emola, transfer, pos")
    transaction_id: Optional[str] = None
    notes: Optional[str] = None


class SplitPaymentRequest(BaseModel):
    payments: List[SplitPaymentMethodItem] = Field(..., min_length=1, description="Divisão entre múltiplos métodos")
    amount_total: Optional[Decimal] = Field(None, description="Valor total esperado da venda")
    module_source: Optional[str] = Field("pos", description="Módulo originador")
    invoice_number: Optional[str] = None
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    company_id: Optional[int] = 1


class PaymentStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    payment_id: int
    sale_id: Optional[int] = None
    module_source: str
    invoice_number: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    amount_total: Decimal
    amount_paid: Decimal
    amount_owed: Decimal
    status: str  # pending, partial, paid, overdue, cancelled
    due_date: Optional[datetime] = None
    is_overdue: bool = False
    created_at: datetime
    updated_at: datetime
    transactions: List[PaymentTransactionResponse] = []
    message: str


class OutstandingPaymentItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    payment_id: int
    sale_id: Optional[int] = None
    module_source: str
    invoice_number: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    amount_total: Decimal
    amount_paid: Decimal
    amount_owed: Decimal
    status: str
    due_date: Optional[datetime] = None
    is_overdue: bool = False
    created_at: datetime


class OutstandingPaymentsResponse(BaseModel):
    company_id: int
    total_outstanding_amount: Decimal
    total_unpaid_count: int
    items: List[OutstandingPaymentItem]
