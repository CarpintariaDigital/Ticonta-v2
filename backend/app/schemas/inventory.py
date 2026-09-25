from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=2, description="Nome do artigo")
    sku: str = Field(..., description="Código SKU único")
    barcode: Optional[str] = None
    category: str = Field("Geral", description="Categoria do produto")
    unit: str = Field("un", description="Unidade: un, kg, lt, cx, pacote, saco")
    unit_price: Decimal = Field(..., ge=0, description="Preço de venda (MT)")
    cost_price: Decimal = Field(default=Decimal("0.00"), ge=0, description="Preço de custo de aquisição (MT)")
    current_stock: Decimal = Field(default=Decimal("0.000"), description="Quantidade física atual")
    min_stock_alert: Decimal = Field(default=Decimal("5.000"), ge=0, description="Nível de alerta de stock mínimo")
    iva_rate: Decimal = Field(default=Decimal("16.00"), ge=0)
    location: Optional[str] = Field("Armazém Principal", description="Prateleira / Depósito")
    supplier_id: Optional[int] = None
    active: bool = True


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    unit_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    min_stock_alert: Optional[Decimal] = None
    location: Optional[str] = None
    supplier_id: Optional[int] = None
    active: Optional[bool] = None


class InventoryItemResponse(InventoryItemBase):
    id: int
    company_id: int
    stock_value_cost_mzn: Decimal
    stock_value_retail_mzn: Decimal
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockMovementCreate(BaseModel):
    product_id: int = Field(..., description="ID do produto")
    movement_type: str = Field(..., description="in_purchase, in_adjustment, out_sale, out_damage, out_consumption, out_adjustment")
    quantity: Decimal = Field(..., gt=0, description="Quantidade a movimentar")
    unit_cost: Optional[Decimal] = Field(None, description="Custo unitário se for entrada")
    supplier_id: Optional[int] = None
    reference_document: Optional[str] = Field(None, description="Número da fatura de fornecedor ou nota interna")
    notes: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    company_id: int
    product_id: int
    product_name: str
    product_sku: str
    movement_type: str
    quantity: Decimal
    stock_before: Decimal
    stock_after: Decimal
    unit_cost: Decimal
    reference_document: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryOverviewStats(BaseModel):
    total_items: int
    low_stock_count: int
    out_of_stock_count: int
    total_stock_units: Decimal
    total_cost_value_mzn: Decimal
    total_retail_value_mzn: Decimal
    potential_margin_mzn: Decimal
    currency: str = "MZN"
