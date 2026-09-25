from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SupplierBase(BaseModel):
    name: str = Field(..., min_length=2, description="Nome ou Razão Social do Fornecedor")
    nuit: Optional[str] = Field(None, description="NUIT fiscal moçambicano de 9 dígitos")
    contact_person: Optional[str] = None
    phone: Optional[str] = Field(None, description="Telefone / WhatsApp")
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "Maputo"
    category: str = Field("Geral", description="Alimentar, Peças, Embalagens, Ração, Construção, Serviços")
    payment_terms: str = Field("30 Dias", description="Pronto Pagamento, 15 Dias, 30 Dias, 60 Dias")
    bank_name: Optional[str] = Field(None, description="Banco: BIM, BCI, Standard Bank, Moza")
    bank_account: Optional[str] = None
    bank_nib: Optional[str] = None
    notes: Optional[str] = None
    active: bool = True


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    nuit: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    category: Optional[str] = None
    payment_terms: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    bank_nib: Optional[str] = None
    notes: Optional[str] = None
    active: Optional[bool] = None


class SupplierPurchaseInvoiceCreate(BaseModel):
    supplier_id: int
    invoice_number: str = Field(..., description="Número da fatura do fornecedor (FT/FR)")
    invoice_date: date
    due_date: date
    total_amount: Decimal = Field(..., gt=0)
    iva_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    description: Optional[str] = None
    notes: Optional[str] = None


class SupplierPurchaseInvoiceResponse(BaseModel):
    id: int
    supplier_id: int
    supplier_name: str
    invoice_number: str
    invoice_date: date
    due_date: date
    total_amount: Decimal
    iva_amount: Decimal
    paid_amount: Decimal
    balance_due: Decimal
    status: str  # pendente, pago_parcial, pago, vencido
    description: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierResponse(SupplierBase):
    id: int
    company_id: int
    total_purchased_mzn: Decimal = Decimal("0.00")
    total_debt_mzn: Decimal = Decimal("0.00")
    purchases_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierPaymentRecordCreate(BaseModel):
    supplier_id: int
    invoice_id: Optional[int] = None
    amount_paid: Decimal = Field(..., gt=0)
    payment_method: str = Field("Transferência Bancária", description="Transferência, Cheque, M-Pesa, e-Mola, Numerário")
    payment_date: date
    transaction_ref: Optional[str] = None
    notes: Optional[str] = None
