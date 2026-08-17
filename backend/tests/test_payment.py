from datetime import datetime, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from app.models.payment import UnifiedPayment, PaymentTransaction, PaymentStatus


def test_full_payment(client: TestClient, db_session):
    """Test full payment settlement for a sale/order in 1 transaction."""
    sale_id = 901
    res = client.post(f"/api/v1/payments/{sale_id}", json={
        "amount_total": 1500.00,
        "amount_paid": 1500.00,
        "payment_method": "mpesa",
        "transaction_id": "MP260817001",
        "module_source": "pos",
        "customer_name": "António Muchanga",
        "notes": "Pagamento total via M-Pesa",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["sale_id"] == sale_id
    assert float(data["amount_total"]) == 1500.00
    assert float(data["amount_paid"]) == 1500.00
    assert float(data["amount_owed"]) == 0.00
    assert data["status"] == "paid"
    assert len(data["transactions"]) == 1
    assert data["transactions"][0]["payment_method"] == "mpesa"
    assert data["transactions"][0]["transaction_id"] == "MP260817001"


def test_partial_payment_and_amortization_lifecycle(client: TestClient, db_session):
    """Test partial payment, outstanding balance tracking, and final liquidation."""
    sale_id = 902
    due_date = (datetime.utcnow() + timedelta(days=7)).isoformat()

    # 1. First partial payment (1000 MT out of 3000 MT)
    p1 = client.post(f"/api/v1/payments/{sale_id}", json={
        "amount_total": 3000.00,
        "amount_paid": 1000.00,
        "payment_method": "cash",
        "due_date": due_date,
        "module_source": "restaurant",
        "customer_name": "Carlos Tembe",
        "notes": "Entrada de 1000 MT em dinheiro",
    })
    assert p1.status_code == 200
    d1 = p1.json()
    assert d1["status"] == "partial"
    assert float(d1["amount_paid"]) == 1000.00
    assert float(d1["amount_owed"]) == 2000.00
    assert len(d1["transactions"]) == 1

    # 2. Query status endpoint
    status_res = client.get(f"/api/v1/payments/{sale_id}/status?module=restaurant")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "partial"
    assert float(status_res.json()["amount_owed"]) == 2000.00

    # 3. Second partial payment (2000 MT via E-Mola to liquidate)
    p2 = client.post(f"/api/v1/payments/{sale_id}", json={
        "amount_paid": 2000.00,
        "payment_method": "emola",
        "transaction_id": "EMOLA-9988",
        "module_source": "restaurant",
        "notes": "Quitação final via E-Mola",
    })
    assert p2.status_code == 200
    d2 = p2.json()
    assert d2["status"] == "paid"
    assert float(d2["amount_paid"]) == 3000.00
    assert float(d2["amount_owed"]) == 0.00
    assert len(d2["transactions"]) == 2


def test_split_payment_multiple_methods(client: TestClient, db_session):
    """Test splitting payment across cash, mpesa, and card simultaneously."""
    sale_id = 903
    res = client.post(f"/api/v1/payments/{sale_id}/split", json={
        "amount_total": 2800.00,
        "module_source": "takeaway",
        "customer_name": "Beatriz Cossa",
        "payments": [
            {"amount": 1000.00, "payment_method": "cash", "notes": "Notas físicas"},
            {"amount": 1300.00, "payment_method": "mpesa", "transaction_id": "MP-9876"},
            {"amount": 500.00, "payment_method": "card", "transaction_id": "POS-5544"},
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert float(data["amount_total"]) == 2800.00
    assert float(data["amount_paid"]) == 2800.00
    assert float(data["amount_owed"]) == 0.00
    assert data["status"] == "paid"
    assert len(data["transactions"]) == 3


def test_overdue_tracking_and_outstanding_list(client: TestClient, db_session):
    """Test overdue payment detection and listing of unpaid balances."""
    sale_id = 904
    past_due_date = (datetime.utcnow() - timedelta(days=3)).isoformat()

    # Create partial payment with past due date
    client.post(f"/api/v1/payments/{sale_id}", json={
        "amount_total": 5000.00,
        "amount_paid": 1500.00,
        "payment_method": "cash",
        "due_date": past_due_date,
        "module_source": "informal",
        "customer_name": "Inácio Cuna",
    })

    # Query status (should automatically identify as overdue)
    status_res = client.get(f"/api/v1/payments/{sale_id}/status?module=informal")
    assert status_res.status_code == 200
    data = status_res.json()
    assert data["status"] == "overdue"
    assert data["is_overdue"] is True
    assert float(data["amount_owed"]) == 3500.00

    # Query outstanding list
    out_res = client.get("/api/v1/payments/outstanding")
    assert out_res.status_code == 200
    out_data = out_res.json()
    assert out_data["total_unpaid_count"] >= 1
    assert float(out_data["total_outstanding_amount"]) >= 3500.00


def test_tax_payment_report(client: TestClient, db_session):
    """Test generating tax compliance payment report."""
    res = client.get("/api/v1/payments/tax-report")
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
    assert "breakdown_by_method" in data
    assert "tax_information" in data
    assert data["tax_information"]["vat_base_rate"] == "16%"
