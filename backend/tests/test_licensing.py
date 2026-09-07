import pytest
from datetime import datetime, timedelta
from decimal import Decimal

from app.core.security import create_access_token
from app.services.licensing import LicensingService
from app.services.license_server import issue_license, validate_license, revoke_license


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


# ============================================================================
# Central License Server Tests (TC-{NUIT}-{HASH}-{EXPIRY})
# ============================================================================

def test_issue_license_generates_valid_key(db_session):
    result = issue_license(
        nuit="400123789",
        machine_id="SERVER-MAC-01:23:45:67:89:AB",
        plan="pro",
        duration_days=365,
        client_name="Padaria Central Maputo",
        client_email="info@padariacentral.mz",
        db=db_session,
    )

    key = result["license_key"]
    assert key.startswith("TC-400123789-")
    parts = key.split("-")
    assert len(parts) == 4
    assert len(parts[2]) == 12  # 12-char sha256 hash
    assert result["plan"] == "pro"
    assert "restaurant" in result["modules"]
    assert "pos" in result["modules"]


def test_validate_license_correct_machine(db_session):
    issued = issue_license(
        nuit="400987654",
        machine_id="POS-TERMINAL-01",
        plan="enterprise",
        duration_days=180,
        db=db_session,
    )

    val = validate_license(
        license_key=issued["license_key"],
        machine_id="POS-TERMINAL-01",
        db=db_session,
    )

    assert val["valid"] is True
    assert val["plan"] == "enterprise"
    assert "crm" in val["modules"]
    assert "poultry" in val["modules"]
    assert "projects" in val["modules"]
    assert val["nuit"] == "400987654"


def test_validate_license_wrong_machine(db_session):
    issued = issue_license(
        nuit="400987654",
        machine_id="POS-TERMINAL-CORRECT",
        plan="pro",
        duration_days=365,
        db=db_session,
    )

    val = validate_license(
        license_key=issued["license_key"],
        machine_id="POS-TERMINAL-WRONG-CLONE",
        db=db_session,
    )

    assert val["valid"] is False
    assert val["reason"] == "machine_id_or_nuit_mismatch"


def test_validate_license_expired(db_session):
    # Gerar com duração negativa (já expirada)
    issued = issue_license(
        nuit="400555666",
        machine_id="MACHINE-01",
        plan="base",
        duration_days=-5,
        db=db_session,
    )

    val = validate_license(
        license_key=issued["license_key"],
        machine_id="MACHINE-01",
        db=db_session,
    )

    assert val["valid"] is False
    assert val["reason"] == "license_expired"


def test_revoke_license(db_session):
    issued = issue_license(
        nuit="400111222",
        machine_id="MACHINE-REVOKE-TEST",
        plan="pro",
        duration_days=100,
        db=db_session,
    )

    # Válida antes de revogar
    val_before = validate_license(issued["license_key"], "MACHINE-REVOKE-TEST", db=db_session)
    assert val_before["valid"] is True

    # Revogar
    rev = revoke_license(issued["license_key"], db=db_session)
    assert rev["revoked"] is True

    # Inválida após revogar
    val_after = validate_license(issued["license_key"], "MACHINE-REVOKE-TEST", db=db_session)
    assert val_after["valid"] is False
    assert val_after["reason"] == "license_revoked"


# ============================================================================
# API Gateway & Module Guard Middleware Tests
# ============================================================================

def test_module_guard_blocks_unlicensed_route(client, db_session):
    """Token com plano 'base' (apenas 'pos' e 'informal') é bloqueado ao aceder a /api/v1/restaurant."""
    base_token = create_access_token(
        user_id=2,
        username="operador_base",
        roles=["operator"],
        modules=["pos", "informal"],
    )
    headers = {"Authorization": f"Bearer {base_token}"}

    res = client.get("/api/v1/restaurant/tables", headers=headers)
    assert res.status_code == 403
    data = res.json()
    assert data["error"] == "module_not_licensed"
    assert data["module"] == "restaurant"
    assert data["upgrade_url"] == "/pricing"


def test_module_guard_allows_licensed_route(client, db_session):
    """Token com plano 'base' pode aceder a rotas do módulo 'pos' e 'informal'."""
    base_token = create_access_token(
        user_id=2,
        username="operador_base",
        roles=["operator"],
        modules=["pos", "informal"],
    )
    headers = {"Authorization": f"Bearer {base_token}"}

    # POS / Products permitido
    res_prod = client.get("/api/v1/products", headers=headers)
    assert res_prod.status_code == 200

    # Token com 'pro' (inclui restaurant) pode aceder a /api/v1/restaurant/tables
    pro_token = create_access_token(
        user_id=2,
        username="operador_pro",
        roles=["operator"],
        modules=["pos", "informal", "restaurant"],
    )
    headers_pro = {"Authorization": f"Bearer {pro_token}"}

    res_rest = client.get("/api/v1/restaurant/tables", headers=headers_pro)
    assert res_rest.status_code == 200


def test_admin_license_server_routes(client, admin_token_headers):
    """Testa endpoints da rota /api/v1/admin/licenses (issue, by-nuit, revoke)."""
    # 1. Emitir
    issue_res = client.post(
        "/api/v1/admin/licenses/issue",
        json={
            "nuit": "400888999",
            "machine_id": "SERVER-TEST-API",
            "plan": "pro",
            "duration_days": 120,
            "client_name": "Empresa Teste",
        },
        headers=admin_token_headers,
    )
    assert issue_res.status_code == 200
    issued_data = issue_res.json()
    lic_key = issued_data["license_key"]
    assert "TC-400888999-" in lic_key

    # 2. Consultar por NUIT
    nuit_res = client.get("/api/v1/admin/licenses/by-nuit/400888999", headers=admin_token_headers)
    assert nuit_res.status_code == 200
    records = nuit_res.json()
    assert len(records) >= 1
    assert any(lic["license_key"] == lic_key for lic in records)

    # 3. Revogar
    revoke_res = client.post(
        "/api/v1/admin/licenses/revoke",
        json={"license_key": lic_key},
        headers=admin_token_headers,
    )
    assert revoke_res.status_code == 200
    assert revoke_res.json()["revoked"] is True
