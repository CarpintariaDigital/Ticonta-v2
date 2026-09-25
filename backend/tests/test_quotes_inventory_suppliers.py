import pytest
from fastapi.testclient import TestClient


def test_quotes_crud_and_conversion(client: TestClient, db_session):
    # 1. Listar cotações
    res = client.get("/api/v1/quotes")
    assert res.status_code == 200
    quotes = res.json()
    assert len(quotes) >= 1

    # 2. Criar nova cotação
    payload = {
        "quote_type": "cotacao",
        "customer_name": "Empresa Teste Lda",
        "customer_nuit": "100998877",
        "customer_phone": "+258841234567",
        "payment_terms": "Pronto Pagamento",
        "items": [
            {
                "description": "Item A - Cotação Teste",
                "quantity": 5.0,
                "unit_price": 1000.0,
                "discount_percent": 10.0,
                "iva_rate": 16.0,
            }
        ],
    }
    create_res = client.post("/api/v1/quotes", json=payload)
    assert create_res.status_code == 201
    quote = create_res.json()
    assert quote["customer_name"] == "Empresa Teste Lda"
    assert float(quote["total"]) == 5220.0  # (5000 - 500) + 16% (720) = 5220

    quote_id = quote["id"]

    # 3. Converter cotação em venda
    conv_res = client.post(f"/api/v1/quotes/{quote_id}/convert-to-sale")
    assert conv_res.status_code == 200
    conv_data = conv_res.json()
    assert "invoice_number" in conv_data
    assert conv_data["quote_id"] == quote_id


def test_inventory_overview_and_stock_movements(client: TestClient, db_session):
    # 1. Overview do inventário
    res = client.get("/api/v1/inventory/overview")
    assert res.status_code == 200
    data = res.json()
    assert "total_items" in data
    assert "total_cost_value_mzn" in data

    # 2. Listar itens
    items_res = client.get("/api/v1/inventory/items")
    assert items_res.status_code == 200
    items = items_res.json()
    assert len(items) >= 1

    first_item = items[0]
    first_id = first_item["id"]
    stock_before = float(first_item["current_stock"])

    # 3. Registar entrada de stock
    mov_payload = {
        "product_id": first_id,
        "movement_type": "in_purchase",
        "quantity": 10.0,
        "unit_cost": 1050.0,
        "reference_document": "FAT-FORN-2026/99",
        "notes": "Compra de reabastecimento",
    }
    mov_res = client.post("/api/v1/inventory/movements", json=mov_payload)
    assert mov_res.status_code == 201
    mov = mov_res.json()
    assert float(mov["stock_after"]) == stock_before + 10.0


def test_suppliers_crud_and_invoices(client: TestClient, db_session):
    # 1. Listar fornecedores
    res = client.get("/api/v1/suppliers")
    assert res.status_code == 200
    suppliers = res.json()
    assert len(suppliers) >= 1

    # 2. Criar novo fornecedor
    payload = {
        "name": "Fornecedor Maputo Teste Lda",
        "nuit": "100445566",
        "phone": "+258845566778",
        "category": "Alimentar",
        "payment_terms": "30 Dias",
        "city": "Maputo",
    }
    create_res = client.post("/api/v1/suppliers", json=payload)
    assert create_res.status_code == 201
    supp = create_res.json()
    assert supp["name"] == "Fornecedor Maputo Teste Lda"

    # 3. Registar fatura de compra ao fornecedor
    inv_payload = {
        "supplier_id": supp["id"],
        "invoice_number": "FT-SUPP-001/2026",
        "invoice_date": "2026-09-25",
        "due_date": "2026-10-25",
        "total_amount": 50000.0,
        "iva_amount": 8000.0,
        "description": "Aquisição de mercadoria a prazo",
    }
    inv_res = client.post("/api/v1/suppliers/invoices", json=inv_payload)
    assert inv_res.status_code == 201
    inv = inv_res.json()
    assert float(inv["balance_due"]) == 50000.0
    assert inv["supplier_name"] == "Fornecedor Maputo Teste Lda"
