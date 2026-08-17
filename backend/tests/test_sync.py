import uuid
from datetime import datetime, timezone
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.entities import Company, Customer, Product
from app.models.sale import Sale
from app.models.sync_log import SyncLog
from app.models.user import User
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    company = Company(id=1, name="Loja Offline", nuit="400888999", currency="MZN")
    user = User(id=1, username="operador_pos", email="pos@loja.co.mz", pin_hash="hash123", role="operator")
    prod = Product(
        id=1,
        company_id=1,
        name="Cimento 50kg",
        sku="CIM-50",
        unit_price=Decimal("450.00"),
        quantity=Decimal("50.000"),
        iva_rate=Decimal("16.00"),
        active=True,
        updated_at=datetime.utcnow(),
    )
    session.add_all([company, user, prod])
    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def auth_headers():
    token = create_access_token(user_id=1, username="operador_pos", roles=["operator"])
    return {"Authorization": f"Bearer {token}"}


def test_sync_push_creates_offline_sale(client, auth_headers, db):
    mutation_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    payload = {
        "company_id": 1,
        "device_id": "POS-TERMINAL-01",
        "operations": [
            {
                "client_mutation_id": mutation_id,
                "entity": "Sale",
                "operation": "CREATE",
                "client_timestamp": now,
                "payload": {
                    "items": [{"product_id": 1, "quantity": 2.0}],
                    "payment_method": "cash",
                    "discount": "0.00",
                },
            }
        ],
    }

    response = client.post("/api/v1/sync/push", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["processed_count"] == 1
    result = data["results"][0]
    assert result["client_mutation_id"] == mutation_id
    assert result["status"] == "APPLIED"
    assert result["server_entity_id"] is not None

    # Verificar se a venda foi salva e o stock foi baixado no servidor
    sale = db.query(Sale).filter(Sale.id == result["server_entity_id"]).first()
    assert sale is not None
    assert sale.invoice_number.startswith("FT ")

    p = db.query(Product).filter(Product.id == 1).first()
    assert float(p.quantity) == 48.0  # 50 - 2


def test_sync_push_idempotency_duplicate_skipped(client, auth_headers):
    mutation_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    payload = {
        "company_id": 1,
        "device_id": "POS-TERMINAL-01",
        "operations": [
            {
                "client_mutation_id": mutation_id,
                "entity": "Customer",
                "operation": "CREATE",
                "client_timestamp": now,
                "payload": {"name": "Cliente Novo Offline", "nuit": "100200300"},
            }
        ],
    }

    # 1ª tentativa
    r1 = client.post("/api/v1/sync/push", json=payload, headers=auth_headers)
    assert r1.status_code == 200
    assert r1.json()["results"][0]["status"] == "APPLIED"

    # 2ª tentativa (mesmo client_mutation_id)
    r2 = client.post("/api/v1/sync/push", json=payload, headers=auth_headers)
    assert r2.status_code == 200
    assert r2.json()["results"][0]["status"] == "DUPLICATE_SKIPPED"


def test_sync_pull_incremental_changes(client, auth_headers):
    response = client.get("/api/v1/sync/pull?company_id=1", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["changes_count"] >= 1
    entities = [c["entity"] for c in data["changes"]]
    assert "Product" in entities


def test_sync_customer_and_product_update(client, auth_headers, db):
    """Testa sincronização offline de atualizações em Customer e Product (Last-write-wins)."""
    # 1. Criar um cliente inicial no banco
    cust = Customer(company_id=1, name="Cliente Antigo", phone="+258840000000", email="antigo@loja.co.mz")
    db.add(cust)
    db.commit()

    now = datetime.now(timezone.utc).isoformat()
    mutation_cust = str(uuid.uuid4())
    mutation_prod = str(uuid.uuid4())

    payload = {
        "company_id": 1,
        "device_id": "POS-TERMINAL-01",
        "operations": [
            {
                "client_mutation_id": mutation_cust,
                "entity": "Customer",
                "entity_id": cust.id,
                "operation": "UPDATE",
                "client_timestamp": now,
                "payload": {
                    "name": "Cliente Atualizado Offline",
                    "phone": "+258849999999",
                    "email": "atualizado@loja.co.mz",
                },
            },
            {
                "client_mutation_id": mutation_prod,
                "entity": "Product",
                "entity_id": 1,
                "operation": "UPDATE",
                "client_timestamp": now,
                "payload": {
                    "quantity": "75.000",
                    "unit_price": "490.00",
                },
            },
        ],
    }

    res = client.post("/api/v1/sync/push", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["processed_count"] == 2
    assert all(r["status"] == "APPLIED" for r in data["results"])

    # Validar modificações no DB
    db.refresh(cust)
    assert cust.name == "Cliente Atualizado Offline"
    assert cust.phone == "+258849999999"

    prod = db.query(Product).filter(Product.id == 1).first()
    assert float(prod.quantity) == 75.0
    assert float(prod.unit_price) == 490.0


def test_sync_unsupported_entity_and_error_handling(client, auth_headers):
    """Testa rejeição graciosa de entidades não suportadas e tratamento de erros de payload."""
    now = datetime.now(timezone.utc).isoformat()
    mutation_unsupported = str(uuid.uuid4())
    mutation_invalid = str(uuid.uuid4())

    payload = {
        "company_id": 1,
        "device_id": "POS-TERMINAL-02",
        "operations": [
            {
                "client_mutation_id": mutation_unsupported,
                "entity": "NonExistentEntity",
                "operation": "CREATE",
                "client_timestamp": now,
                "payload": {"data": 123},
            },
            {
                "client_mutation_id": mutation_invalid,
                "entity": "Sale",
                "operation": "CREATE",
                "client_timestamp": now,
                "payload": {
                    "items": [{"product_id": 999999, "quantity": 10}],  # Produto inexistente gera erro
                    "payment_method": "cash",
                },
            },
        ],
    }

    res = client.post("/api/v1/sync/push", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["processed_count"] == 2
    results = data["results"]

    # 1º item: rejeitado por entidade não suportada
    assert results[0]["status"] == "REJECTED"
    assert "não suportada" in results[0]["message"]

    # 2º item: rejeitado por exceção capturada (produto não encontrado)
    assert results[1]["status"] == "REJECTED"


def test_sync_pull_with_since_timestamp_filter(client, auth_headers, db):
    """Testa pull incremental usando filtro de data 'last_sync_timestamp'."""
    past_timestamp = datetime(2020, 1, 1, tzinfo=timezone.utc).isoformat()
    future_timestamp = datetime(2035, 1, 1, tzinfo=timezone.utc).isoformat()

    # Com timestamp passado, deve retornar mudanças
    res_past = client.get(
        "/api/v1/sync/pull",
        params={"company_id": 1, "last_sync_timestamp": past_timestamp},
        headers=auth_headers,
    )
    assert res_past.status_code == 200
    assert res_past.json()["changes_count"] >= 1

    # Com timestamp futuro, não deve retornar nenhuma mudança
    res_future = client.get(
        "/api/v1/sync/pull",
        params={"company_id": 1, "last_sync_timestamp": future_timestamp},
        headers=auth_headers,
    )
    assert res_future.status_code == 200
    assert res_future.json()["changes_count"] == 0

