import asyncio
import json
import logging
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc, extract, and_, or_

from app.models.entities import Company, Product
from app.models.restaurant import (
    Table,
    MenuItem,
    OrderItem,
    RestaurantOrder,
    OrderSplit,
    TableStatus,
    TableLocation,
    MenuCategory,
    ItemPrepStatus,
    OrderStatus,
)
from app.models.restaurant_settings import RestaurantSettings
from app.models.sale import Sale, SaleItem, Payment
from app.schemas.restaurant import (
    TableCreate,
    TableUpdate,
    TableReserveRequest,
    MenuItemCreate,
    MenuItemUpdate,
    CloseTableRequest,
    CloseTableResponse,
    KitchenDisplayItem,
    KitchenDisplayResponse,
    BillItem,
    TableBillResponse,
    SplitBillResponse,
    OrderSplitResponse,
    HourlyRevenue,
    TopDish,
    RestaurantReportsResponse,
    RestaurantSettingsUpdate,
)
from app.services.kds_websocket import kds_manager

logger = logging.getLogger(__name__)


def _dispatch_ws(coro):
    """Safely schedule an async WebSocket broadcast task if an event loop is running."""
    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            asyncio.create_task(coro)
        else:
            coro.close()
    except Exception as e:
        try:
            coro.close()
        except Exception:
            pass


class RestaurantService:
    def __init__(self, db: Session):
        self.db = db

    # =========================================================================
    # Settings Management
    # =========================================================================
    def get_or_create_settings(self, company_id: int = 1) -> RestaurantSettings:
        settings = self.db.query(RestaurantSettings).filter(
            RestaurantSettings.company_id == company_id
        ).first()
        if not settings:
            settings = RestaurantSettings(
                company_id=company_id,
                service_charge_percent=Decimal("10.00"),
                tax_percent=Decimal("16.00"),
                auto_clean_tables=False,
                operating_hours=json.dumps({
                    "monday": {"open": "08:00", "close": "23:00"},
                    "tuesday": {"open": "08:00", "close": "23:00"},
                    "wednesday": {"open": "08:00", "close": "23:00"},
                    "thursday": {"open": "08:00", "close": "23:00"},
                    "friday": {"open": "08:00", "close": "00:00"},
                    "saturday": {"open": "08:00", "close": "00:00"},
                    "sunday": {"open": "09:00", "close": "22:00"},
                }),
                menu_categories=json.dumps(["appetizers", "mains", "sides", "drinks", "desserts"]),
                urgent_prep_time_minutes=10,
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def update_settings(self, company_id: int, data: RestaurantSettingsUpdate) -> RestaurantSettings:
        settings = self.get_or_create_settings(company_id)
        if data.service_charge_percent is not None:
            settings.service_charge_percent = data.service_charge_percent
        if data.tax_percent is not None:
            settings.tax_percent = data.tax_percent
        if data.auto_clean_tables is not None:
            settings.auto_clean_tables = data.auto_clean_tables
        if data.operating_hours is not None:
            settings.operating_hours = json.dumps(data.operating_hours)
        if data.menu_categories is not None:
            settings.menu_categories = json.dumps(data.menu_categories)
        if data.urgent_prep_time_minutes is not None:
            settings.urgent_prep_time_minutes = data.urgent_prep_time_minutes

        self.db.commit()
        self.db.refresh(settings)
        return settings

    # =========================================================================
    # Tables Management
    # =========================================================================
    def list_tables(
        self,
        company_id: int = 1,
        status_filter: Optional[str] = None,
        location_filter: Optional[str] = None,
    ) -> List[Table]:
        query = self.db.query(Table).filter(
            Table.company_id == company_id,
            Table.active == True
        )
        if status_filter:
            query = query.filter(Table.status == status_filter)
        if location_filter:
            query = query.filter(Table.location == location_filter)
        return query.order_by(Table.table_number.asc()).all()

    def get_table(self, table_id: int, company_id: int = 1) -> Table:
        table = self.db.query(Table).filter(
            Table.id == table_id,
            Table.company_id == company_id
        ).first()
        if not table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mesa com ID {table_id} não encontrada."
            )
        return table

    def create_table(self, data: TableCreate, company_id: int = 1) -> Table:
        # Check if table number exists for company
        existing = self.db.query(Table).filter(
            Table.company_id == company_id,
            Table.table_number == data.table_number,
            Table.active == True
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Já existe uma mesa com o número '{data.table_number}'."
            )

        table = Table(
            company_id=company_id,
            table_number=data.table_number,
            capacity=data.capacity,
            status=TableStatus.AVAILABLE.value,
            location=data.location,
            active=True
        )
        self.db.add(table)
        self.db.commit()
        self.db.refresh(table)

        _dispatch_ws(kds_manager.notify_table_status_changed(company_id, {
            "table_id": table.id,
            "table_number": table.table_number,
            "status": table.status
        }))
        return table

    def update_table(self, table_id: int, data: TableUpdate, company_id: int = 1) -> Table:
        table = self.get_table(table_id, company_id)
        if data.table_number is not None:
            table.table_number = data.table_number
        if data.capacity is not None:
            table.capacity = data.capacity
        if data.location is not None:
            table.location = data.location
        if data.status is not None:
            table.status = data.status
        if data.active is not None:
            table.active = data.active

        self.db.commit()
        self.db.refresh(table)

        _dispatch_ws(kds_manager.notify_table_status_changed(company_id, {
            "table_id": table.id,
            "table_number": table.table_number,
            "status": table.status
        }))
        return table

    def update_table_status(self, table_id: int, new_status: str, company_id: int = 1) -> Table:
        table = self.get_table(table_id, company_id)
        table.status = new_status
        if new_status == TableStatus.AVAILABLE.value:
            table.reserved_for = None
            table.reserved_contact = None
            table.reservation_time = None

        self.db.commit()
        self.db.refresh(table)

        _dispatch_ws(kds_manager.notify_table_status_changed(company_id, {
            "table_id": table.id,
            "table_number": table.table_number,
            "status": table.status
        }))
        return table

    def reserve_table(
        self,
        table_id: int,
        guest_count: int,
        reservation_time: datetime,
        customer_name: str,
        customer_phone: Optional[str] = None,
        company_id: int = 1
    ) -> Table:
        table = self.get_table(table_id, company_id)
        if table.status == TableStatus.OCCUPIED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A mesa {table.table_number} está atualmente ocupada e não pode ser reservada."
            )

        table.status = TableStatus.RESERVED.value
        table.reserved_for = customer_name
        table.reserved_contact = customer_phone
        table.reservation_time = reservation_time

        self.db.commit()
        self.db.refresh(table)

        _dispatch_ws(kds_manager.notify_table_status_changed(company_id, {
            "table_id": table.id,
            "table_number": table.table_number,
            "status": table.status,
            "reserved_for": customer_name,
            "reservation_time": reservation_time.isoformat()
        }))
        return table

    def release_expired_reservations(self, company_id: int = 1, grace_minutes: int = 30) -> int:
        cutoff = datetime.utcnow() - timedelta(minutes=grace_minutes)
        tables = self.db.query(Table).filter(
            Table.company_id == company_id,
            Table.status == TableStatus.RESERVED.value,
            Table.reservation_time < cutoff
        ).all()

        count = len(tables)
        for t in tables:
            t.status = TableStatus.AVAILABLE.value
            t.reserved_for = None
            t.reserved_contact = None
            t.reservation_time = None
            _dispatch_ws(kds_manager.notify_table_status_changed(company_id, {
                "table_id": t.id,
                "table_number": t.table_number,
                "status": t.status,
                "expired": True
            }))

        self.db.commit()
        return count

    # =========================================================================
    # Menu Items Management
    # =========================================================================
    def list_menu_items(
        self,
        company_id: int = 1,
        category: Optional[str] = None,
        available_only: bool = False,
    ) -> List[MenuItem]:
        query = self.db.query(MenuItem).filter(
            MenuItem.company_id == company_id,
            MenuItem.active == True
        )
        if category:
            query = query.filter(MenuItem.category == category)
        if available_only:
            query = query.filter(MenuItem.available == True)
        return query.order_by(MenuItem.category.asc(), MenuItem.name.asc()).all()

    def get_menu_item(self, item_id: int, company_id: int = 1) -> MenuItem:
        item = self.db.query(MenuItem).filter(
            MenuItem.id == item_id,
            MenuItem.company_id == company_id
        ).first()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item do menu com ID {item_id} não encontrado."
            )
        return item

    def create_menu_item(self, data: MenuItemCreate, company_id: int = 1) -> MenuItem:
        item = MenuItem(
            company_id=company_id,
            product_id=data.product_id,
            name=data.name,
            description=data.description,
            category=data.category,
            price=Decimal(str(data.price)),
            preparation_time=data.preparation_time,
            image_url=data.image_url,
            dietary_info=data.dietary_info,
            available=data.available,
            active=True
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update_menu_item(self, item_id: int, data: MenuItemUpdate, company_id: int = 1) -> MenuItem:
        item = self.get_menu_item(item_id, company_id)
        if data.name is not None:
            item.name = data.name
        if data.description is not None:
            item.description = data.description
        if data.category is not None:
            item.category = data.category
        if data.price is not None:
            item.price = Decimal(str(data.price))
        if data.preparation_time is not None:
            item.preparation_time = data.preparation_time
        if data.image_url is not None:
            item.image_url = data.image_url
        if data.dietary_info is not None:
            item.dietary_info = data.dietary_info
        if data.available is not None:
            item.available = data.available
        if data.active is not None:
            item.active = data.active

        self.db.commit()
        self.db.refresh(item)
        return item

    # =========================================================================
    # Restaurant Orders Management
    # =========================================================================
    def _generate_order_number(self, company_id: int) -> str:
        count = self.db.query(RestaurantOrder).filter(
            RestaurantOrder.company_id == company_id
        ).count()
        return f"R-{(count + 1):03d}"

    def create_restaurant_order(
        self,
        table_id: Optional[int],
        guest_count: int = 1,
        company_id: int = 1,
        waiter_id: Optional[int] = None,
        notes: Optional[str] = None
    ) -> RestaurantOrder:
        table = None
        if table_id:
            table = self.get_table(table_id, company_id)
            # Check if there is already an open order for this table
            existing_open = self.db.query(RestaurantOrder).filter(
                RestaurantOrder.table_id == table_id,
                RestaurantOrder.status.in_([OrderStatus.OPEN.value, OrderStatus.PENDING_PAYMENT.value])
            ).first()
            if existing_open:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A mesa {table.table_number} já possui o pedido aberto '{existing_open.order_number}'."
                )

            table.status = TableStatus.OCCUPIED.value
            _dispatch_ws(kds_manager.notify_table_status_changed(company_id, {
                "table_id": table.id,
                "table_number": table.table_number,
                "status": table.status
            }))

        order_number = self._generate_order_number(company_id)
        order = RestaurantOrder(
            company_id=company_id,
            order_number=order_number,
            table_id=table_id,
            guest_count=guest_count,
            status=OrderStatus.OPEN.value,
            opened_at=datetime.utcnow(),
            subtotal=Decimal("0.00"),
            tax=Decimal("0.00"),
            service_charge=Decimal("0.00"),
            total=Decimal("0.00"),
            amount_paid=Decimal("0.00"),
            notes=notes,
            waiter_id=waiter_id
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_order(self, order_id: int, company_id: int = 1) -> RestaurantOrder:
        order = self.db.query(RestaurantOrder).options(
            joinedload(RestaurantOrder.items).joinedload(OrderItem.menu_item),
            joinedload(RestaurantOrder.table),
            joinedload(RestaurantOrder.splits),
        ).filter(
            RestaurantOrder.id == order_id,
            RestaurantOrder.company_id == company_id
        ).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pedido com ID {order_id} não encontrado."
            )
        return order

    def list_orders(
        self,
        company_id: int = 1,
        status_filter: Optional[str] = None,
        table_id: Optional[int] = None
    ) -> List[RestaurantOrder]:
        query = self.db.query(RestaurantOrder).options(
            joinedload(RestaurantOrder.items).joinedload(OrderItem.menu_item),
            joinedload(RestaurantOrder.table),
            joinedload(RestaurantOrder.splits),
        ).filter(RestaurantOrder.company_id == company_id)

        if status_filter:
            query = query.filter(RestaurantOrder.status == status_filter)
        if table_id:
            query = query.filter(RestaurantOrder.table_id == table_id)

        return query.order_by(RestaurantOrder.opened_at.desc()).all()

    def recalculate_order_totals(self, order: RestaurantOrder) -> RestaurantOrder:
        subtotal = Decimal("0.00")
        for item in order.items:
            subtotal += Decimal(str(item.subtotal))

        settings = self.get_or_create_settings(order.company_id)
        tax_rate = (settings.tax_percent / Decimal("100.00"))
        service_rate = (settings.service_charge_percent / Decimal("100.00"))

        tax = (subtotal * tax_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        service_charge = (subtotal * service_rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total = subtotal + tax + service_charge

        order.subtotal = subtotal
        order.tax = tax
        order.service_charge = service_charge
        order.total = total

        self.db.commit()
        self.db.refresh(order)
        return order

    def add_item_to_order(
        self,
        order_id: int,
        menu_item_id: int,
        quantity: int = 1,
        special_requests: Optional[str] = None,
        company_id: int = 1
    ) -> OrderItem:
        order = self.get_order(order_id, company_id)
        if order.status not in [OrderStatus.OPEN.value, OrderStatus.PENDING_PAYMENT.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Não é possível adicionar itens a um pedido no status '{order.status}'."
            )

        menu_item = self.get_menu_item(menu_item_id, company_id)
        if not menu_item.available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"O prato '{menu_item.name}' está indisponível na cozinha no momento."
            )

        unit_price = Decimal(str(menu_item.price))
        subtotal = (unit_price * Decimal(quantity)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
            special_requests=special_requests,
            preparation_status=ItemPrepStatus.PENDING.value,
            created_at=datetime.utcnow()
        )
        self.db.add(order_item)
        self.db.commit()
        self.db.refresh(order_item)

        # Refresh order totals
        self.recalculate_order_totals(order)

        # Broadcast event to KDS
        table_number = order.table.table_number if order.table else "Balcão"
        _dispatch_ws(kds_manager.notify_new_order_item(company_id, {
            "order_item_id": order_item.id,
            "order_id": order.id,
            "order_number": order.order_number,
            "table_number": table_number,
            "menu_item_name": menu_item.name,
            "category": menu_item.category,
            "quantity": quantity,
            "special_requests": special_requests,
            "preparation_status": order_item.preparation_status,
            "created_at": order_item.created_at.isoformat()
        }))

        return order_item

    def update_item_status(
        self,
        order_item_id: int,
        status_val: str,
        company_id: int = 1
    ) -> OrderItem:
        order_item = self.db.query(OrderItem).join(RestaurantOrder).filter(
            OrderItem.id == order_item_id,
            RestaurantOrder.company_id == company_id
        ).first()

        if not order_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item de pedido com ID {order_item_id} não encontrado."
            )

        order_item.preparation_status = status_val
        now = datetime.utcnow()

        if status_val == ItemPrepStatus.PREPARING.value and not order_item.started_at:
            order_item.started_at = now
        elif status_val == ItemPrepStatus.READY.value and not order_item.ready_at:
            order_item.ready_at = now
        elif status_val == ItemPrepStatus.SERVED.value and not order_item.served_at:
            order_item.served_at = now

        self.db.commit()
        self.db.refresh(order_item)

        table_number = order_item.order.table.table_number if order_item.order.table else "Balcão"
        _dispatch_ws(kds_manager.notify_item_status_changed(company_id, {
            "order_item_id": order_item.id,
            "order_id": order_item.order_id,
            "order_number": order_item.order.order_number,
            "table_number": table_number,
            "menu_item_name": order_item.menu_item.name if order_item.menu_item else "",
            "preparation_status": order_item.preparation_status,
            "started_at": order_item.started_at.isoformat() if order_item.started_at else None,
            "ready_at": order_item.ready_at.isoformat() if order_item.ready_at else None,
            "served_at": order_item.served_at.isoformat() if order_item.served_at else None,
        }))

        return order_item

    # =========================================================================
    # Kitchen Display System (KDS)
    # =========================================================================
    def get_kitchen_display(self, company_id: int = 1) -> KitchenDisplayResponse:
        settings = self.get_or_create_settings(company_id)
        urgent_threshold = settings.urgent_prep_time_minutes

        items = self.db.query(OrderItem).join(RestaurantOrder).options(
            joinedload(OrderItem.menu_item),
            joinedload(OrderItem.order).joinedload(RestaurantOrder.table)
        ).filter(
            RestaurantOrder.company_id == company_id,
            RestaurantOrder.status.in_([OrderStatus.OPEN.value, OrderStatus.PENDING_PAYMENT.value]),
            OrderItem.preparation_status.in_([
                ItemPrepStatus.PENDING.value,
                ItemPrepStatus.PREPARING.value,
                ItemPrepStatus.READY.value
            ])
        ).order_by(OrderItem.created_at.asc()).all()

        kds_items: List[KitchenDisplayItem] = []
        total_pending = 0
        total_preparing = 0
        total_ready = 0
        wait_times: List[int] = []

        now = datetime.utcnow()

        for item in items:
            # Calculate elapsed time in minutes
            created_at = item.created_at or now
            if created_at.tzinfo is not None:
                created_at_naive = created_at.replace(tzinfo=None)
            else:
                created_at_naive = created_at
            
            elapsed_sec = (now - created_at_naive).total_seconds()
            elapsed_minutes = max(0, int(elapsed_sec // 60))
            wait_times.append(elapsed_minutes)

            # Assign color code
            if elapsed_minutes >= urgent_threshold:
                urgency_color = "red"  # Urgente > 10 min
            elif elapsed_minutes >= 5:
                urgency_color = "yellow"  # Normal / aviso 5-10 min
            else:
                urgency_color = "green"  # Novo < 5 min

            if item.preparation_status == ItemPrepStatus.PENDING.value:
                total_pending += 1
            elif item.preparation_status == ItemPrepStatus.PREPARING.value:
                total_preparing += 1
            elif item.preparation_status == ItemPrepStatus.READY.value:
                total_ready += 1

            table_num = item.order.table.table_number if item.order.table else "Balcão"
            kds_items.append(
                KitchenDisplayItem(
                    order_item_id=item.id,
                    order_id=item.order_id,
                    order_number=item.order.order_number,
                    table_id=item.order.table_id,
                    table_number=table_num,
                    menu_item_id=item.menu_item_id,
                    menu_item_name=item.menu_item.name if item.menu_item else "Item",
                    category=item.menu_item.category if item.menu_item else "mains",
                    quantity=item.quantity,
                    special_requests=item.special_requests,
                    preparation_status=item.preparation_status,
                    elapsed_minutes=elapsed_minutes,
                    urgency_color=urgency_color,
                    started_at=item.started_at,
                    created_at=item.created_at
                )
            )

        avg_wait = float(sum(wait_times) / len(wait_times)) if wait_times else 0.0

        return KitchenDisplayResponse(
            items=kds_items,
            total_pending=total_pending,
            total_preparing=total_preparing,
            total_ready=total_ready,
            average_wait_time_minutes=round(avg_wait, 1)
        )

    # =========================================================================
    # Bill & Split Bill
    # =========================================================================
    def get_table_bill(self, order_id: int, company_id: int = 1) -> TableBillResponse:
        order = self.get_order(order_id, company_id)
        settings = self.get_or_create_settings(company_id)

        bill_items: List[BillItem] = []
        for item in order.items:
            bill_items.append(
                BillItem(
                    id=item.id,
                    menu_item_name=item.menu_item.name if item.menu_item else "Item",
                    category=item.menu_item.category if item.menu_item else "mains",
                    quantity=item.quantity,
                    unit_price=Decimal(str(item.unit_price)),
                    subtotal=Decimal(str(item.subtotal)),
                    special_requests=item.special_requests,
                    preparation_status=item.preparation_status
                )
            )

        remaining_balance = max(Decimal("0.00"), order.total - order.amount_paid)

        return TableBillResponse(
            order_id=order.id,
            order_number=order.order_number,
            table_id=order.table_id,
            table_number=order.table.table_number if order.table else "Balcão",
            guest_count=order.guest_count,
            opened_at=order.opened_at,
            items=bill_items,
            subtotal=Decimal(str(order.subtotal)),
            tax_percent=Decimal(str(settings.tax_percent)),
            tax_amount=Decimal(str(order.tax)),
            service_charge_percent=Decimal(str(settings.service_charge_percent)),
            service_charge_amount=Decimal(str(order.service_charge)),
            total=Decimal(str(order.total)),
            amount_paid=Decimal(str(order.amount_paid)),
            remaining_balance=remaining_balance,
            is_paid=(order.status == OrderStatus.PAID.value)
        )

    def split_bill(
        self,
        order_id: int,
        num_bills: Optional[int] = None,
        custom_splits: Optional[List[Dict[str, Any]]] = None,
        company_id: int = 1
    ) -> SplitBillResponse:
        order = self.get_order(order_id, company_id)
        total = Decimal(str(order.total))

        if total <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O pedido não possui valor para divisão."
            )

        # Clear existing splits
        self.db.query(OrderSplit).filter(OrderSplit.order_id == order.id).delete()

        splits_created: List[OrderSplit] = []

        if num_bills:
            if num_bills < 1:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Número de divisões inválido.")
            
            # Equal division with cent balancing
            base_split = (total / Decimal(num_bills)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            allocated_so_far = Decimal("0.00")

            for i in range(1, num_bills + 1):
                if i == num_bills:
                    split_amt = total - allocated_so_far
                else:
                    split_amt = base_split
                    allocated_so_far += split_amt

                split_obj = OrderSplit(
                    order_id=order.id,
                    split_number=i,
                    guest_name=f"Pessoa {i}",
                    amount=split_amt,
                    payment_status="pending",
                    created_at=datetime.utcnow()
                )
                self.db.add(split_obj)
                splits_created.append(split_obj)

        elif custom_splits:
            allocated_sum = Decimal("0.00")
            for idx, item in enumerate(custom_splits, start=1):
                amt = Decimal(str(item.get("amount", 0))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                name = item.get("guest_name", f"Pessoa {idx}")
                method = item.get("payment_method")

                split_obj = OrderSplit(
                    order_id=order.id,
                    split_number=idx,
                    guest_name=name,
                    amount=amt,
                    payment_method=method,
                    payment_status="pending",
                    created_at=datetime.utcnow()
                )
                self.db.add(split_obj)
                splits_created.append(split_obj)
                allocated_sum += amt

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Especifique 'num_bills' ou 'custom_splits' para dividir a conta."
            )

        self.db.commit()

        total_allocated = sum(s.amount for s in splits_created)
        remaining = total - total_allocated

        return SplitBillResponse(
            order_id=order.id,
            order_number=order.order_number,
            total_order_amount=total,
            num_splits=len(splits_created),
            splits=[
                OrderSplitResponse(
                    id=s.id,
                    order_id=s.order_id,
                    split_number=s.split_number,
                    guest_name=s.guest_name,
                    amount=s.amount,
                    payment_method=s.payment_method,
                    payment_status=s.payment_status,
                    paid_at=s.paid_at,
                    created_at=s.created_at
                ) for s in splits_created
            ],
            total_allocated=total_allocated,
            remaining_to_allocate=remaining
        )

    # =========================================================================
    # Close Table & Payments
    # =========================================================================
    def close_table(
        self,
        order_id: int,
        data: CloseTableRequest,
        company_id: int = 1,
        user_id: Optional[int] = 1
    ) -> CloseTableResponse:
        order = self.get_order(order_id, company_id)

        if order.status == OrderStatus.PAID.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"O pedido '{order.order_number}' já foi pago e fechado."
            )

        total_amount = Decimal(str(order.total))
        amount_paid = Decimal(str(data.amount_paid)) if data.amount_paid is not None else total_amount

        if amount_paid < total_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Valor pago ({amount_paid} MZN) é inferior ao total da conta ({total_amount} MZN)."
            )

        change = amount_paid - total_amount
        now = datetime.utcnow()

        order.status = OrderStatus.PAID.value
        order.closed_at = now
        order.payment_method = data.payment_method
        order.amount_paid = amount_paid
        if data.notes:
            order.notes = (order.notes or "") + f" [Fechamento: {data.notes}]"

        # Update table status
        table_status_result = None
        if order.table:
            settings = self.get_or_create_settings(company_id)
            auto_clean = data.auto_clean if data.auto_clean is not None else settings.auto_clean_tables

            if auto_clean:
                order.table.status = TableStatus.AVAILABLE.value
            else:
                order.table.status = TableStatus.DIRTY.value

            order.table.reserved_for = None
            order.table.reserved_contact = None
            order.table.reservation_time = None
            table_status_result = order.table.status

            _dispatch_ws(kds_manager.notify_table_status_changed(company_id, {
                "table_id": order.table.id,
                "table_number": order.table.table_number,
                "status": order.table.status
            }))

        # Notify real-time table closed
        _dispatch_ws(kds_manager.notify_table_closed(company_id, {
            "order_id": order.id,
            "order_number": order.order_number,
            "table_number": order.table.table_number if order.table else "Balcão",
            "total": str(total_amount),
            "payment_method": data.payment_method,
            "closed_at": now.isoformat()
        }))

        # Mark all pending splits as paid if existing
        for split in order.splits:
            if split.payment_status == "pending":
                split.payment_status = "paid"
                split.paid_at = now
                if not split.payment_method:
                    split.payment_method = data.payment_method

        # Optional integration: Create TiConta Sale record for unified accounting/reporting
        try:
            sale = Sale(
                company_id=company_id,
                user_id=user_id or 1,
                invoice_number=f"INV-REST-{order.order_number}",
                total_amount=total_amount,
                tax_amount=order.tax,
                discount_amount=Decimal("0.00"),
                net_amount=order.subtotal + order.service_charge,
                payment_method=data.payment_method,
                payment_status="completed",
                sale_date=now
            )
            self.db.add(sale)
            self.db.flush()
            order.sale_id = sale.id
        except Exception as e:
            logger.warning(f"TiConta Sale linkage warning: {e}")

        self.db.commit()
        self.db.refresh(order)

        return CloseTableResponse(
            order_id=order.id,
            order_number=order.order_number,
            status=order.status,
            total=total_amount,
            amount_paid=amount_paid,
            change=change,
            payment_method=data.payment_method,
            closed_at=now,
            table_status=table_status_result,
            message="Mesa finalizada com sucesso!"
        )

    # =========================================================================
    # Reports & Analytics (Peak Hours, Top Dishes, Average Table Time, Revenue)
    # =========================================================================
    def get_restaurant_reports(
        self,
        company_id: int = 1,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> RestaurantReportsResponse:
        query = self.db.query(RestaurantOrder).filter(
            RestaurantOrder.company_id == company_id,
            RestaurantOrder.status == OrderStatus.PAID.value
        )

        if start_date:
            query = query.filter(RestaurantOrder.opened_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            query = query.filter(RestaurantOrder.opened_at <= datetime.combine(end_date, datetime.max.time()))

        paid_orders = query.all()

        total_orders = len(paid_orders)
        total_revenue = sum((Decimal(str(o.total)) for o in paid_orders), Decimal("0.00"))
        avg_order_val = (total_revenue / Decimal(total_orders)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) if total_orders > 0 else Decimal("0.00")

        # Calculate average table turnover time in minutes
        durations = []
        for o in paid_orders:
            if o.opened_at and o.closed_at:
                dur = (o.closed_at - o.opened_at).total_seconds() / 60.0
                if dur >= 0:
                    durations.append(dur)
        avg_table_time = float(sum(durations) / len(durations)) if durations else 0.0

        # Hourly breakdown (0 - 23)
        hourly_counts: Dict[int, int] = {h: 0 for h in range(24)}
        hourly_revenue: Dict[int, Decimal] = {h: Decimal("0.00") for h in range(24)}

        for o in paid_orders:
            h = o.opened_at.hour if o.opened_at else 0
            hourly_counts[h] += 1
            hourly_revenue[h] += Decimal(str(o.total))

        peak_hours_list: List[HourlyRevenue] = []
        for h in range(24):
            peak_hours_list.append(
                HourlyRevenue(
                    hour=h,
                    hour_label=f"{h:02d}:00 - {h+1:02d}:00" if h < 23 else "23:00 - 00:00",
                    order_count=hourly_counts[h],
                    revenue=hourly_revenue[h]
                )
            )

        # Top dishes and category revenue
        dish_stats: Dict[int, Dict[str, Any]] = {}
        category_revenue: Dict[str, Decimal] = {}

        for o in paid_orders:
            for item in o.items:
                mid = item.menu_item_id
                mname = item.menu_item.name if item.menu_item else f"Item #{mid}"
                mcat = item.menu_item.category if item.menu_item else "mains"
                subtot = Decimal(str(item.subtotal))
                qty = item.quantity

                if mid not in dish_stats:
                    dish_stats[mid] = {
                        "id": mid,
                        "name": mname,
                        "category": mcat,
                        "quantity": 0,
                        "revenue": Decimal("0.00")
                    }
                dish_stats[mid]["quantity"] += qty
                dish_stats[mid]["revenue"] += subtot

                category_revenue[mcat] = category_revenue.get(mcat, Decimal("0.00")) + subtot

        sorted_dishes = sorted(dish_stats.values(), key=lambda x: x["quantity"], reverse=True)
        top_dishes = [
            TopDish(
                menu_item_id=d["id"],
                name=d["name"],
                category=d["category"],
                quantity_sold=d["quantity"],
                total_revenue=d["revenue"]
            )
            for d in sorted_dishes[:10]
        ]

        return RestaurantReportsResponse(
            company_id=company_id,
            start_date=start_date,
            end_date=end_date,
            total_orders=total_orders,
            total_revenue=total_revenue,
            average_order_value=avg_order_val,
            average_table_time_minutes=round(avg_table_time, 1),
            peak_hours=peak_hours_list,
            top_dishes=top_dishes,
            revenue_by_category=category_revenue
        )
