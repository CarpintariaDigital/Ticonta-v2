import pytest


@pytest.mark.integration
def test_offline_sync_simulation_and_batch_processing(client, admin_token_headers):
    """
    Fluxo Integrado:
    1. Simular operações em lote criadas no modo offline
    2. Transmissão em batch para o endpoint de sincronização
    3. Proteção e idempotência contra mutações duplicadas
    4. Sincronização incremental com timestamp
    """
    # 1 & 2. Enviar lote de sincronização offline (Push)
    payload = {
        "company_id": 1,
        "operations": [
            {
                "client_mutation_id": "offline-mut-001",
                "entity": "Customer",
                "operation": "CREATE",
                "payload": {"name": "Empresa Sincronizada 1"},
                "client_timestamp": "2026-08-15T08:00:00Z",
            },
            {
                "client_mutation_id": "offline-mut-002",
                "entity": "Customer",
                "operation": "CREATE",
                "payload": {"name": "Empresa Sincronizada 2"},
                "client_timestamp": "2026-08-15T08:01:00Z",
            },
        ],
    }

    push_res = client.post("/api/v1/sync/push", json=payload, headers=admin_token_headers)
    assert push_res.status_code == 200
    assert push_res.json()["processed_count"] == 2

    # 3. Re-enviar para validar idempotência (sem duplicar no banco)
    push_dup_res = client.post("/api/v1/sync/push", json=payload, headers=admin_token_headers)
    assert push_dup_res.status_code == 200
    dup_results = push_dup_res.json()["results"]
    assert all(r["status"] == "DUPLICATE_SKIPPED" for r in dup_results)

    # 4. Puxar alterações para o cliente (Pull)
    pull_res = client.get("/api/v1/sync/pull?company_id=1", headers=admin_token_headers)
    assert pull_res.status_code == 200
    assert "server_sync_timestamp" in pull_res.json()
