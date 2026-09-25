from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuoteItemBase(BaseModel):
    product_id: Optional[int] = None
    description: str = Field(..., min_length=1, description="Descrição do artigo ou serviço cotado")
    quantity: Decimal = Field(default=Decimal("1.000"), gt=0)
    unit_price: Decimal = Field(default=Decimal("0.00"), ge=0)
    discount_percent: Decimal = Field(default=Decimal("0.00"), ge=0, le=100)
    iva_rate: Decimal = Field(default=Decimal("16.00"), ge=0)


class QuoteItemCreate(QuoteItemBase):
    pass


class QuoteItemResponse(QuoteItemBase):
    id: Optional[int] = None
    subtotal: Decimal
    iva_amount: Decimal
    total: Decimal

    model_config = ConfigDict(from_attributes=True)


class QuoteCreate(BaseModel):
    quote_type: str = Field("cotacao", description="cotacao ou proforma")
    customer_id: Optional[int] = None
    customer_name: str = Field(..., min_length=2, description="Nome do cliente ou empresa")
    customer_nuit: Optional[str] = Field(None, description="NUIT fiscal de 9 dígitos")
    customer_phone: Optional[str] = Field(None, description="Telefone / WhatsApp para envio")
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    valid_until: Optional[date] = None
    payment_terms: str = Field("Pronto Pagamento", description="Condições de pagamento")
    notes: Optional[str] = None
    items: List[QuoteItemCreate] = Field(..., min_items=1)


class QuoteUpdateStatus(BaseModel):
    status: str = Field(..., description="rascunho, enviada, aprovada, recusada, convertida")
    rejection_reason: Optional[str] = None


class QuoteResponse(BaseModel):
    id: int
    company_id: int
    quote_number: str
    quote_type: str
    customer_id: Optional[int] = None
    customer_name: str
    customer_nuit: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    customer_address: Optional[str] = None
    issue_date: date
    valid_until: date
    status: str
    subtotal: Decimal
    iva_total: Decimal
    discount_total: Decimal
    total: Decimal
    payment_terms: str
    notes: Optional[str] = None
    converted_sale_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    items: List[QuoteItemResponse]

    model_config = ConfigDict(from_attributes=True)


class ConvertQuoteToSaleResponse(BaseModel):
    quote_id: int
    quote_number: str
    sale_id: int
    invoice_number: str
    total_mzn: Decimal
    message: str
