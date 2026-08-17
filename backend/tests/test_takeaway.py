from datetime import datetime, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from app.models.takeaway import TakeawayOrder, TakeawayOrderStatus, TakeawayOrderType
from app.models.delivery import Delivery, DeliveryStatus
from app.models.restaurant import MenuItem, MenuCategory


def test_takeaway_order_creation(client: TestClient, db_session):
    """Test creating a takeaway (pickup) order."""
    # 1. Seed Menu Item
    menu_item = MenuItem(
        company_id=1,
        name="Frango Zambeziano",
        category=MenuCategory.MAINS.value,
        price=Decimal("650.00"),
        preparation_time=30,
        available=True
    )
    db_session.add(menu_item)
    db_session.commit()

    # 2. Create Takeaway Order
    res = client.post("/api/v1/takeaway/orders", json={
        "customer_name": "Armando Guebuza",
        "customer_phone": "+258841112233",
        "order_type": "takeaway",
        "payment_method": "mpesa",
        "payment_status": "paid",
        "special_instructions": "Sem picante e embalar separado",
        "items": [
            {
                "menu_item_id": menu_item.id,
                "item_name": "Frango Zambeziano",
                "quantity": 2,
                "unit_price": 650.00,
                "special_requests": "Sem picante"
            },
            {
                "item_name": "Dose de Batata Frita",
                "quantity": 1,
                "unit_price": 200.00
            }
        ]
    })
    assert res.status_code == 201
    data = res.json()
    assert data["order_number"].startswith("T-")
    assert data["customer_name"] == "Armando Guebuza"
    assert data["order_type"] == "takeaway"
    assert data["status"] == "pending"
    assert float(data["subtotal"]) == 1500.00  # (2*650) + 200
    assert float(data["total"]) == 1500.00
    assert data["estimated_prep_minutes"] >= 30
    assert len(data["items"]) == 2
    assert data["delivery"] is None


def test_delivery_order_creation_and_assignment(client: TestClient, db_session):
    """Test creating a delivery order, tracking code generation, and courier assignment."""
    # 1. Create Delivery Order
    res = client.post("/api/v1/takeaway/orders", json={
        "customer_name": "Helena Mondlane",
        "customer_phone": "+258823334455",
        "order_type": "delivery",
        "delivery_address": "Av. Julius Nyerere, Edifício Platinum, 4º Andar, Maputo",
        "payment_method": "emola",
        "payment_status": "paid",
        "delivery_fee": 150.00,
        "special_instructions": "Deixar na recepção",
        "items": [
            {
                "item_name": "Matapa com Camarão",
                "quantity": 1,
                "unit_price": 750.00
            }
        ]
    })
    assert res.status_code == 201
    order = res.json()
    assert order["order_type"] == "delivery"
    assert float(order["subtotal"]) == 750.00
    assert float(order["delivery_fee"]) == 150.00
    assert float(order["total"]) == 900.00
    assert order["delivery"] is not None
    assert order["delivery"]["delivery_status"] == "pending"
    tracking_code = order["delivery"]["tracking_code"]
    assert tracking_code.startswith("TC-")
    order_id = order["id"]

    # 2. Assign Delivery Person
    assign_res = client.post(f"/api/v1/takeaway/orders/{order_id}/delivery/assign", json={
        "delivery_person_name": "Rider Carlos Sitoe",
        "delivery_person_phone": "+258849998877",
        "estimated_minutes": 20
    })
    assert assign_res.status_code == 200
    assigned_order = assign_res.json()
    assert assigned_order["delivery"]["delivery_person_name"] == "Rider Carlos Sitoe"
    assert assigned_order["delivery"]["delivery_status"] in ["assigned", "in_transit"]
    assert assigned_order["estimated_delivery_minutes"] == 20


def test_order_status_updates_and_lifecycle(client: TestClient, db_session):
    """Test advancing order status and pickup timestamp recording."""
    # Create order
    create_res = client.post("/api/v1/takeaway/orders", json={
        "customer_name": "Samora Machel Jr",
        "customer_phone": "+258845556677",
        "order_type": "takeaway",
        "items": [
            {"item_name": "Prego no Prato", "quantity": 1, "unit_price": 450.00}
        ]
    }).json()
    order_id = create_res["id"]

    # 1. Update to Preparing
    p_res = client.put(f"/api/v1/takeaway/orders/{order_id}/status", json={
        "status": "preparing"
    })
    assert p_res.status_code == 200
    assert p_res.json()["status"] == "preparing"

    # 2. Update to Ready (triggers pickup notification)
    r_res = client.put(f"/api/v1/takeaway/orders/{order_id}/status", json={
        "status": "ready"
    })
    assert r_res.status_code == 200
    r_data = r_res.json()
    assert r_data["status"] == "ready"
    assert r_data["ready_at"] is not None

    # 3. Update to Picked Up (Completed)
    c_res = client.put(f"/api/v1/takeaway/orders/{order_id}/status", json={
        "status": "picked_up"
    })
    assert c_res.status_code == 200
    c_data = c_res.json()
    assert c_data["status"] == "picked_up"
    assert c_data["pickup_at"] is not None


def test_realtime_order_tracking(client: TestClient, db_session):
    """Test tracking an order via ID and tracking code."""
    # Create delivery order
    order = client.post("/api/v1/takeaway/orders", json={
        "customer_name": "Dona Graça",
        "customer_phone": "+258840003322",
        "order_type": "delivery",
        "delivery_address": "Bairro da Polana Cimento, Rua de Kassuende",
        "items": [
            {"item_name": "Caril de Camarão", "quantity": 1, "unit_price": 800.00}
        ]
    }).json()

    order_id = order["id"]
    tracking_code = order["delivery"]["tracking_code"]

    # 1. Track by ID
    track_id_res = client.get(f"/api/v1/takeaway/orders/{order_id}/track")
    assert track_id_res.status_code == 200
    track_data = track_id_res.json()
    assert track_data["order_number"] == order["order_number"]
    assert track_data["customer_name"] == "Dona Graça"
    assert len(track_data["steps"]) == 4
    assert track_data["steps"][0]["status"] == "completed"  # Step 1: Confirmed

    # 2. Track by Code
    track_code_res = client.get(f"/api/v1/takeaway/track/{tracking_code}")
    assert track_code_res.status_code == 200
    assert track_code_res.json()["tracking_code"] == tracking_code


def test_pending_deliveries_and_stats(client: TestClient, db_session):
    """Test querying pending deliveries and daily takeaway metrics."""
    # Get pending deliveries
    pending_res = client.get("/api/v1/takeaway/pending-deliveries")
    assert pending_res.status_code == 200
    assert isinstance(pending_res.json(), list)

    # Get daily stats
    stats_res = client.get("/api/v1/takeaway/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_orders_today" in stats
    assert "takeaway_count" in stats
    assert "delivery_count" in stats
    assert "total_revenue_today" in stats
