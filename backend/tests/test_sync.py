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
