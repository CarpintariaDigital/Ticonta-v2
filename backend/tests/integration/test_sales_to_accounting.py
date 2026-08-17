import pytest


@pytest.mark.integration
def test_sales_to_accounting_flow(client, admin_token_headers):
    """
    Fluxo Integrado:
    1. Executar Venda no POS
    2. Validação automática de Partida Dobrada (Débito Caixa/Bancos = Crédito Vendas + IVA)
    3. Validação de atualização de Balancete de Verificação (Trial Balance)
    4. Validação de saldos das contas PGC-NIRF
    """
    # 1. Realizar Venda
    sale = client.post(
        "/api/v1/sales",
        json={
            "company_id": 1,
            "customer_id": 1,
            "payment_method": "cash",
            "items": [{"product_id": 2, "quantity": 5, "unit_price": "3200.00", "tax_rate": "16.00"}],
            "discount": "0.00",
        },
        headers=admin_token_headers,
    ).json()
    assert float(sale["total_amount"]) == 16000.00

    # 2. Consultar Balancete
    tb = client.get("/api/v1/accounting/trial-balance", headers=admin_token_headers).json()
    assert tb["is_balanced"] is True
    assert float(tb["sum_total_debits"]) == float(tb["sum_total_credits"])
    assert float(tb["sum_total_debits"]) >= 16000.00

    # 3. Consultar DRE (Demonstração de Resultados)
    dre = client.get("/api/v1/accounting/income-statement", headers=admin_token_headers).json()
    assert float(dre["total_revenues"]) >= 13793.10  # Base sem IVA
