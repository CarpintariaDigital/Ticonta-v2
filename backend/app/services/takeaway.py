import logging
import secrets
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, and_, or_

from app.models.takeaway import (
    TakeawayOrder,
    TakeawayOrderItem,
    TakeawayOrderType,
    TakeawayOrderStatus,
)
from app.models.delivery import Delivery, DeliveryStatus
from app.models.restaurant import MenuItem
from app.notifications.takeaway_updates import takeaway_notification_service
from app.schemas.takeaway import (
    TakeawayOrderCreate,
    TakeawayOrderResponse,
    DeliveryAssignRequest,
    DeliveryStatusUpdateRequest,
    OrderStatusUpdateRequest,
    OrderTrackingResponse,
    OrderTrackingStep,
    TakeawayStatsResponse,
)

logger = logging.getLogger(__name__)


class TakeawayService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_order_number(self, company_id: int = 1) -> str:
        """Gera código sequencial amigável T-001, T-002... para encomendas."""
        today_start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
        count = self.db.query(func.count(TakeawayOrder.id)).filter(
            TakeawayOrder.company_id == company_id,
            TakeawayOrder.created_at >= today_start
        ).scalar() or 0
        return f"T-{str(count + 1).zfill(3)}"

    # =========================================================================
    # Orders Management
    # =========================================================================
    def create_takeaway_order(
        self,
        data: TakeawayOrderCreate,
        company_id: int = 1
    ) -> TakeawayOrder:
        order_type = data.order_type.lower()
        if order_type not in [TakeawayOrderType.TAKEAWAY.value, TakeawayOrderType.DELIVERY.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de pedido inválido. Use 'takeaway' ou 'delivery'."
            )

        if order_type == TakeawayOrderType.DELIVERY.value and not data.delivery_address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Endereço de entrega é obrigatório para pedidos do tipo Delivery."
            )

        # 1. Calculate Items Subtotal & Prep ETA
        subtotal = Decimal("0.00")
        max_prep_time = 20

        for it in data.items:
            qty = Decimal(str(it.quantity))
            price = Decimal(str(it.unit_price))
            item_sub = (qty * price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            subtotal += item_sub

            if it.menu_item_id:
                menu_item = self.db.query(MenuItem).filter(MenuItem.id == it.menu_item_id).first()
                if menu_item and menu_item.preparation_time:
                    max_prep_time = max(max_prep_time, menu_item.preparation_time)

        delivery_fee = Decimal(str(data.delivery_fee or 0.00)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if order_type == TakeawayOrderType.DELIVERY.value and delivery_fee == Decimal("0.00"):
            delivery_fee = Decimal("150.00")  # Taxa padrão em Maputo/Matola

        tax = (subtotal * Decimal("0.16")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total = subtotal + delivery_fee

        now = datetime.utcnow()
        order_num = self._generate_order_number(company_id=company_id)
        est_ready_at = now + timedelta(minutes=max_prep_time)

        # 2. Create Order Record
        order = TakeawayOrder(
            company_id=company_id,
            order_number=order_num,
            customer_name=data.customer_name.strip(),
            customer_phone=data.customer_phone.strip(),
            order_type=order_type,
            status=TakeawayOrderStatus.PENDING.value,
            delivery_address=data.delivery_address.strip() if data.delivery_address else None,
            delivery_time=data.delivery_time,
            special_instructions=data.special_instructions,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            tax=tax,
            total=total,
            payment_method=data.payment_method,
            payment_status=data.payment_status,
            estimated_prep_minutes=max_prep_time,
            estimated_delivery_minutes=15 if order_type == TakeawayOrderType.DELIVERY.value else 0,
            estimated_ready_at=est_ready_at,
            created_at=now
        )
        self.db.add(order)
        self.db.flush()

        # 3. Create Order Items
        for it in data.items:
            qty = it.quantity
            price = Decimal(str(it.unit_price))
            item_sub = (Decimal(str(qty)) * price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            order_item = TakeawayOrderItem(
                takeaway_order_id=order.id,
                menu_item_id=it.menu_item_id,
                item_name=it.item_name.strip(),
                quantity=qty,
                unit_price=price,
                subtotal=item_sub,
                special_requests=it.special_requests,
                preparation_status="pending",
                created_at=now
            )
            self.db.add(order_item)

        # 4. If Delivery, create Delivery record with unique tracking code
        if order_type == TakeawayOrderType.DELIVERY.value:
            tracking_code = f"TC-{secrets.token_hex(4).upper()}"
            est_delivery_time = est_ready_at + timedelta(minutes=order.estimated_delivery_minutes)

            delivery = Delivery(
                company_id=company_id,
                order_id=order.id,
                delivery_address=data.delivery_address.strip(),
                delivery_phone=data.customer_phone.strip(),
                estimated_delivery_time=est_delivery_time,
                delivery_fee=delivery_fee,
                delivery_status=DeliveryStatus.PENDING.value,
                tracking_code=tracking_code,
                notes=data.special_instructions,
                created_at=now
            )
            self.db.add(delivery)

        self.db.commit()
        self.db.refresh(order)

        # 5. Dispatch Confirmation Notification
        try:
            takeaway_notification_service.send_order_update(
                order=order,
                event="order_confirmed"
            )
        except Exception as e:
            logger.error(f"Erro ao enviar notificação de pedido confirmado: {e}")

        return self.get_order(order.id, company_id=company_id)

    def get_order(self, order_id: int, company_id: int = 1) -> TakeawayOrder:
        order = self.db.query(TakeawayOrder).options(
            joinedload(TakeawayOrder.items),
            joinedload(TakeawayOrder.delivery)
        ).filter(
            TakeawayOrder.id == order_id,
            TakeawayOrder.company_id == company_id
        ).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido de Takeaway com ID {order_id} não encontrado."
            )
        return order

    def list_orders(
        self,
        company_id: int = 1,
        status_filter: Optional[str] = None,
        order_type: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[TakeawayOrder]:
        query = self.db.query(TakeawayOrder).options(
            joinedload(TakeawayOrder.items),
            joinedload(TakeawayOrder.delivery)
        ).filter(TakeawayOrder.company_id == company_id)

        if status_filter:
            query = query.filter(TakeawayOrder.status == status_filter)
        if order_type:
            query = query.filter(TakeawayOrder.order_type == order_type)
        if search:
            query = query.filter(
                or_(
                    TakeawayOrder.order_number.ilike(f"%{search}%"),
                    TakeawayOrder.customer_name.ilike(f"%{search}%"),
                    TakeawayOrder.customer_phone.ilike(f"%{search}%"),
                )
            )

        return query.order_by(TakeawayOrder.created_at.desc()).all()

    # =========================================================================
    # Status & Delivery Tracking
    # =========================================================================
    def update_order_status(
        self,
        order_id: int,
        data: OrderStatusUpdateRequest,
        company_id: int = 1
    ) -> TakeawayOrder:
        order = self.get_order(order_id, company_id)
        new_status = data.status.lower()
        now = datetime.utcnow()

        order.status = new_status

        if new_status == TakeawayOrderStatus.READY.value:
            order.ready_at = now
            for it in order.items:
                it.preparation_status = "ready"
            if order.delivery:
                order.delivery.delivery_status = DeliveryStatus.ASSIGNED.value if order.delivery.delivery_person_name else DeliveryStatus.PENDING.value

            takeaway_notification_service.send_order_update(order=order, event="order_ready")

        elif new_status == TakeawayOrderStatus.IN_TRANSIT.value:
            if order.delivery:
                order.delivery.delivery_status = DeliveryStatus.IN_TRANSIT.value
            takeaway_notification_service.send_order_update(order=order, event="in_transit")

        elif new_status in [TakeawayOrderStatus.DELIVERED.value, TakeawayOrderStatus.PICKED_UP.value]:
            order.pickup_at = now
            if order.delivery:
                order.delivery.delivery_status = DeliveryStatus.DELIVERED.value
                order.delivery.actual_delivery_time = now
            takeaway_notification_service.send_order_update(order=order, event="delivered")

        elif new_status == TakeawayOrderStatus.CANCELLED.value:
            if order.delivery:
                order.delivery.delivery_status = DeliveryStatus.CANCELLED.value
            takeaway_notification_service.send_order_update(order=order, event="cancelled")

        self.db.commit()
        self.db.refresh(order)
        return order

    def assign_delivery(
        self,
        order_id: int,
        data: DeliveryAssignRequest,
        company_id: int = 1
    ) -> TakeawayOrder:
        """Atribui motorista/estafeta a uma encomenda e notifica o cliente."""
        order = self.get_order(order_id, company_id)
        if order.order_type != TakeawayOrderType.DELIVERY.value or not order.delivery:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este pedido não é do tipo Delivery."
            )

        now = datetime.utcnow()
        delivery = order.delivery
        delivery.delivery_person_id = data.delivery_person_id
        delivery.delivery_person_name = data.delivery_person_name.strip()
        delivery.delivery_person_phone = data.delivery_person_phone.strip() if data.delivery_person_phone else None
        delivery.delivery_status = DeliveryStatus.ASSIGNED.value
        
        est_min = data.estimated_minutes or 15
        order.estimated_delivery_minutes = est_min
        delivery.estimated_delivery_time = now + timedelta(minutes=est_min)

        # If order is already ready or preparing, transition to in_transit
        if order.status in [TakeawayOrderStatus.READY.value, TakeawayOrderStatus.PREPARING.value]:
            order.status = TakeawayOrderStatus.IN_TRANSIT.value
            delivery.delivery_status = DeliveryStatus.IN_TRANSIT.value

        self.db.commit()
        self.db.refresh(order)

        # Notify Customer
        try:
            takeaway_notification_service.send_order_update(
                order=order,
                event="in_transit"
            )
        except Exception as e:
            logger.error(f"Erro ao enviar notificação de entrega: {e}")

        return order

    def update_delivery_status(
        self,
        order_id: int,
        data: DeliveryStatusUpdateRequest,
        company_id: int = 1
    ) -> TakeawayOrder:
        order = self.get_order(order_id, company_id)
        if not order.delivery:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pedido não possui registo de entrega."
            )

        now = datetime.utcnow()
        d_status = data.delivery_status.lower()
        order.delivery.delivery_status = d_status
        if data.notes:
            order.delivery.notes = data.notes

        if d_status == DeliveryStatus.DELIVERED.value:
            order.status = TakeawayOrderStatus.DELIVERED.value
            order.pickup_at = now
            order.delivery.actual_delivery_time = now
            takeaway_notification_service.send_order_update(order=order, event="delivered")

        elif d_status == DeliveryStatus.IN_TRANSIT.value:
            order.status = TakeawayOrderStatus.IN_TRANSIT.value
            takeaway_notification_service.send_order_update(order=order, event="in_transit")

        elif d_status == DeliveryStatus.FAILED.value:
            order.status = TakeawayOrderStatus.PENDING.value

        self.db.commit()
        self.db.refresh(order)
        return order

    def track_order(self, order_id_or_code: str, company_id: int = 1) -> OrderTrackingResponse:
        """Rastreio de pedido em tempo real por ID ou código de rastreio (ex: TC-A1B2)."""
        query = self.db.query(TakeawayOrder).options(
            joinedload(TakeawayOrder.items),
            joinedload(TakeawayOrder.delivery)
        ).filter(TakeawayOrder.company_id == company_id)

        if order_id_or_code.isdigit():
            order = query.filter(TakeawayOrder.id == int(order_id_or_code)).first()
        else:
            order = query.join(Delivery).filter(Delivery.tracking_code == order_id_or_code.strip()).first()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Código ou ID de encomenda não encontrado."
            )

        # Build visual tracking steps
        is_delivery = order.order_type == TakeawayOrderType.DELIVERY.value
        current = order.status

        # Step 1: Confirmed
        s1_status = "completed"
        # Step 2: Preparing
        s2_status = (
            "completed"
            if current in [TakeawayOrderStatus.READY.value, TakeawayOrderStatus.IN_TRANSIT.value, TakeawayOrderStatus.DELIVERED.value, TakeawayOrderStatus.PICKED_UP.value]
            else ("current" if current == TakeawayOrderStatus.PREPARING.value else "upcoming")
        )
        # Step 3: Ready / In Transit
        s3_status = (
            "completed"
            if current in [TakeawayOrderStatus.DELIVERED.value, TakeawayOrderStatus.PICKED_UP.value]
            else ("current" if current in [TakeawayOrderStatus.READY.value, TakeawayOrderStatus.IN_TRANSIT.value] else "upcoming")
        )
        # Step 4: Completed
        s4_status = "completed" if current in [TakeawayOrderStatus.DELIVERED.value, TakeawayOrderStatus.PICKED_UP.value] else "upcoming"

        steps = [
            OrderTrackingStep(
                step_number=1,
                label="Pedido Confirmado",
                status=s1_status,
                timestamp=order.created_at
            ),
            OrderTrackingStep(
                step_number=2,
                label="Em Preparação na Cozinha",
                status=s2_status,
                timestamp=order.created_at + timedelta(minutes=5) if s2_status != "upcoming" else None
            ),
            OrderTrackingStep(
                step_number=3,
                label="Saiu para Entrega (Estafeta)" if is_delivery else "Pronto para Levantamento no Balcão",
                status=s3_status,
                timestamp=order.ready_at
            ),
            OrderTrackingStep(
                step_number=4,
                label="Entregue com Sucesso" if is_delivery else "Pedido Retirado",
                status=s4_status,
                timestamp=order.pickup_at
            ),
        ]

        items_summary = [f"{it.quantity}x {it.item_name}" for it in order.items]
        total_eta = order.estimated_prep_minutes + (order.estimated_delivery_minutes if is_delivery else 0)

        return OrderTrackingResponse(
            order_id=order.id,
            order_number=order.order_number,
            customer_name=order.customer_name,
            customer_phone=order.customer_phone,
            order_type=order.order_type,
            current_status=order.status,
            tracking_code=order.delivery.tracking_code if order.delivery else None,
            estimated_ready_time=order.estimated_ready_at,
            estimated_delivery_time=order.delivery.estimated_delivery_time if order.delivery else None,
            total_estimated_minutes=total_eta,
            delivery_person_name=order.delivery.delivery_person_name if order.delivery else None,
            delivery_person_phone=order.delivery.delivery_person_phone if order.delivery else None,
            delivery_address=order.delivery_address,
            steps=steps,
            items_summary=items_summary,
            total_amount=order.total
        )

    # =========================================================================
    # Pending Deliveries & Daily Stats
    # =========================================================================
    def get_pending_deliveries(self, company_id: int = 1) -> List[TakeawayOrder]:
        """Lista todas as entregas ativas do dia que requerem atenção ou despacho."""
        return self.db.query(TakeawayOrder).options(
            joinedload(TakeawayOrder.items),
            joinedload(TakeawayOrder.delivery)
        ).filter(
            TakeawayOrder.company_id == company_id,
            TakeawayOrder.order_type == TakeawayOrderType.DELIVERY.value,
            TakeawayOrder.status.in_([
                TakeawayOrderStatus.PENDING.value,
                TakeawayOrderStatus.PREPARING.value,
                TakeawayOrderStatus.READY.value,
                TakeawayOrderStatus.IN_TRANSIT.value
            ])
        ).order_by(TakeawayOrder.created_at.asc()).all()

    def get_takeaway_stats(self, company_id: int = 1) -> TakeawayStatsResponse:
        today_start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
        orders = self.db.query(TakeawayOrder).filter(
            TakeawayOrder.company_id == company_id,
            TakeawayOrder.created_at >= today_start
        ).all()

        total_orders = len(orders)
        takeaway_count = sum(1 for o in orders if o.order_type == TakeawayOrderType.TAKEAWAY.value)
        delivery_count = sum(1 for o in orders if o.order_type == TakeawayOrderType.DELIVERY.value)
        pending_count = sum(1 for o in orders if o.status == TakeawayOrderStatus.PENDING.value)
        preparing_count = sum(1 for o in orders if o.status == TakeawayOrderStatus.PREPARING.value)
        ready_count = sum(1 for o in orders if o.status == TakeawayOrderStatus.READY.value)
        in_transit_count = sum(1 for o in orders if o.status == TakeawayOrderStatus.IN_TRANSIT.value)
        completed_today = sum(1 for o in orders if o.status in [TakeawayOrderStatus.DELIVERED.value, TakeawayOrderStatus.PICKED_UP.value])
        
        total_rev = sum((Decimal(str(o.total)) for o in orders if o.status != TakeawayOrderStatus.CANCELLED.value), Decimal("0.00"))
        avg_prep = int(sum((o.estimated_prep_minutes for o in orders)) / total_orders) if total_orders > 0 else 25

        return TakeawayStatsResponse(
            company_id=company_id,
            total_orders_today=total_orders,
            takeaway_count=takeaway_count,
            delivery_count=delivery_count,
            pending_count=pending_count,
            preparing_count=preparing_count,
            ready_count=ready_count,
            in_transit_count=in_transit_count,
            completed_today=completed_today,
            total_revenue_today=total_rev,
            average_prep_time_minutes=avg_prep
        )
