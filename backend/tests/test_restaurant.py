import json
from datetime import datetime, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from app.models.restaurant import Table, MenuItem, OrderItem, RestaurantOrder, TableStatus, ItemPrepStatus, OrderStatus
from app.models.restaurant_settings import RestaurantSettings
from app.services.restaurant import RestaurantService


def test_table_lifecycle_and_reservation(client: TestClient, db_session):
    """Test table creation, status transitions, reservation, and expiration."""
    # 1. Create table
    res = client.post("/api/v1/restaurant/tables", json={
        "table_number": "01",
        "capacity": 4,
        "location": "indoor"
    })
    assert res.status_code == 201
    table_data = res.json()
    assert table_data["table_number"] == "01"
    assert table_data["status"] == "available"
    table_id = table_data["id"]

    # 2. Duplicate table_number should fail
    dup_res = client.post("/api/v1/restaurant/tables", json={
        "table_number": "01",
        "capacity": 2,
        "location": "outdoor"
    })
    assert dup_res.status_code == 400

    # 3. List tables with filter
    list_res = client.get("/api/v1/restaurant/tables?status=available&location=indoor")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Reserve table
    res_time = (datetime.utcnow() + timedelta(hours=2)).isoformat()
    reserve_res = client.post(f"/api/v1/restaurant/tables/{table_id}/reserve", json={
        "guest_count": 4,
        "reservation_time": res_time,
        "customer_name": "Dr. Carlos Mondlane",
        "customer_phone": "+258849991122"
    })
    assert reserve_res.status_code == 200
    assert reserve_res.json()["status"] == "reserved"
    assert reserve_res.json()["reserved_for"] == "Dr. Carlos Mondlane"

    # 5. Update status back to available
    status_res = client.put(f"/api/v1/restaurant/tables/{table_id}/status", json={"status": "available"})
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "available"
    assert status_res.json()["reserved_for"] is None


def test_menu_items_management(client: TestClient, db_session):
    """Test creating and managing menu items with categories and availability."""
    # Create Matapa
    res1 = client.post("/api/v1/restaurant/menu", json={
        "name": "Matapa com Camarão e Arroz",
        "description": "Prato tradicional moçambicano à base de folhas de mandioca e leite de coco",
        "category": "mains",
        "price": 650.00,
        "preparation_time": 20,
        "dietary_info": "halal, gluten-free",
        "available": True
    })
    assert res1.status_code == 201
    item1 = res1.json()
    assert item1["name"] == "Matapa com Camarão e Arroz"
    assert float(item1["price"]) == 650.00

    # Create Peri-peri Chicken
    res2 = client.post("/api/v1/restaurant/menu", json={
        "name": "Frango à Zambeziana com Peri-Peri",
        "description": "Frango grelhado marinado com limão e piripíri autêntico",
        "category": "mains",
        "price": 550.00,
        "preparation_time": 25,
        "dietary_info": "spicy",
        "available": True
    })
    assert res2.status_code == 201
    item2 = res2.json()

    # Create 2M Beer
    res3 = client.post("/api/v1/restaurant/menu", json={
        "name": "Cerveja 2M 330ml",
        "category": "drinks",
        "price": 120.00,
        "preparation_time": 2,
        "available": True
    })
    assert res3.status_code == 201

    # Filter menu by category
    drinks_res = client.get("/api/v1/restaurant/menu?category=drinks")
    assert drinks_res.status_code == 200
    assert len(drinks_res.json()) == 1
    assert drinks_res.json()[0]["name"] == "Cerveja 2M 330ml"

    # Mark item as unavailable
    update_res = client.put(f"/api/v1/restaurant/menu/{item2['id']}", json={"available": False})
    assert update_res.status_code == 200
    assert update_res.json()["available"] is False

    # List only available items
    avail_res = client.get("/api/v1/restaurant/menu?available_only=true")
    assert avail_res.status_code == 200
    names = [i["name"] for i in avail_res.json()]
    assert "Matapa com Camarão e Arroz" in names
    assert "Frango à Zambeziana com Peri-Peri" not in names


def test_complete_order_flow_create_items_bill_close(client: TestClient, db_session):
    """
    Test full order workflow:
    1. Create Table & Menu Items
    2. Open Table Order (verifying table marks as occupied)
    3. Add Items with Special Requests
    4. Kitchen preparation & KDS status updates
    5. Generate itemized Bill
    6. Close Table with Payment & verify Table marked as Dirty
    """
    # 1. Create Table
    t_res = client.post("/api/v1/restaurant/tables", json={
        "table_number": "05",
        "capacity": 6,
        "location": "outdoor"
    })
    table_id = t_res.json()["id"]

    # Create Menu Items
    m1 = client.post("/api/v1/restaurant/menu", json={
        "name": "Camarão Tigre Grelhado",
        "category": "mains",
        "price": 950.00,
        "preparation_time": 20,
        "available": True
    }).json()

    m2 = client.post("/api/v1/restaurant/menu", json={
        "name": "Sumo Natural de Maracujá",
        "category": "drinks",
        "price": 150.00,
        "preparation_time": 5,
        "available": True
    }).json()

    # 2. Open Table Order
    order_res = client.post("/api/v1/restaurant/orders", json={
        "table_id": table_id,
        "guest_count": 2,
        "notes": "Cliente VIP"
    })
    assert order_res.status_code == 201
    order_data = order_res.json()
    order_id = order_data["id"]
    assert order_data["order_number"].startswith("R-")
    assert order_data["status"] == "open"
    assert order_data["table_id"] == table_id

    # Verify table is now OCCUPIED
    t_check = client.get(f"/api/v1/restaurant/tables/{table_id}").json()
    assert t_check["status"] == "occupied"

    # Cannot open another order on the same occupied table
    dup_order = client.post("/api/v1/restaurant/orders", json={
        "table_id": table_id,
        "guest_count": 2
    })
    assert dup_order.status_code == 400

    # 3. Add Items to Order
    item1_res = client.post(f"/api/v1/restaurant/orders/{order_id}/items", json={
        "menu_item_id": m1["id"],
        "quantity": 2,
        "special_requests": "Extra piripíri e limão à parte"
    })
    assert item1_res.status_code == 201
    item1_data = item1_res.json()
    assert item1_data["special_requests"] == "Extra piripíri e limão à parte"
    assert float(item1_data["unit_price"]) == 950.00
    assert float(item1_data["subtotal"]) == 1900.00
    assert item1_data["preparation_status"] == "pending"

    item2_res = client.post(f"/api/v1/restaurant/orders/{order_id}/items", json={
        "menu_item_id": m2["id"],
        "quantity": 2,
        "special_requests": "Sem açúcar"
    })
    assert item2_res.status_code == 201
    item2_data = item2_res.json()
    assert float(item2_data["subtotal"]) == 300.00

    # Check order financial calculation
    # Subtotal = 1900 + 300 = 2200.00
    # IVA (16%) = 352.00
    # Service (10%) = 220.00
    # Total = 2200 + 352 + 220 = 2772.00
    ord_check = client.get(f"/api/v1/restaurant/orders/{order_id}").json()
    assert float(ord_check["subtotal"]) == 2200.00
    assert float(ord_check["tax"]) == 352.00
    assert float(ord_check["service_charge"]) == 220.00
    assert float(ord_check["total"]) == 2772.00

    # 4. KDS and Preparation status update
    kds_res = client.get("/api/v1/restaurant/kitchen-display")
    assert kds_res.status_code == 200
    kds_data = kds_res.json()
    assert kds_data["total_pending"] >= 2

    # Update item 1: pending -> preparing -> ready -> served
    p_res = client.put(f"/api/v1/restaurant/order-items/{item1_data['id']}/status", json={"status": "preparing"})
    assert p_res.status_code == 200
    assert p_res.json()["preparation_status"] == "preparing"
    assert p_res.json()["started_at"] is not None

    r_res = client.put(f"/api/v1/restaurant/order-items/{item1_data['id']}/status", json={"status": "ready"})
    assert r_res.status_code == 200
    assert r_res.json()["preparation_status"] == "ready"
    assert r_res.json()["ready_at"] is not None

    s_res = client.put(f"/api/v1/restaurant/order-items/{item1_data['id']}/status", json={"status": "served"})
    assert s_res.status_code == 200
    assert s_res.json()["preparation_status"] == "served"
    assert s_res.json()["served_at"] is not None

    # 5. Get Itemized Bill
    bill_res = client.get(f"/api/v1/restaurant/orders/{order_id}/bill")
    assert bill_res.status_code == 200
    bill = bill_res.json()
    assert bill["order_id"] == order_id
    assert bill["table_number"] == "05"
    assert len(bill["items"]) == 2
    assert float(bill["subtotal"]) == 2200.00
    assert float(bill["tax_amount"]) == 352.00
    assert float(bill["service_charge_amount"]) == 220.00
    assert float(bill["total"]) == 2772.00
    assert float(bill["remaining_balance"]) == 2772.00
    assert bill["is_paid"] is False

    # 6. Close Table with Payment
    close_res = client.post(f"/api/v1/restaurant/orders/{order_id}/close", json={
        "payment_method": "mpesa",
        "amount_paid": 2800.00,
        "notes": "Gorjeta incluída no troco"
    })
    assert close_res.status_code == 200
    close_data = close_res.json()
    assert close_data["status"] == "paid"
    assert float(close_data["total"]) == 2772.00
    assert float(close_data["amount_paid"]) == 2800.00
    assert float(close_data["change"]) == 28.00
    assert close_data["payment_method"] == "mpesa"
    assert close_data["table_status"] == "dirty"

    # Verify table status is now DIRTY (needs cleaning before reuse)
    t_after = client.get(f"/api/v1/restaurant/tables/{table_id}").json()
    assert t_after["status"] == "dirty"

    # Clean the table -> available
    clean_res = client.put(f"/api/v1/restaurant/tables/{table_id}/status", json={"status": "available"})
    assert clean_res.status_code == 200
    assert clean_res.json()["status"] == "available"


def test_split_bill_equal_and_custom(client: TestClient, db_session):
    """Test splitting a restaurant bill equally and with custom amounts."""
    # Create Menu Item
    m = client.post("/api/v1/restaurant/menu", json={
        "name": "Lagosta Grelhada",
        "category": "mains",
        "price": 1000.00,
        "available": True
    }).json()

    # Create Order without table (Takeaway)
    order = client.post("/api/v1/restaurant/orders", json={
        "guest_count": 3
    }).json()
    order_id = order["id"]

    # Add 1 item of 1000.00
    # Subtotal = 1000.00
    # IVA (16%) = 160.00
    # Service (10%) = 100.00
    # Total = 1260.00
    client.post(f"/api/v1/restaurant/orders/{order_id}/items", json={
        "menu_item_id": m["id"],
        "quantity": 1
    })

    # Test Equal Split (3 people: 1260 / 3 = 420.00 each)
    split_res = client.post(f"/api/v1/restaurant/orders/{order_id}/split-bill", json={
        "num_bills": 3
    })
    assert split_res.status_code == 200
    split_data = split_res.json()
    assert split_data["num_splits"] == 3
    assert float(split_data["total_order_amount"]) == 1260.00
    assert float(split_data["total_allocated"]) == 1260.00
    assert float(split_data["remaining_to_allocate"]) == 0.00

    for person in split_data["splits"]:
        assert float(person["amount"]) == 420.00
        assert person["payment_status"] == "pending"

    # Test Custom Split with different payment methods
    custom_res = client.post(f"/api/v1/restaurant/orders/{order_id}/split-bill", json={
        "custom_splits": [
            {"guest_name": "Alice Mondlane", "amount": 600.00, "payment_method": "mpesa"},
            {"guest_name": "Bruno Cossa", "amount": 660.00, "payment_method": "pos"}
        ]
    })
    assert custom_res.status_code == 200
    custom_data = custom_res.json()
    assert custom_data["num_splits"] == 2
    assert float(custom_data["total_allocated"]) == 1260.00
    assert custom_data["splits"][0]["guest_name"] == "Alice Mondlane"
    assert custom_data["splits"][0]["payment_method"] == "mpesa"
    assert float(custom_data["splits"][0]["amount"]) == 600.00
    assert custom_data["splits"][1]["guest_name"] == "Bruno Cossa"
    assert custom_data["splits"][1]["payment_method"] == "pos"
    assert float(custom_data["splits"][1]["amount"]) == 660.00


def test_kds_urgency_color_coding(client: TestClient, db_session):
    """Test KDS color coding: green (<5m), yellow (5-10m), red (>10m)."""
    # Create menu item & order directly with manipulated created_at timestamps
    menu_item = MenuItem(
        company_id=1,
        name="Lulas Grelhadas",
        category="mains",
        price=Decimal("450.00"),
        preparation_time=15,
        available=True
    )
    db_session.add(menu_item)
    db_session.commit()

    order = RestaurantOrder(
        company_id=1,
        order_number="R-TEST-KDS",
        guest_count=2,
        status=OrderStatus.OPEN.value,
        opened_at=datetime.utcnow() - timedelta(minutes=30),
        total=Decimal("450.00")
    )
    db_session.add(order)
    db_session.commit()

    # Item 1: Created 2 minutes ago -> Green
    item_green = OrderItem(
        order_id=order.id,
        menu_item_id=menu_item.id,
        quantity=1,
        unit_price=Decimal("450.00"),
        subtotal=Decimal("450.00"),
        preparation_status=ItemPrepStatus.PENDING.value,
        created_at=datetime.utcnow() - timedelta(minutes=2)
    )
    # Item 2: Created 7 minutes ago -> Yellow
    item_yellow = OrderItem(
        order_id=order.id,
        menu_item_id=menu_item.id,
        quantity=1,
        unit_price=Decimal("450.00"),
        subtotal=Decimal("450.00"),
        preparation_status=ItemPrepStatus.PENDING.value,
        created_at=datetime.utcnow() - timedelta(minutes=7)
    )
    # Item 3: Created 15 minutes ago -> Red
    item_red = OrderItem(
        order_id=order.id,
        menu_item_id=menu_item.id,
        quantity=1,
        unit_price=Decimal("450.00"),
        subtotal=Decimal("450.00"),
        preparation_status=ItemPrepStatus.PREPARING.value,
        created_at=datetime.utcnow() - timedelta(minutes=15)
    )
    db_session.add_all([item_green, item_yellow, item_red])
    db_session.commit()

    kds_res = client.get("/api/v1/restaurant/kitchen-display")
    assert kds_res.status_code == 200
    kds = kds_res.json()
    items_by_id = {i["order_item_id"]: i for i in kds["items"]}

    assert items_by_id[item_green.id]["urgency_color"] == "green"
    assert items_by_id[item_yellow.id]["urgency_color"] == "yellow"
    assert items_by_id[item_red.id]["urgency_color"] == "red"
    assert kds["total_pending"] >= 2
    assert kds["total_preparing"] >= 1


def test_restaurant_reports_and_analytics(client: TestClient, db_session):
    """Test restaurant analytics: peak hours, top dishes, average table turnover time."""
    # Seed Menu Item
    m1 = MenuItem(company_id=1, name="Galinha Cafreal", category="mains", price=Decimal("600.00"), available=True)
    m2 = MenuItem(company_id=1, name="Sobremesa Bebinca", category="desserts", price=Decimal("200.00"), available=True)
    db_session.add_all([m1, m2])
    db_session.commit()

    now = datetime.utcnow()
    # Order 1: closed after 45 minutes
    o1 = RestaurantOrder(
        company_id=1,
        order_number="R-REP-01",
        guest_count=2,
        status=OrderStatus.PAID.value,
        opened_at=now - timedelta(hours=2),
        closed_at=now - timedelta(hours=2) + timedelta(minutes=45),
        subtotal=Decimal("800.00"),
        tax=Decimal("128.00"),
        service_charge=Decimal("80.00"),
        total=Decimal("1008.00"),
        amount_paid=Decimal("1008.00"),
        payment_method="pos"
    )
    db_session.add(o1)
    db_session.commit()

    i1 = OrderItem(order_id=o1.id, menu_item_id=m1.id, quantity=1, unit_price=Decimal("600.00"), subtotal=Decimal("600.00"), preparation_status="served")
    i2 = OrderItem(order_id=o1.id, menu_item_id=m2.id, quantity=1, unit_price=Decimal("200.00"), subtotal=Decimal("200.00"), preparation_status="served")
    db_session.add_all([i1, i2])
    db_session.commit()

    rep_res = client.get("/api/v1/restaurant/reports")
    assert rep_res.status_code == 200
    rep = rep_res.json()

    assert rep["total_orders"] >= 1
    assert float(rep["total_revenue"]) >= 1008.00
    assert rep["average_table_time_minutes"] > 0
    assert len(rep["peak_hours"]) == 24
    assert len(rep["top_dishes"]) >= 2
    top_names = [d["name"] for d in rep["top_dishes"]]
    assert "Galinha Cafreal" in top_names


def test_restaurant_settings_and_auto_clean(client: TestClient, db_session):
    """Test updating restaurant settings and verifying auto_clean behavior."""
    # Get settings
    get_res = client.get("/api/v1/restaurant/settings")
    assert get_res.status_code == 200
    settings = get_res.json()
    assert float(settings["service_charge_percent"]) == 10.00
    assert float(settings["tax_percent"]) == 16.00

    # Update settings: auto_clean_tables = True, service_charge = 12%
    up_res = client.put("/api/v1/restaurant/settings", json={
        "service_charge_percent": 12.00,
        "auto_clean_tables": True,
        "urgent_prep_time_minutes": 8
    })
    assert up_res.status_code == 200
    up = up_res.json()
    assert float(up["service_charge_percent"]) == 12.00
    assert up["auto_clean_tables"] is True
    assert up["urgent_prep_time_minutes"] == 8

    # Create table & order, then close -> table should become AVAILABLE instead of DIRTY
    t = client.post("/api/v1/restaurant/tables", json={"table_number": "99", "capacity": 2}).json()
    o = client.post("/api/v1/restaurant/orders", json={"table_id": t["id"]}).json()

    close_res = client.post(f"/api/v1/restaurant/orders/{o['id']}/close", json={"payment_method": "cash"})
    assert close_res.status_code == 200
    assert close_res.json()["table_status"] == "available"


def test_websocket_kds_endpoint(client: TestClient):
    """Test connecting to the KDS WebSocket channel."""
    with client.websocket_connect("/api/v1/restaurant/ws/kds?company_id=1&role=kitchen") as websocket:
        websocket.send_text("ping")
        data = websocket.receive_json()
        assert data["event"] == "pong"
        assert data["data"] == "ping"
