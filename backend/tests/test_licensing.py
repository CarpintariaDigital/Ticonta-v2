import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from app.services.licensing import LicensingService


def test_generate_and_validate_license_key():
    svc = LicensingService()

    # 1. Gerar Chave de Licença Válida (Plano Complete)
    res = svc.generate_license_key(
        customer_name="Carpintaria Macuácua Lda",
        plan="complete",
        days=365,
    )

    key = res["license_key"]
    assert key.startswith("TIC-")
    assert "-COMPLETE-" in key
    assert len(key.split("-")) == 5
    assert "manufacturing" in res["modules"]
    assert "accounting" in res["modules"]
    assert float(res["price_mzn"]) > 0

    # 2. Validar Chave Gerada
    val = svc.validate_license_key(key)
    assert val["valid"] is True
    assert val["plan"] == "complete"
    assert "manufacturing" in val["modules"]
    assert val["days_remaining"] >= 364
    assert val["error"] is None


def test_tampered_and_invalid_license_signature():
    svc = LicensingService()
    res = svc.generate_license_key(customer_name="Teste", plan="basic", days=30)
    valid_key = res["license_key"]

    # Adulterar assinatura
    parts = valid_key.split("-")
    tampered_key = f"{parts[0]}-{parts[1]}-{parts[2]}-{parts[3]}-BADSIG01"

    val = svc.validate_license_key(tampered_key)
    assert val["valid"] is False
    assert "adulterada" in val["error"]


def test_expired_license_key():
    svc = LicensingService()
    # Gerar chave que expirou há 10 dias
    issued_at = datetime.utcnow() - timedelta(days=40)
    expires_at = issued_at + timedelta(days=30)  # expirou há 10 dias
    yymmdd = expires_at.strftime("%y%m%d")
    payload_base = f"TIC-EXP01-BASIC-{yymmdd}"
    sig = svc._generate_signature(payload_base)
    expired_key = f"{payload_base}-{sig}"

    val = svc.validate_license_key(expired_key)
    assert val["valid"] is False
    assert val["days_remaining"] == 0
    assert "expirou" in val["error"]


def test_licensing_api_lifecycle(client, admin_token_headers):
    # 1. Admin gera chave
    gen_res = client.post(
        "/api/v1/licensing/generate-key",
        json={"customer_name": "Moveis Beira Lda", "plan": "complete", "days": 365},
        headers=admin_token_headers,
    )
    assert gen_res.status_code == 201
    license_data = gen_res.json()
    lic_key = license_data["license_key"]
    assert lic_key.startswith("TIC-")

    # 2. Rota Pública valida chave
    val_res = client.post(
        "/api/v1/licensing/validate-key",
        json={"license_key": lic_key},
    )
    assert val_res.status_code == 200
    assert val_res.json()["valid"] is True
    assert val_res.json()["plan"] == "complete"

    # 3. Ativar licença para a empresa
    act_res = client.post(
        "/api/v1/licensing/activate-license",
        json={"company_id": 1, "license_key": lic_key},
        headers=admin_token_headers,
    )
    assert act_res.status_code == 200
    assert act_res.json()["plan"] == "complete"

    # 4. Consultar status da licença
    status_res = client.get(
        "/api/v1/licensing/status?company_id=1",
        headers=admin_token_headers,
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "licensed"
    assert "manufacturing" in status_res.json()["modules"]

    # 5. Listar licenças emitidas (Admin)
    list_res = client.get("/api/v1/licensing/admin/licenses", headers=admin_token_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
    lic_id = list_res.json()[0]["id"]

    # 6. Renovar licença (Admin)
    renew_res = client.put(
        f"/api/v1/licensing/admin/licenses/{lic_id}/renew",
        json={"days": 730},
        headers=admin_token_headers,
    )
    assert renew_res.status_code == 200
    assert renew_res.json()["days_remaining"] >= 720

    # 7. Consultar estatísticas financeiras de licenças (Admin)
    stats_res = client.get("/api/v1/licensing/admin/stats", headers=admin_token_headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total_licenses"] >= 1
    assert float(stats_res.json()["estimated_revenue_mzn"]) > 0
