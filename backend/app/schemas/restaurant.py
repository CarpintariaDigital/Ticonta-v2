import json
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict, field_validator


# ==========================================
# Table Schemas
# ==========================================
class TableBase(BaseModel):
    table_number: str = Field(..., description="Número da mesa (ex: 01, 02, 99)")
    capacity: int = Field(4, ge=1, description="Capacidade máxima de pessoas")
    location: str = Field("indoor", description="Localização: indoor, outdoor, bar")


class TableCreate(TableBase):
    company_id: Optional[int] = 1


class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    status: Optional[str] = None
    active: Optional[bool] = None


class TableStatusUpdate(BaseModel):
    status: str = Field(..., description="Novo status: available, occupied, reserved, dirty")


class TableReserveRequest(BaseModel):
    guest_count: int = Field(..., ge=1, description="Quantidade de pessoas")
    reservation_time: datetime = Field(..., description="Data e hora da reserva")
    customer_name: str = Field(..., description="Nome do cliente")
    customer_phone: Optional[str] = Field(None, description="Telefone de contacto")


class TableResponse(TableBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    status: str
    reserved_for: Optional[str] = None
    reserved_contact: Optional[str] = None
    reservation_time: Optional[datetime] = None
    active: bool
    created_at: datetime
    updated_at: datetime


# ==========================================
# Menu Item Schemas
# ==========================================
class MenuItemBase(BaseModel):
    name: str = Field(..., description="Nome do prato ou bebida")
    description: Optional[str] = None
    category: str = Field("mains", description="Categoria: appetizers, mains, sides, drinks, desserts")
    price: Decimal = Field(..., ge=0, description="Preço em MZN")
    preparation_time: int = Field(15, ge=0, description="Tempo médio de preparo em minutos")
    image_url: Optional[str] = None
    dietary_info: Optional[str] = Field(None, description="Informações dietéticas: spicy, vegetarian, etc.")
    available: bool = Field(True, description="Disponibilidade em stock")


class MenuItemCreate(MenuItemBase):
    company_id: Optional[int] = 1
    product_id: Optional[int] = None


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = None
    preparation_time: Optional[int] = None
    image_url: Optional[str] = None
    dietary_info: Optional[str] = None
    available: Optional[bool] = None
    active: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    product_id: Optional[int] = None
    active: bool
    created_at: datetime
    updated_at: datetime


# ==========================================
# Order Item Schemas
# ==========================================
class OrderItemCreate(BaseModel):
    menu_item_id: int = Field(..., description="ID do item do menu")
    quantity: int = Field(1, ge=1, description="Quantidade de itens")
    special_requests: Optional[str] = Field(None, description="Observações especiais (ex: 'Extra spicy', 'Sem sal')")


class OrderItemStatusUpdate(BaseModel):
    status: str = Field(..., description="Status de preparação: pending, preparing, ready, served")


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    menu_item_id: int
    menu_item_name: Optional[str] = None
    menu_item_category: Optional[str] = None
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    special_requests: Optional[str] = None
    preparation_status: str
    started_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    served_at: Optional[datetime] = None
    created_at: datetime


# ==========================================
# Restaurant Order Schemas
# ==========================================
class RestaurantOrderCreate(BaseModel):
    company_id: Optional[int] = 1
    table_id: Optional[int] = Field(None, description="ID da mesa (opcional para takeaway/balcão)")
    guest_count: int = Field(1, ge=1, description="Número de clientes")
    waiter_id: Optional[int] = None
    notes: Optional[str] = None


class OrderSplitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    split_number: int
    guest_name: Optional[str] = None
    amount: Decimal
    payment_method: Optional[str] = None
    payment_status: str
    paid_at: Optional[datetime] = None
    created_at: datetime


class RestaurantOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    order_number: str
    table_id: Optional[int] = None
    table_number: Optional[str] = None
    guest_count: int
    status: str
    opened_at: datetime
    closed_at: Optional[datetime] = None
    subtotal: Decimal
    tax: Decimal
    service_charge: Decimal
    total: Decimal
    amount_paid: Decimal
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    waiter_id: Optional[int] = None
    sale_id: Optional[int] = None
    items: List[OrderItemResponse] = []
    splits: List[OrderSplitResponse] = []


# ==========================================
# Kitchen Display System (KDS) Schemas
# ==========================================
class KitchenDisplayItem(BaseModel):
    order_item_id: int
    order_id: int
    order_number: str
    table_id: Optional[int] = None
    table_number: Optional[str] = None
    menu_item_id: int
    menu_item_name: str
    category: str
    quantity: int
    special_requests: Optional[str] = None
    preparation_status: str  # pending, preparing, ready
    elapsed_minutes: int
    urgency_color: str  # green, yellow, red
    started_at: Optional[datetime] = None
    created_at: datetime


class KitchenDisplayResponse(BaseModel):
    items: List[KitchenDisplayItem]
    total_pending: int
    total_preparing: int
    total_ready: int
    average_wait_time_minutes: float


# ==========================================
# Bill & Split Bill Schemas
# ==========================================
class BillItem(BaseModel):
    id: int
    menu_item_name: str
    category: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    special_requests: Optional[str] = None
    preparation_status: str


class TableBillResponse(BaseModel):
    order_id: int
    order_number: str
    table_id: Optional[int] = None
    table_number: Optional[str] = None
    guest_count: int
    opened_at: datetime
    items: List[BillItem]
    subtotal: Decimal
    tax_percent: Decimal
    tax_amount: Decimal
    service_charge_percent: Decimal
    service_charge_amount: Decimal
    total: Decimal
    amount_paid: Decimal
    remaining_balance: Decimal
    is_paid: bool


class SplitBillRequest(BaseModel):
    num_bills: Optional[int] = Field(None, ge=1, le=50, description="Dividir em N partes iguais")
    custom_splits: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Divisão personalizada [{'guest_name': 'João', 'amount': 500.00, 'payment_method': 'mpesa'}]"
    )


class SplitBillResponse(BaseModel):
    order_id: int
    order_number: str
    total_order_amount: Decimal
    num_splits: int
    splits: List[OrderSplitResponse]
    total_allocated: Decimal
    remaining_to_allocate: Decimal


class CloseTableRequest(BaseModel):
    payment_method: str = Field("cash", description="Método: cash, mpesa, emola, pos, card, mixed")
    amount_paid: Optional[Decimal] = Field(None, description="Valor pago (se None, assume o total)")
    notes: Optional[str] = None
    auto_clean: Optional[bool] = Field(None, description="Se True, mesa fica available; se False, fica dirty")


class CloseTableResponse(BaseModel):
    order_id: int
    order_number: str
    status: str
    total: Decimal
    amount_paid: Decimal
    change: Decimal
    payment_method: str
    closed_at: datetime
    table_status: Optional[str] = None
    message: str


# ==========================================
# Reports & Analytics Schemas
# ==========================================
class HourlyRevenue(BaseModel):
    hour: int
    hour_label: str
    order_count: int
    revenue: Decimal


class TopDish(BaseModel):
    menu_item_id: int
    name: str
    category: str
    quantity_sold: int
    total_revenue: Decimal


class RestaurantReportsResponse(BaseModel):
    company_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_orders: int
    total_revenue: Decimal
    average_order_value: Decimal
    average_table_time_minutes: float
    peak_hours: List[HourlyRevenue]
    top_dishes: List[TopDish]
    revenue_by_category: Dict[str, Decimal]


# ==========================================
# Restaurant Settings Schemas
# ==========================================
class RestaurantSettingsBase(BaseModel):
    service_charge_percent: Decimal = Field(Decimal("10.00"), ge=0, le=100)
    tax_percent: Decimal = Field(Decimal("16.00"), ge=0, le=100)
    auto_clean_tables: bool = False
    operating_hours: Optional[Dict[str, Any]] = None
    menu_categories: Optional[List[str]] = None
    urgent_prep_time_minutes: int = Field(10, ge=1)

    @field_validator("operating_hours", mode="before")
    @classmethod
    def parse_operating_hours(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return {}
        return v

    @field_validator("menu_categories", mode="before")
    @classmethod
    def parse_menu_categories(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v


class RestaurantSettingsUpdate(BaseModel):
    service_charge_percent: Optional[Decimal] = None
    tax_percent: Optional[Decimal] = None
    auto_clean_tables: Optional[bool] = None
    operating_hours: Optional[Dict[str, Any]] = None
    menu_categories: Optional[List[str]] = None
    urgent_prep_time_minutes: Optional[int] = None


class RestaurantSettingsResponse(RestaurantSettingsBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime
