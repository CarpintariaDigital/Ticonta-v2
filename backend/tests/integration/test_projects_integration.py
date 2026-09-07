import pytest


@pytest.mark.integration
def test_projects_lifecycle_and_cost_tracking(client, admin_token_headers):
    """
    Fluxo Integrado:
    1. Criar Obra / Projeto de Fabrico
    2. Criar cronograma de tarefas
    3. Registar despesas operacionais
    4. Avaliar margem de lucro e progresso
    """
    # 1. Criar Projeto
    project = client.post(
        "/api/v1/projects",
        json={
            "company_id": 1,
            "name": "Mobiliário Hotel Avenida",
            "description": "Fabrico de 20 mesas e 80 cadeiras",
            "budget": "250000.00",
            "start_date": "2026-08-01",
            "end_date": "2026-08-30",
        },
        headers=admin_token_headers,
    ).json()
    proj_id = project["id"]

    # 2. Adicionar Tarefas
    client.post(
        f"/api/v1/projects/{proj_id}/tasks",
        json={"title": "Corte de Chapas de Madeira", "status": "in_progress"},
        headers=admin_token_headers,
    )

    # 3. Registar Despesas
    client.post(
        f"/api/v1/projects/{proj_id}/expenses",
        json={"description": "Madeira Maciça de Chanfuta", "amount": "90000.00", "category": "material"},
        headers=admin_token_headers,
    )
    client.post(
        f"/api/v1/projects/{proj_id}/expenses",
        json={"description": "Mão de Obra de Marceneiros", "amount": "40000.00", "category": "labor"},
        headers=admin_token_headers,
    )

    # 4. Verificar Relatório e Lucro
    summary = client.get(f"/api/v1/projects/{proj_id}/summary", headers=admin_token_headers).json()
    assert float(summary["actual_cost"]) == 130000.00
    assert float(summary["profit"]) == 120000.00  # 250k - 130k
    assert summary["budget_alert"] is False  # 130k / 250k = 52% (< 80%)
