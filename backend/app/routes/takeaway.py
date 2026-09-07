from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.takeaway import (
    TakeawayOrderCreate,
    TakeawayOrderResponse,
    DeliveryAssignRequest,
    DeliveryStatusUpdateRequest,
    OrderStatusUpdateRequest,
    OrderTrackingResponse,
    TakeawayStatsResponse,
)
from app.services.takeaway import TakeawayService

router = APIRouter(prefix="/api/v1/takeaway", tags=["Takeaway & Delivery Orders"])


@router.post("/orders", response_model=TakeawayOrderResponse, status_code=status.HTTP_201_CREATED)
def create_takeaway_order(
    data: TakeawayOrderCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Criar novo pedido de Takeaway (para viagem) ou Delivery (entrega ao domicílio)."""
    service = TakeawayService(db)
    return service.create_takeaway_order(data=data, company_id=company_id)


@router.get("/orders", response_model=List[TakeawayOrderResponse])
def list_takeaway_orders(
    company_id: int = Query(1),
    status_filter: Optional[str] = Query(None, alias="status", description="pending, preparing, ready, in_transit, delivered, picked_up"),
    order_type: Optional[str] = Query(None, description="takeaway ou delivery"),
    search: Optional[str] = Query(None, description="Buscar por número, nome ou telefone"),
    db: Session = Depends(get_db),
):
    """Listar todos os pedidos com filtros de status e tipo."""
    service = TakeawayService(db)
    return service.list_orders(
        company_id=company_id,
        status_filter=status_filter,
        order_type=order_type,
        search=search
    )


@router.get("/orders/{id}", response_model=TakeawayOrderResponse)
def get_takeaway_order(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Obter detalhes completos de um pedido de takeaway."""
    service = TakeawayService(db)
    return service.get_order(order_id=id, company_id=company_id)


@router.get("/orders/{id}/track", response_model=OrderTrackingResponse)
def track_order_by_id(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Rastreio em tempo real do pedido com cronograma de etapas (cozinha, despacho e entrega)."""
    service = TakeawayService(db)
    return service.track_order(order_id_or_code=str(id), company_id=company_id)


@router.get("/track/{tracking_code}", response_model=OrderTrackingResponse)
def track_order_by_code(
    tracking_code: str,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Rastreio público via código de rastreamento (ex: TC-A1B2C3)."""
    service = TakeawayService(db)
    return service.track_order(order_id_or_code=tracking_code, company_id=company_id)


@router.put("/orders/{id}/status", response_model=TakeawayOrderResponse)
def update_order_status(
    id: int,
    data: OrderStatusUpdateRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar status do pedido (pending → preparing → ready → picked_up/delivered)."""
    service = TakeawayService(db)
    return service.update_order_status(order_id=id, data=data, company_id=company_id)


@router.post("/orders/{id}/delivery/assign", response_model=TakeawayOrderResponse)
def assign_delivery_person(
    id: int,
    data: DeliveryAssignRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atribuir estafeta/motorista à entrega e disparar notificação WhatsApp ao cliente."""
    service = TakeawayService(db)
    return service.assign_delivery(order_id=id, data=data, company_id=company_id)


@router.put("/orders/{id}/delivery/status", response_model=TakeawayOrderResponse)
def update_delivery_status(
    id: int,
    data: DeliveryStatusUpdateRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar status da entrega pelo estafeta (in_transit, delivered, failed)."""
    service = TakeawayService(db)
    return service.update_delivery_status(order_id=id, data=data, company_id=company_id)


@router.get("/pending-deliveries", response_model=List[TakeawayOrderResponse])
def get_pending_deliveries(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Listar todas as entregas ativas e pendentes para despacho."""
    service = TakeawayService(db)
    return service.get_pending_deliveries(company_id=company_id)


@router.get("/stats", response_model=TakeawayStatsResponse)
def get_takeaway_stats(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Estatísticas diárias de takeaway e entregas (pedidos, receitas, tempo médio)."""
    service = TakeawayService(db)
    return service.get_takeaway_stats(company_id=company_id)
