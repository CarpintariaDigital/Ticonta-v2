from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(..., gt=0, description="Quantidade vendida (deve ser maior que zero)")
    unit_price: Optional[Decimal] = Field(None, ge=0, description="Preço unitário opcional (usa preço do produto se não fornecido)")
    tax_rate: Optional[Decimal] = Field(None, ge=0, le=100, description="Taxa de IVA (ex: 16.00)")


class PaymentCreate(BaseModel):
    method: str = Field(default="cash", description="cash, mpesa, emola, card, bank_transfer, credit")
    amount: Decimal = Field(..., gt=0)
    reference: Optional[str] = None


class SaleCreate(BaseModel):
    company_id: int = Field(default=1, description="ID da Empresa")
    customer_id: Optional[int] = None
    items: List[SaleItemCreate] = Field(..., min_length=1, description="Lista de itens da venda")
    payment_method: str = Field(default="cash", description="cash, mpesa, emola, card, bank_transfer, credit")
    payment_status: str = Field(default="completed", description="completed, pending, credit")
    discount: Decimal = Field(default=Decimal("0.00"), ge=0, description="Desconto total monetário")
    notes: Optional[str] = None
    payments: Optional[List[PaymentCreate]] = None


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: Decimal
    unit_price: Decimal
    tax_rate: Decimal
    subtotal: Optional[Decimal] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentResponse(BaseModel):
    id: int
    method: str
    amount: Decimal
    reference: Optional[str] = None
    payment_date: datetime

    model_config = ConfigDict(from_attributes=True)


class SaleResponse(BaseModel):
    id: int
    company_id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    user_id: int
    invoice_number: str
    total_amount: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    net_amount: Decimal
    payment_method: str
    payment_status: str
    sale_date: datetime
    created_at: datetime
    items: List[SaleItemResponse] = []
    payments: List[PaymentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class SaleListResponse(BaseModel):
    items: List[SaleResponse]
    total: int
    page: int
    size: int
    pages: int


class DailyRevenueResponse(BaseModel):
    date: str
    total_sales_count: int
    total_revenue: Decimal
    total_tax: Decimal
    total_discounts: Decimal
    payment_breakdown: Dict[str, Decimal]
