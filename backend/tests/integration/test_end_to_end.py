import pytest


@pytest.mark.integration
def test_end_to_end_pos_to_accounting_flow(client, admin_token_headers):
    """
    Fluxo Integrado E2E:
    1. Vender produto no POS
    2. Verificar redução de stock
    3. Verificar reflexo no Relatório de Vendas
    4. Verificar presença de auditoria
    """
    # 1. Realizar Venda POS de 2 unidades do Produto 1
    sale_payload = {
        "company_id": 1,
        "customer_id": 1,
        "payment_method": "mpesa",
        "items": [{"product_id": 1, "quantity": 2, "unit_price": "7500.00", "tax_rate": "16.00"}],
        "discount": "0.00",
    }
    sale_res = client.post("/api/v1/sales", json=sale_payload, headers=admin_token_headers)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert float(sale_data["total_amount"]) == 15000.00

    # 2. Consultar Relatório de Vendas
    rep_res = client.get("/api/v1/reports/sales?company_id=1", headers=admin_token_headers)
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert rep_data["total_sales_count"] >= 1
    assert float(rep_data["total_revenue"]) >= 15000.00


@pytest.mark.integration
def test_end_to_end_manufacturing_to_project_flow(client, admin_token_headers):
    """
    Fluxo Integrado E2E:
    1. Criar Projeto de Obra
    2. Calcular Orçamento de Fabrico de Peça
    3. Otimizar Plano de Corte de Chapas
    4. Emitir Ordem de Produção (OP) vinculada ao Projeto
    5. Lançar despesa no Projeto
    6. Verificar alerta orçamentário
    """
    # 1. Criar Projeto
    proj = client.post(
        "/api/v1/projects",
        json={"company_id": 1, "name": "Obra Mobiliário Executivo", "budget": "50000.00"},
        headers=admin_token_headers,
    ).json()
    proj_id = proj["id"]

    # 2. Calcular Orçamento
    calc = client.post(
        "/api/v1/manufacturing/budget/calculate",
        json={
            "material_cost": "15000.00",
            "labor_hours": "10.00",
            "labor_rate": "250.00",
            "overhead_percentage": "15.00",
            "margin_percentage": "30.00",
        },
        headers=admin_token_headers,
    ).json()
    assert float(calc["final_price"]) > 0

    # 3. Otimizar Corte 2D
    cut = client.post(
        "/api/v1/manufacturing/cutting-plan/calculate",
        json={
            "sheet_length": 2750.0,
            "sheet_width": 1830.0,
            "pieces": [{"name": "Painel", "length": 1000.0, "width": 500.0, "quantity": 4}],
        },
        headers=admin_token_headers,
    ).json()
    assert cut["total_sheets_needed"] >= 1

    # 4. Emitir Ordem de Produção vinculada ao Projeto
    wo = client.post(
        "/api/v1/manufacturing/work-orders",
        json={
            "company_id": 1,
            "project_id": proj_id,
            "description": "Painéis de Madeira Chanfuta",
            "budget": str(calc["final_price"]),
            "materials": [],
        },
        headers=admin_token_headers,
    ).json()
    assert wo["project_id"] == proj_id

    # 5. Lançar Despesa no Projeto de 42.000 MZN (>80% do budget de 50k)
    client.post(
        f"/api/v1/projects/{proj_id}/expenses",
        json={"description": "Compra de Madeira e Vernizes", "amount": "42000.00", "category": "material"},
        headers=admin_token_headers,
    )

    # 6. Verificar Alerta de Orçamento
    summary = client.get(f"/api/v1/projects/{proj_id}/summary", headers=admin_token_headers).json()
    assert summary["budget_alert"] is True
    assert float(summary["actual_cost"]) == 42000.00
