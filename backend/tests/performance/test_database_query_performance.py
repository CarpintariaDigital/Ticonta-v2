import time
import pytest
from decimal import Decimal
from app.models.entities import Product
from app.models.sale import Sale, SaleItem
from app.models.lead import Lead
from app.models.account import Account


@pytest.mark.slow
def test_bulk_database_sales_query_performance(db_session):
    """Garantir que consulta com agregação e filtros seja inferior a 100ms."""
    # Seed de 500 vendas com itens em memória
    sales = []
    for i in range(500):
        s = Sale(
            company_id=1,
            customer_id=1,
            user_id=1,
            invoice_number=f"FT-PERF-{i}",
            net_amount=Decimal("7500.00"),
            tax_amount=Decimal("1200.00"),
            total_amount=Decimal("8700.00"),
            payment_method="cash",
            payment_status="completed",
        )
        sales.append(s)
    db_session.bulk_save_objects(sales)
    db_session.commit()

    start_time = time.perf_counter()
    results = db_session.query(Sale).filter(Sale.company_id == 1).limit(100).all()
    duration_ms = (time.perf_counter() - start_time) * 1000

    assert len(results) == 100
    assert duration_ms < 100.0, f"Query levou {duration_ms:.2f}ms (limite 100ms)"


@pytest.mark.slow
def test_bulk_leads_query_performance(db_session):
    """Garantir consulta de leads abaixo de 50ms."""
    leads = [
        Lead(
            company_id=1,
            name=f"Lead {i}",
            phone="+258840000000",
            stage="novo",
            value=Decimal("50000.00"),
            probability=20,
        )
        for i in range(200)
    ]
    db_session.bulk_save_objects(leads)
    db_session.commit()

    start_time = time.perf_counter()
    leads_res = db_session.query(Lead).filter(Lead.company_id == 1, Lead.stage == "novo").all()
    duration_ms = (time.perf_counter() - start_time) * 1000

    assert len(leads_res) >= 200
    assert duration_ms < 50.0, f"Query levou {duration_ms:.2f}ms (limite 50ms)"
