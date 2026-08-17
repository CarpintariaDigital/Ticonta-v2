from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.entities import Company, Customer, Product, JournalEntry, AuditLog
from app.models.sale import Sale, SaleItem, Payment
from app.models.user import User
from main import app

# Database in-memory SQLite para testes
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
    
    # Criar dados de suporte para os testes
    company = Company(
        id=1,
        name="Loja Central Moçambique",
        nuit="400987654",
        currency="MZN",
    )
    user = User(
        id=1,
        username="caixa1",
        email="caixa1@ticonta.co.mz",
        pin_hash="fakehash",
        role="operator",
    )
    customer = Customer(
        id=1,
        company_id=1,
        name="António Macuácua",
        nuit="100200300",
        debt_amount=Decimal("0.00"),
        total_spent=Decimal("0.00"),
    )
    p1 = Product(
        id=1,
        company_id=1,
        name="Cimento Nacional 50kg",
        sku="CIM-001",
        unit_price=Decimal("450.00"),
        cost_price=Decimal("380.00"),
        quantity=Decimal("100.000"),
        iva_rate=Decimal("16.00"),
        active=True,
    )
    p2 = Product(
        id=2,
        company_id=1,
        name="Tinta Branca 20L",
        sku="TNT-002",
        unit_price=Decimal("1200.00"),
        cost_price=Decimal("950.00"),
        quantity=Decimal("5.000"),
        iva_rate=Decimal("16.00"),
        active=True,
    )
    p_inactive = Product(
        id=3,
        company_id=1,
        name="Item Descontinuado",
        sku="DSC-003",
        unit_price=Decimal("100.00"),
        quantity=Decimal("10.000"),
        active=False,
    )

    session.add_all([company, user, customer, p1, p2, p_inactive])
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
    token = create_access_token(user_id=1, username="caixa1", roles=["operator"])
    return {"Authorization": f"Bearer {token}"}


def test_create_sale_single_item(client, auth_headers, db):
    payload = {
        "company_id": 1,
        "customer_id": 1,
        "payment_method": "cash",
        "discount": "0.00",
        "items": [
            {
                "product_id": 1,
                "quantity": "2.0",
            }
        ],
    }

    response = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()

    assert data["invoice_number"].startswith("FT ")
    assert float(data["total_amount"]) == 900.00  # 2 * 450
    assert float(data["tax_amount"]) == 144.00   # 16% de 900
    assert float(data["net_amount"]) == 1044.00   # 900 + 144
    assert len(data["items"]) == 1

    # Verificar baixa de estoque
    product = db.query(Product).filter(Product.id == 1).first()
    assert float(product.quantity) == 98.0  # 100 - 2

    # Verificar lançamento contábil gerado
    journal_entry = db.query(JournalEntry).first()
    assert journal_entry is not None
    assert float(journal_entry.amount) == 1044.00

    # Verificar audit log
    audit = db.query(AuditLog).filter(AuditLog.action == "CREATE_SALE").first()
    assert audit is not None


def test_create_sale_multiple_items_and_discount(client, auth_headers, db):
    payload = {
        "company_id": 1,
        "customer_id": 1,
        "payment_method": "mpesa",
        "discount": "50.00",
        "items": [
            {"product_id": 1, "quantity": "1.0"}, # 450 + 72 (IVA) = 522
            {"product_id": 2, "quantity": "1.0"}, # 1200 + 192 (IVA) = 1392
        ],
    }

    response = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()

    assert float(data["total_amount"]) == 1650.00 # 450 + 1200
    assert float(data["tax_amount"]) == 264.00    # 72 + 192
    assert float(data["discount_amount"]) == 50.00
    assert float(data["net_amount"]) == 1864.00   # 1650 + 264 - 50
    assert len(data["items"]) == 2


def test_create_sale_insufficient_stock_fails(client, auth_headers):
    payload = {
        "company_id": 1,
        "payment_method": "cash",
        "items": [
            {
                "product_id": 2,
                "quantity": "10.0",  # Só temos 5.0
            }
        ],
    }

    response = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "Stock insuficiente" in response.json()["detail"]


def test_create_sale_invalid_discount_fails(client, auth_headers):
    payload = {
        "company_id": 1,
        "payment_method": "cash",
        "discount": "1000.00", # Total da venda é 450 + 72 = 522
        "items": [
            {
                "product_id": 1,
                "quantity": "1.0",
            }
        ],
    }

    response = client.post("/api/v1/sales", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "desconto não pode ser superior" in response.json()["detail"]


def test_get_sales_list_and_filters(client, auth_headers):
    # Criar uma venda primeiro
    client.post(
        "/api/v1/sales",
        json={"company_id": 1, "items": [{"product_id": 1, "quantity": "1.0"}], "payment_method": "cash"},
        headers=auth_headers,
    )

    response = client.get("/api/v1/sales?payment_method=cash", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_get_today_revenue(client, auth_headers):
    client.post(
        "/api/v1/sales",
        json={"company_id": 1, "items": [{"product_id": 1, "quantity": "1.0"}], "payment_method": "emola"},
        headers=auth_headers,
    )

    response = client.get("/api/v1/sales/today/total", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_sales_count"] >= 1
    assert float(data["total_revenue"]) > 0
    assert "emola" in data["payment_breakdown"]


def test_print_receipt(client, auth_headers):
    res_sale = client.post(
        "/api/v1/sales",
        json={"company_id": 1, "items": [{"product_id": 1, "quantity": "1.0"}], "payment_method": "cash"},
        headers=auth_headers,
    )
    sale_id = res_sale.json()["id"]

    response = client.post(f"/api/v1/sales/{sale_id}/print", headers=auth_headers)
    assert response.status_code == 200
    assert "COMPROVATIVO DE VENDA" in response.text
    assert "TOTAL LÍQUIDO" in response.text


def test_delete_sale_restores_stock(client, auth_headers, db):
    # Criar venda de 2 unidades
    res_sale = client.post(
        "/api/v1/sales",
        json={"company_id": 1, "items": [{"product_id": 1, "quantity": "2.0"}], "payment_method": "cash"},
        headers=auth_headers,
    )
    sale_id = res_sale.json()["id"]

    # Stock caiu de 100 para 98
    p = db.query(Product).filter(Product.id == 1).first()
    assert float(p.quantity) == 98.0

    # Cancelar venda
    del_res = client.delete(f"/api/v1/sales/{sale_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Stock deve ter voltado para 100
    db.expire_all()
    p_restored = db.query(Product).filter(Product.id == 1).first()
    assert float(p_restored.quantity) == 100.0
