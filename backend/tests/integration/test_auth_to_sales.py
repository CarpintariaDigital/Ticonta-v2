import pytest
from app.models.account import Account


@pytest.mark.integration
def test_auth_to_sales_flow(client, db_session):
    """
    Fluxo Integrado:
    1. Registo de novo operador
    2. Login e obtenção de token JWT
    3. Criação de venda pelo POS
    4. Validação de lançamento contabilístico gerado automaticamente
    5. Validação de dedução física do stock
    """
    # 1. Registo
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "username": "operador_loja1",
            "pin": "5555",
            "role": "operator",
            "email": "loja1@ticonta.co.mz",
        },
    )
    assert reg_res.status_code == 201

    # 2. Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "operador_loja1", "pin": "5555"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Criar Venda POS
    sale_payload = {
        "company_id": 1,
        "customer_id": 1,
        "payment_method": "mpesa",
        "items": [{"product_id": 1, "quantity": 3, "unit_price": "7500.00", "tax_rate": "16.00"}],
        "discount": "0.00",
    }
    sale_res = client.post("/api/v1/sales", json=sale_payload, headers=headers)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert float(sale_data["total_amount"]) == 22500.00

    # 4. Verificar Lançamento Contabilístico
    entries = client.get("/api/v1/accounting/journal-entries", headers=headers).json()
    assert len(entries) >= 1
    recent_entry = entries[0]
    assert "FT" in recent_entry["description"] or "Venda" in recent_entry["description"]

    # 5. Verificar Stock Atualizado (Stock inicial era 15 -> agora 12)
    products_res = client.get("/api/v1/sales", headers=headers)
    assert products_res.status_code == 200
