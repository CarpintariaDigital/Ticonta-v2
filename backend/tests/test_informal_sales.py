from datetime import datetime, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from app.models.informal_customer import InformalCustomer
from app.models.debit import Debit, PartialPayment, DebitStatus
from app.services.informal_sales import InformalSalesService


def test_quick_customer_creation(client: TestClient, db_session):
    """Test quick customer registration from phone and idempotency."""
    res = client.post("/api/v1/informal/customers/quick", json={
        "name": "Dona Maria Machava",
        "phone": "+258849993344",
        "location": "Bairro de Chamanculo C, Rua 4",
        "trusted_credit_limit": 3000.00,
        "notes": "Vende bolos no mercado"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Dona Maria Machava"
    assert data["phone"] == "+258849993344"
    assert float(data["total_owed"]) == 0.00
    assert float(data["payment_reliability"]) == 5.00
    cust_id = data["id"]

    # Calling quick create again with same phone should return existing customer
    res_dup = client.post("/api/v1/informal/customers/quick", json={
        "name": "Dona Maria",
        "phone": "+258849993344"
    })
    assert res_dup.status_code == 201
    assert res_dup.json()["id"] == cust_id

    # List customers with search
    list_res = client.get("/api/v1/informal/customers?search=Chamanculo")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


def test_sale_with_debit_and_partial_payment_flow(client: TestClient, db_session):
    """
    Test full informal sale with fiado:
    1. Create informal customer
    2. Make purchase of 2500 MT paying 500 MT in cash, leaving 2000 MT as debit (due in 5 days)
    3. Verify debit record and customer total_owed = 2000 MT
    4. Amortize 1000 MT via M-Pesa -> remaining 1000 MT, status partially_paid
    5. Pay final 1000 MT -> remaining 0 MT, status paid, customer marked as verified
    """
    # 1. Create customer
    c_res = client.post("/api/v1/informal/customers/quick", json={
        "name": "Sr. Alberto Chissano",
        "phone": "+258821112233",
        "location": "Zimpeto, Paragem Central"
    }).json()
    cust_id = c_res["id"]

    # 2. Sale with Debit: 2 items of 1250 MT = 2500 MT total. Paid 500 MT entry.
    due_date = (datetime.utcnow() + timedelta(days=5)).isoformat()
    sale_res = client.post("/api/v1/informal/sales/with-debit", json={
        "customer_id": cust_id,
        "items": [
            {"product_name": "Saco de Arroz 25kg", "quantity": 1, "unit_price": 1500.00},
            {"product_name": "Óleo de Cozinha 5L", "quantity": 1, "unit_price": 1000.00}
        ],
        "amount_paid_now": 500.00,
        "due_date": due_date,
        "payment_method": "cash",
        "notes": "Entrada de 500 MT em mão, restante promete pagar após o negócio de sábado"
    })
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert float(sale_data["total_amount"]) == 2500.00
    assert float(sale_data["amount_paid_now"]) == 500.00
    assert float(sale_data["amount_owed"]) == 2000.00
    assert sale_data["status"] == "active"
    debit_id = sale_data["debit_id"]
    assert debit_id is not None

    # 3. Check customer debt summary
    summary_res = client.get(f"/api/v1/informal/customers/{cust_id}/debit")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert float(summary["total_owed"]) == 2000.00
    assert float(summary["total_purchases"]) == 2500.00
    assert summary["active_debits_count"] == 1

    # 4. Partial Payment (Amortização 1): Pay 1000 MT via M-Pesa
    pay1_res = client.post(f"/api/v1/informal/debits/{debit_id}/pay", json={
        "amount": 1000.00,
        "payment_method": "mpesa",
        "notes": "Amortização via M-Pesa TxID: MP26081701",
        "send_notification": True
    })
    assert pay1_res.status_code == 200
    pay1_data = pay1_res.json()
    assert float(pay1_data["amount_paid_now"]) == 1000.00
    assert float(pay1_data["total_amortized"]) == 1000.00
    assert float(pay1_data["remaining_balance"]) == 1000.00
    assert pay1_data["debit_status"] == "partially_paid"
    assert pay1_data["notification_sent"] is True

    # 5. Final Partial Payment (Amortização 2): Pay remaining 1000 MT
    pay2_res = client.post(f"/api/v1/informal/debits/{debit_id}/pay", json={
        "amount": 1000.00,
        "payment_method": "emola",
        "notes": "Quitação total via E-Mola",
        "send_notification": True
    })
    assert pay2_res.status_code == 200
    pay2_data = pay2_res.json()
    assert float(pay2_data["remaining_balance"]) == 0.00
    assert pay2_data["debit_status"] == "paid"

    # Verify customer profile updated
    cust_after = client.get(f"/api/v1/informal/customers/{cust_id}").json()
    assert float(cust_after["total_owed"]) == 0.00
    assert cust_after["verified"] is True


def test_credit_scoring_engine(client: TestClient, db_session):
    """Test credit reliability score calculation and limit changes."""
    service = InformalSalesService(db_session)

    # Create customer with good history
    cust = service.create_customer_from_phone(
        name="Tia Joana",
        phone="+258840001122",
        trusted_credit_limit=Decimal("3000.00")
    )
    cust.total_purchases = Decimal("15000.00")
    cust.verified = True
    db_session.commit()

    score = service.calculate_credit_score(cust.id)
    assert score >= Decimal("4.50")
    assert cust.trusted_credit_limit >= Decimal("10000.00")


def test_overdue_debits_and_reminders(client: TestClient, db_session):
    """Test overdue debit detection and sending WhatsApp reminder."""
    # Create customer and overdue debit
    cust = InformalCustomer(
        company_id=1,
        name="Sr. Mateus Cossa",
        phone="+258847778899",
        location="Maxaquene D",
        total_owed=Decimal("1500.00"),
        total_purchases=Decimal("3000.00"),
        payment_reliability=Decimal("4.00")
    )
    db_session.add(cust)
    db_session.commit()

    overdue_debit = Debit(
        company_id=1,
        customer_id=cust.id,
        total_amount=Decimal("1500.00"),
        initial_paid=Decimal("0.00"),
        amount_owed=Decimal("1500.00"),
        amount_paid=Decimal("0.00"),
        due_date=datetime.utcnow() - timedelta(days=3),  # Venceu há 3 dias
        status=DebitStatus.ACTIVE.value,
        notes="Prometeu pagar terça-feira"
    )
    db_session.add(overdue_debit)
    db_session.commit()

    # Get overdue list
    overdue_res = client.get("/api/v1/informal/debits/overdue")
    assert overdue_res.status_code == 200
    overdues = overdue_res.json()
    assert len(overdues) >= 1
    found = [d for d in overdues if d["id"] == overdue_debit.id][0]
    assert found["is_overdue"] is True
    assert found["days_overdue"] >= 3

    # Send reminder
    reminder_res = client.post(f"/api/v1/informal/debits/{overdue_debit.id}/send-reminder", json={
        "channel": "whatsapp"
    })
    assert reminder_res.status_code == 200
    rem_data = reminder_res.json()
    assert rem_data["status"] == "sent"
    assert "Mateus" in rem_data["message"]


def test_credit_risk_and_cash_flow_reports(client: TestClient, db_session):
    """Test credit risk report and cash flow forecasting timeline."""
    # Seed high risk customer
    c_risk = InformalCustomer(
        company_id=1,
        name="Cliente Inadimplente",
        phone="+258841110099",
        location="Hulene B",
        total_owed=Decimal("5000.00"),
        total_purchases=Decimal("5000.00"),
        payment_reliability=Decimal("2.00")
    )
    db_session.add(c_risk)
    db_session.commit()

    d_risk = Debit(
        company_id=1,
        customer_id=c_risk.id,
        total_amount=Decimal("5000.00"),
        amount_owed=Decimal("5000.00"),
        amount_paid=Decimal("0.00"),
        due_date=datetime.utcnow() - timedelta(days=10),
        status=DebitStatus.OVERDUE.value
    )
    db_session.add(d_risk)
    db_session.commit()

    # 1. Credit Risk Report
    risk_res = client.get("/api/v1/informal/reports/credit-risk")
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert risk_data["high_risk_customers_count"] >= 1
    assert float(risk_data["total_debt_at_risk"]) >= 5000.00

    # 2. Cash Flow Forecast
    forecast_res = client.get("/api/v1/informal/reports/cash-flow")
    assert forecast_res.status_code == 200
    forecast_data = forecast_res.json()
    assert float(forecast_data["total_outstanding_debt"]) >= 5000.00
    assert len(forecast_data["forecast_timeline"]) == 5

    # 3. Revenue Breakdown
    rev_res = client.get("/api/v1/informal/reports/revenue-breakdown")
    assert rev_res.status_code == 200
    assert "immediate_cash_revenue" in rev_res.json()

    # 4. Compliance Report
    comp_res = client.get("/api/v1/informal/compliance/fiscal-report")
    assert comp_res.status_code == 200
    assert comp_res.json()["compliance_status"].startswith("CONFORME")
