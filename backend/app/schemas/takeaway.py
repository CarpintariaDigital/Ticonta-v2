from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# Items & Delivery Sub-Schemas
# ==========================================
class TakeawayOrderItemInput(BaseModel):
    menu_item_id: Optional[int] = None
    item_name: str = Field(..., min_length=1, description="Nome do prato/item")
    quantity: int = Field(1, ge=1, description="Quantidade")
    unit_price: Decimal = Field(..., ge=0, description="Preço unitário")
    special_requests: Optional[str] = Field(None, description="Observações especiais (ex: Sem picante)")


class TakeawayOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    takeaway_order_id: int
    menu_item_id: Optional[int] = None
    item_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    special_requests: Optional[str] = None
    preparation_status: str
    created_at: datetime


class DeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    order_id: int
    delivery_person_id: Optional[int] = None
    delivery_person_name: Optional[str] = None
    delivery_person_phone: Optional[str] = None
    delivery_address: str
    delivery_phone: str
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    delivery_fee: Decimal
    delivery_status: str
    tracking_code: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ==========================================
# Takeaway Order Create & Response
# ==========================================
class TakeawayOrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, description="Nome do cliente")
    customer_phone: str = Field(..., min_length=8, description="Telefone do cliente (WhatsApp)")
    order_type: str = Field("takeaway", description="'takeaway' para levantamento ou 'delivery' para entrega")
    delivery_address: Optional[str] = Field(None, description="Endereço de entrega (obrigatório se order_type == 'delivery')")
    delivery_time: Optional[datetime] = Field(None, description="Horário agendado para entrega/levantamento")
    special_instructions: Optional[str] = Field(None, description="Instruções adicionais ou ponto de referência")
    payment_method: str = Field("mpesa", description="Forma de pagamento: mpesa, emola, cash, pos, card")
    payment_status: str = Field("pending", description="Status do pagamento: pending, paid, partial")
    items: List[TakeawayOrderItemInput] = Field(..., min_length=1, description="Lista de itens do pedido")
    delivery_fee: Optional[Decimal] = Field(Decimal("0.00"), ge=0, description="Taxa de entrega (se delivery)")
    company_id: Optional[int] = 1


class TakeawayOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    order_number: str
    customer_name: str
    customer_phone: str
    order_type: str
    status: str
    delivery_address: Optional[str] = None
    delivery_time: Optional[datetime] = None
    special_instructions: Optional[str] = None
    subtotal: Decimal
    delivery_fee: Decimal
    tax: Decimal
    total: Decimal
    payment_method: str
    payment_status: str
    estimated_prep_minutes: int
    estimated_delivery_minutes: int
    estimated_ready_at: Optional[datetime] = None
    ready_at: Optional[datetime] = None
    pickup_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[TakeawayOrderItemResponse] = []
    delivery: Optional[DeliveryResponse] = None


# ==========================================
# Delivery Assignment & Status Update
# ==========================================
class DeliveryAssignRequest(BaseModel):
    delivery_person_id: Optional[int] = None
    delivery_person_name: str = Field(..., description="Nome do estafeta / motorista")
    delivery_person_phone: Optional[str] = Field(None, description="Contacto do estafeta")
    estimated_minutes: Optional[int] = Field(15, ge=1, description="Tempo estimado de entrega em minutos")


class DeliveryStatusUpdateRequest(BaseModel):
    delivery_status: str = Field(..., description="in_transit, delivered, failed, cancelled")
    notes: Optional[str] = None


class OrderStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="pending, preparing, ready, in_transit, delivered, picked_up, cancelled")
    notes: Optional[str] = None


# ==========================================
# Real-Time Tracking & Stats
# ==========================================
class OrderTrackingStep(BaseModel):
    step_number: int
    label: str
    status: str  # completed, current, upcoming
    timestamp: Optional[datetime] = None


class OrderTrackingResponse(BaseModel):
    order_id: int
    order_number: str
    customer_name: str
    customer_phone: str
    order_type: str
    current_status: str
    tracking_code: Optional[str] = None
    estimated_ready_time: Optional[datetime] = None
    estimated_delivery_time: Optional[datetime] = None
    total_estimated_minutes: int
    delivery_person_name: Optional[str] = None
    delivery_person_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    steps: List[OrderTrackingStep]
    items_summary: List[str]
    total_amount: Decimal


class TakeawayStatsResponse(BaseModel):
    company_id: int
    total_orders_today: int
    takeaway_count: int
    delivery_count: int
    pending_count: int
    preparing_count: int
    ready_count: int
    in_transit_count: int
    completed_today: int
    total_revenue_today: Decimal
    average_prep_time_minutes: int
