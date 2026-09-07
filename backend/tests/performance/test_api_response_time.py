import time
import pytest


@pytest.mark.slow
def test_sales_api_response_time_benchmark(client, admin_token_headers):
    """Garantir que GET /api/v1/sales responda em < 100ms e POST em < 200ms."""
    # 1. Benchmark GET /sales
    start_get = time.perf_counter()
    res_get = client.get("/api/v1/sales", headers=admin_token_headers)
    duration_get_ms = (time.perf_counter() - start_get) * 1000

    assert res_get.status_code == 200
    assert duration_get_ms < 100.0, f"GET /sales levou {duration_get_ms:.2f}ms (limite 100ms)"

    # 2. Benchmark POST /sales (Criação de fatura, dedução de stock, NFe e lançamentos contabilísticos)
    payload = {
        "company_id": 1,
        "customer_id": 1,
        "payment_method": "cash",
        "items": [{"product_id": 1, "quantity": 1, "unit_price": "7500.00", "tax_rate": "16.00"}],
        "discount": "0.00",
    }
    start_post = time.perf_counter()
    res_post = client.post("/api/v1/sales", json=payload, headers=admin_token_headers)
    duration_post_ms = (time.perf_counter() - start_post) * 1000

    assert res_post.status_code == 201
    assert duration_post_ms < 200.0, f"POST /sales levou {duration_post_ms:.2f}ms (limite 200ms)"


@pytest.mark.slow
def test_trial_balance_api_response_time(client, admin_token_headers):
    """Garantir cálculo dinâmico de Balancete PGC-NIRF em < 300ms."""
    start = time.perf_counter()
    res = client.get("/api/v1/accounting/trial-balance", headers=admin_token_headers)
    duration_ms = (time.perf_counter() - start) * 1000

    assert res.status_code == 200
    assert duration_ms < 300.0, f"Trial balance levou {duration_ms:.2f}ms (limite 300ms)"
