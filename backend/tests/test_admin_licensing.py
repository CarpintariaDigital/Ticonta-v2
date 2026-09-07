import pytest
from datetime import datetime, timedelta
from app.models.license import License
from app.tasks.licensing_tasks import LicensingTasks


def test_admin_licenses_pagination_and_filters(client, admin_token_headers):
    # 1. Gerar licenças via admin endpoint
    gen1 = client.post(
        "/api/v1/admin/licenses/generate",
        json={"customer_name": "Empresa Alfa", "plan": "basic", "days": 365, "customer_email": "alfa@empresa.co.mz"},
        headers=admin_token_headers,
    )
    assert gen1.status_code == 201
    assert "license_key" in gen1.json()

    gen2 = client.post(
        "/api/v1/admin/licenses/generate",
        json={"customer_name": "Empresa Beta", "plan": "complete", "days": 180},
        headers=admin_token_headers,
    )
    assert gen2.status_code == 201

    # 2. Consultar listagem paginada
    res = client.get("/api/v1/admin/licenses?page=1&limit=10", headers=admin_token_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2
    assert "total_pages" in data

    # 3. Filtrar por plano basic
    filter_res = client.get("/api/v1/admin/licenses?plan=basic", headers=admin_token_headers)
    assert filter_res.status_code == 200
    assert all(item["plan"] == "basic" for item in filter_res.json()["items"])


def test_admin_license_detail_revoke_and_renew(client, admin_token_headers):
    # 1. Criar licença
    gen = client.post(
        "/api/v1/admin/licenses/generate",
        json={"customer_name": "Carpintaria Revoke Lda", "plan": "professional", "days": 180, "customer_email": "cliente@revoke.co.mz"},
        headers=admin_token_headers,
    ).json()

    lic_id = gen["id"]

    # 2. Consultar detalhes da licença
    detail_res = client.get(f"/api/v1/admin/licenses/{lic_id}", headers=admin_token_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["customer_name"] == "Carpintaria Revoke Lda"
    assert "crm" in detail["modules"]
    assert detail["status"] == "active"

    # 3. Revogar licença
    revoke_res = client.post(
        f"/api/v1/admin/licenses/{lic_id}/revoke",
        json={"reason": "Cancelamento do contrato pelo cliente"},
        headers=admin_token_headers,
    )
    assert revoke_res.status_code == 200
    assert revoke_res.json()["status"] == "revoked"

    # 4. Renovar licença via PUT
    renew_res = client.put(
        f"/api/v1/admin/licenses/{lic_id}/renew",
        json={"days": 365},
        headers=admin_token_headers,
    )
    assert renew_res.status_code == 200
    assert renew_res.json()["days_remaining"] >= 360

    # 5. Reenviar email
    email_res = client.post(
        f"/api/v1/admin/licenses/{lic_id}/resend-email",
        json={"email": "novo.email@revoke.co.mz"},
        headers=admin_token_headers,
    )
    assert email_res.status_code == 200


def test_admin_stats_and_telemetry_usage(client, admin_token_headers):
    # 1. Estatísticas globais
    stats_res = client.get("/api/v1/admin/licenses/stats", headers=admin_token_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_licenses" in stats
    assert "active_licenses" in stats
    assert "upcoming_expirations_30_days" in stats
    assert "average_license_value_mzn" in stats
    assert "revenue_trend" in stats

    # 2. Telemetria e Uso
    usage_res = client.get("/api/v1/admin/licenses/usage", headers=admin_token_headers)
    assert usage_res.status_code == 200
    assert "customers_usage" in usage_res.json()


def test_admin_permissions_restricted(client, operator_token_headers):
    # Testar que operador (não admin) não tem acesso
    res = client.get("/api/v1/admin/licenses", headers=operator_token_headers)
    assert res.status_code == 403

    gen = client.post(
        "/api/v1/admin/licenses/generate",
        json={"customer_name": "Invasor", "plan": "enterprise", "days": 30},
        headers=operator_token_headers,
    )
    assert gen.status_code == 403


def test_licensing_background_tasks(db_session):
    # Criar licença prestes a expirar (7 dias)
    now = datetime.utcnow()
    exp_soon = License(
        license_key="TIC-EXP07-PROF-260822-ABC12345",
        customer_name="Empresa Expirando",
        customer_email="aviso@empresa.co.mz",
        customer_id="EXP07",
        plan="professional",
        issued_at=now - timedelta(days=358),
        expires_at=now + timedelta(days=7),
        status="active",
    )
    db_session.add(exp_soon)
    db_session.commit()

    res = LicensingTasks.check_expiring_licenses_and_warn(db_session)
    assert res["warnings_sent"] >= 1
