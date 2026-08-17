import pytest
from app.services.premium_features import PremiumFeatureService


def test_premium_features_enable_disable_and_cost(client, admin_token_headers):
    # 1. Listar funcionalidades disponíveis
    avail_res = client.get("/api/v1/premium/available-features?company_id=1", headers=admin_token_headers)
    assert avail_res.status_code == 200
    features = avail_res.json()
    assert len(features) >= 4
    feature_names = [f["name"] for f in features]
    assert "whatsapp_delivery" in feature_names
    assert "barcode_scanner" in feature_names

    # 2. Ativar Módulo WhatsApp
    enable_res = client.post(
        "/api/v1/premium/features/whatsapp_delivery/enable?company_id=1",
        headers=admin_token_headers,
    )
    assert enable_res.status_code == 200
    assert enable_res.json()["enabled"] is True

    # 3. Ativar Módulo Barcode Scanner
    enable_bar_res = client.post(
        "/api/v1/premium/features/barcode_scanner/enable?company_id=1",
        headers=admin_token_headers,
    )
    assert enable_bar_res.status_code == 200

    # 4. Consultar discriminativo de custos (Cost Breakdown)
    cost_res = client.get("/api/v1/premium/cost-breakdown?company_id=1", headers=admin_token_headers)
    assert cost_res.status_code == 200
    cost_data = cost_res.json()
    assert cost_data["base_plan_cost_mzn"] >= 500
    assert cost_data["premium_addons_total_mzn"] >= 750.0  # 350 (whatsapp) + 400 (barcode)
    assert cost_data["grand_total_monthly_mzn"] == cost_data["base_plan_cost_mzn"] + cost_data["premium_addons_total_mzn"]

    # 5. Desativar Módulo WhatsApp
    disable_res = client.post(
        "/api/v1/premium/features/whatsapp_delivery/disable?company_id=1",
        headers=admin_token_headers,
    )
    assert disable_res.status_code == 200
    assert disable_res.json()["enabled"] is False

    # 6. Verificar redução no custo
    new_cost_res = client.get("/api/v1/premium/cost-breakdown?company_id=1", headers=admin_token_headers)
    assert new_cost_res.status_code == 200
    assert new_cost_res.json()["premium_addons_total_mzn"] == 400.0  # Apenas barcode ativo
