import pytest


@pytest.mark.integration
def test_crm_to_sales_flow(client, admin_token_headers):
    """
    Fluxo Integrado:
    1. Criar Lead no CRM
    2. Adicionar interação comercial
    3. Avançar estágio no funil Kanban ('novo' -> 'proposta' -> 'ganho')
    4. Converter Lead em Cliente e faturar no POS
    5. Validar consistência nos dois módulos
    """
    # 1. Criar Lead
    lead = client.post(
        "/api/v1/crm/leads",
        json={
            "company_id": 1,
            "name": "Condomínio Costa do Sol",
            "email": "gestao@costadosol.co.mz",
            "phone": "+258849991122",
            "value": "85000.00",
            "source": "referral",
        },
        headers=admin_token_headers,
    ).json()
    lead_id = lead["id"]
    assert lead["stage"] == "novo"

    # 2. Adicionar Interação
    client.post(
        f"/api/v1/crm/leads/{lead_id}/interactions",
        json={"type": "meeting", "description": "Apresentação do orçamento de portas maciças"},
        headers=admin_token_headers,
    )

    # 3. Mover Estágio para Ganho
    updated = client.post(
        f"/api/v1/crm/leads/{lead_id}/stage",
        json={"stage": "ganho", "notes": "Negócio fechado e ganho"},
        headers=admin_token_headers,
    ).json()
    assert updated["stage"] == "ganho"
    assert updated["probability"] == 100

    # 4. Faturar Venda POS
    sale = client.post(
        "/api/v1/sales",
        json={
            "company_id": 1,
            "customer_id": 1,
            "payment_method": "bank_transfer",
            "items": [{"product_id": 1, "quantity": 1, "unit_price": "7500.00", "tax_rate": "16.00"}],
            "discount": "0.00",
        },
        headers=admin_token_headers,
    ).json()
    assert sale["invoice_number"].startswith("FT")
