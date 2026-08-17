from datetime import date, datetime
from typing import Any, Dict, List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    Response,
    WebSocket,
    WebSocketDisconnect,
    status
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.models.restaurant import Table, MenuItem, OrderItem, RestaurantOrder
from app.schemas.restaurant import (
    TableCreate,
    TableUpdate,
    TableStatusUpdate,
    TableReserveRequest,
    TableResponse,
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemResponse,
    OrderItemCreate,
    OrderItemStatusUpdate,
    OrderItemResponse,
    RestaurantOrderCreate,
    RestaurantOrderResponse,
    KitchenDisplayResponse,
    TableBillResponse,
    SplitBillRequest,
    SplitBillResponse,
    CloseTableRequest,
    CloseTableResponse,
    RestaurantReportsResponse,
    RestaurantSettingsResponse,
    RestaurantSettingsUpdate,
)
from app.services.restaurant import RestaurantService
from app.services.kds_websocket import kds_manager

router = APIRouter(prefix="/api/v1/restaurant", tags=["Restaurant Management"])


def _format_order_response(order: RestaurantOrder) -> RestaurantOrderResponse:
    items_list = []
    for item in order.items:
        items_list.append(
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                menu_item_id=item.menu_item_id,
                menu_item_name=item.menu_item.name if item.menu_item else None,
                menu_item_category=item.menu_item.category if item.menu_item else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
                special_requests=item.special_requests,
                preparation_status=item.preparation_status,
                started_at=item.started_at,
                ready_at=item.ready_at,
                served_at=item.served_at,
                created_at=item.created_at,
            )
        )
    return RestaurantOrderResponse(
        id=order.id,
        company_id=order.company_id,
        order_number=order.order_number,
        table_id=order.table_id,
        table_number=order.table.table_number if order.table else None,
        guest_count=order.guest_count,
        status=order.status,
        opened_at=order.opened_at,
        closed_at=order.closed_at,
        subtotal=order.subtotal,
        tax=order.tax,
        service_charge=order.service_charge,
        total=order.total,
        amount_paid=order.amount_paid,
        payment_method=order.payment_method,
        notes=order.notes,
        waiter_id=order.waiter_id,
        sale_id=order.sale_id,
        items=items_list,
        splits=[
            {
                "id": s.id,
                "order_id": s.order_id,
                "split_number": s.split_number,
                "guest_name": s.guest_name,
                "amount": s.amount,
                "payment_method": s.payment_method,
                "payment_status": s.payment_status,
                "paid_at": s.paid_at,
                "created_at": s.created_at
            } for s in order.splits
        ]
    )


# =========================================================================
# WebSocket for KDS & Real-time Updates
# =========================================================================
@router.websocket("/ws/kds")
async def websocket_kds_endpoint(
    websocket: WebSocket,
    company_id: int = Query(1),
    role: str = Query("kitchen")
):
    """
    WebSocket channel for real-time kitchen display (KDS), waiter tablets, and POS floor view.
    Events: 'new_order_item', 'item_status_changed', 'table_status_changed', 'table_closed'.
    """
    await kds_manager.connect(websocket, company_id=company_id, role=role)
    try:
        while True:
            # Keep connection alive and listen for client messages/ping
            data = await websocket.receive_text()
            # Echo or process client ping
            await websocket.send_json({"event": "pong", "data": data})
    except WebSocketDisconnect:
        kds_manager.disconnect(websocket, company_id=company_id)
    except Exception:
        kds_manager.disconnect(websocket, company_id=company_id)


# =========================================================================
# Tables Endpoints
# =========================================================================
@router.get("/tables", response_model=List[TableResponse])
def list_tables(
    company_id: int = Query(1),
    status: Optional[str] = Query(None, description="Filtro de status: available, occupied, reserved, dirty"),
    location: Optional[str] = Query(None, description="Filtro de localização: indoor, outdoor, bar"),
    db: Session = Depends(get_db),
):
    """Listar todas as mesas cadastradas com status e localização."""
    service = RestaurantService(db)
    return service.list_tables(company_id=company_id, status_filter=status, location_filter=location)


@router.post("/tables", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
def create_table(
    data: TableCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Criar e cadastrar uma nova mesa."""
    service = RestaurantService(db)
    return service.create_table(data=data, company_id=company_id)


@router.get("/tables/{id}", response_model=TableResponse)
def get_table(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Obter detalhes de uma mesa por ID."""
    service = RestaurantService(db)
    return service.get_table(table_id=id, company_id=company_id)


@router.put("/tables/{id}", response_model=TableResponse)
def update_table(
    id: int,
    data: TableUpdate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar dados da mesa (número, capacidade, localização)."""
    service = RestaurantService(db)
    return service.update_table(table_id=id, data=data, company_id=company_id)


@router.put("/tables/{id}/status", response_model=TableResponse)
def update_table_status(
    id: int,
    data: TableStatusUpdate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar status da mesa (ex: marcar de dirty para available após limpeza)."""
    service = RestaurantService(db)
    return service.update_table_status(table_id=id, new_status=data.status, company_id=company_id)


@router.post("/tables/{id}/reserve", response_model=TableResponse)
def reserve_table(
    id: int,
    data: TableReserveRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Reservar uma mesa para um cliente."""
    service = RestaurantService(db)
    return service.reserve_table(
        table_id=id,
        guest_count=data.guest_count,
        reservation_time=data.reservation_time,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        company_id=company_id
    )


@router.post("/tables/release-expired-reservations")
def release_expired_reservations(
    grace_minutes: int = Query(30, description="Tolerância de atraso da reserva em minutos"),
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Liberar mesas cujas reservas expiraram e os clientes não compareceram."""
    service = RestaurantService(db)
    count = service.release_expired_reservations(company_id=company_id, grace_minutes=grace_minutes)
    return {"released_tables_count": count, "message": f"{count} mesas liberadas com sucesso."}


# =========================================================================
# Menu Items Endpoints
# =========================================================================
@router.get("/menu", response_model=List[MenuItemResponse])
def list_menu_items(
    company_id: int = Query(1),
    category: Optional[str] = Query(None, description="Filtro de categoria: appetizers, mains, sides, drinks, desserts"),
    available_only: bool = Query(False, description="Apenas itens disponíveis"),
    db: Session = Depends(get_db),
):
    """Listar cardápio com opções de filtros."""
    service = RestaurantService(db)
    return service.list_menu_items(company_id=company_id, category=category, available_only=available_only)


@router.post("/menu", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    data: MenuItemCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Criar novo prato/bebida no cardápio."""
    service = RestaurantService(db)
    return service.create_menu_item(data=data, company_id=company_id)


@router.get("/menu/{id}", response_model=MenuItemResponse)
def get_menu_item(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Obter detalhes de um item do cardápio."""
    service = RestaurantService(db)
    return service.get_menu_item(item_id=id, company_id=company_id)


@router.put("/menu/{id}", response_model=MenuItemResponse)
def update_menu_item(
    id: int,
    data: MenuItemUpdate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar informações ou disponibilidade de item do menu."""
    service = RestaurantService(db)
    return service.update_menu_item(item_id=id, data=data, company_id=company_id)


# =========================================================================
# Orders Endpoints
# =========================================================================
@router.post("/orders", response_model=RestaurantOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: RestaurantOrderCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Criar novo pedido de mesa ou takeaway."""
    service = RestaurantService(db)
    order = service.create_restaurant_order(
        table_id=data.table_id,
        guest_count=data.guest_count,
        company_id=company_id,
        waiter_id=data.waiter_id,
        notes=data.notes
    )
    return _format_order_response(order)


@router.get("/orders", response_model=List[RestaurantOrderResponse])
def list_orders(
    company_id: int = Query(1),
    status: Optional[str] = Query(None, description="Filtro de status: open, pending_payment, paid, cancelled"),
    table_id: Optional[int] = Query(None, description="Filtro por ID da mesa"),
    db: Session = Depends(get_db),
):
    """Listar pedidos ativos ou históricos."""
    service = RestaurantService(db)
    orders = service.list_orders(company_id=company_id, status_filter=status, table_id=table_id)
    return [_format_order_response(o) for o in orders]


@router.get("/orders/{id}", response_model=RestaurantOrderResponse)
def get_order(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Obter detalhes completos de um pedido."""
    service = RestaurantService(db)
    order = service.get_order(order_id=id, company_id=company_id)
    return _format_order_response(order)


@router.post("/orders/{id}/items", response_model=OrderItemResponse, status_code=status.HTTP_201_CREATED)
def add_item_to_order(
    id: int,
    data: OrderItemCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Adicionar prato/bebida ao pedido e notificar cozinha em tempo real."""
    service = RestaurantService(db)
    item = service.add_item_to_order(
        order_id=id,
        menu_item_id=data.menu_item_id,
        quantity=data.quantity,
        special_requests=data.special_requests,
        company_id=company_id
    )
    return OrderItemResponse(
        id=item.id,
        order_id=item.order_id,
        menu_item_id=item.menu_item_id,
        menu_item_name=item.menu_item.name if item.menu_item else None,
        menu_item_category=item.menu_item.category if item.menu_item else None,
        quantity=item.quantity,
        unit_price=item.unit_price,
        subtotal=item.subtotal,
        special_requests=item.special_requests,
        preparation_status=item.preparation_status,
        started_at=item.started_at,
        ready_at=item.ready_at,
        served_at=item.served_at,
        created_at=item.created_at
    )


@router.put("/order-items/{id}/status", response_model=OrderItemResponse)
def update_item_status(
    id: int,
    data: OrderItemStatusUpdate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar status de preparação do item: pending -> preparing -> ready -> served."""
    service = RestaurantService(db)
    item = service.update_item_status(order_item_id=id, status_val=data.status, company_id=company_id)
    return OrderItemResponse(
        id=item.id,
        order_id=item.order_id,
        menu_item_id=item.menu_item_id,
        menu_item_name=item.menu_item.name if item.menu_item else None,
        menu_item_category=item.menu_item.category if item.menu_item else None,
        quantity=item.quantity,
        unit_price=item.unit_price,
        subtotal=item.subtotal,
        special_requests=item.special_requests,
        preparation_status=item.preparation_status,
        started_at=item.started_at,
        ready_at=item.ready_at,
        served_at=item.served_at,
        created_at=item.created_at
    )


# =========================================================================
# Kitchen Display System (KDS) Endpoints
# =========================================================================
@router.get("/kitchen-display", response_model=KitchenDisplayResponse)
def get_kitchen_display(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Kitchen Display System (KDS): Exibe itens pendentes/em preparo com código de cores por tempo."""
    service = RestaurantService(db)
    return service.get_kitchen_display(company_id=company_id)


# =========================================================================
# Bill & Split Bill Endpoints
# =========================================================================
@router.get("/orders/{id}/bill", response_model=TableBillResponse)
def get_table_bill(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Gerar conta itemizada da mesa (subtotal, IVA 16%, taxa de serviço, total)."""
    service = RestaurantService(db)
    return service.get_table_bill(order_id=id, company_id=company_id)


@router.post("/orders/{id}/split-bill", response_model=SplitBillResponse)
def split_bill(
    id: int,
    data: SplitBillRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Dividir conta da mesa em N partes iguais ou com valores personalizados por pessoa."""
    service = RestaurantService(db)
    return service.split_bill(
        order_id=id,
        num_bills=data.num_bills,
        custom_splits=data.custom_splits,
        company_id=company_id
    )


@router.post("/orders/{id}/close", response_model=CloseTableResponse)
def close_table(
    id: int,
    data: CloseTableRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Finalizar mesa, registrar pagamento e liberar/marcar mesa para limpeza."""
    service = RestaurantService(db)
    return service.close_table(
        order_id=id,
        data=data,
        company_id=company_id,
        user_id=1
    )


# =========================================================================
# Reports & Analytics Endpoints
# =========================================================================
@router.get("/reports", response_model=RestaurantReportsResponse)
def get_restaurant_reports(
    company_id: int = Query(1),
    start_date: Optional[date] = Query(None, description="Data inicial (AAAA-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data final (AAAA-MM-DD)"),
    db: Session = Depends(get_db),
):
    """Relatórios do restaurante: horários de pico, pratos mais vendidos, tempo médio de mesa, faturamento."""
    service = RestaurantService(db)
    return service.get_restaurant_reports(
        company_id=company_id,
        start_date=start_date,
        end_date=end_date
    )


# =========================================================================
# Restaurant Settings Endpoints
# =========================================================================
@router.get("/settings", response_model=RestaurantSettingsResponse)
def get_restaurant_settings(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Obter configurações do restaurante (taxas, horários, categorias)."""
    service = RestaurantService(db)
    return service.get_or_create_settings(company_id=company_id)


@router.put("/settings", response_model=RestaurantSettingsResponse)
def update_restaurant_settings(
    data: RestaurantSettingsUpdate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar configurações do restaurante."""
    service = RestaurantService(db)
    return service.update_settings(company_id=company_id, data=data)
