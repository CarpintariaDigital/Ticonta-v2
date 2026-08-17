from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.entities import Company
from app.models.manufacturing import WorkOrder, WorkOrderStatus
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

    company = Company(id=1, name="Carpintaria Industrial Moçambique Lda", nuit="400888999", currency="MZN")
    user = User(id=1, username="mestre_marceneiro", email="fabrica@ticonta.co.mz", pin_hash="hash123", role="admin")
    session.add_all([company, user])
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
    token = create_access_token(user_id=1, username="mestre_marceneiro", roles=["admin"])
    return {"Authorization": f"Bearer {token}"}


def test_budget_calculator_precision(client, auth_headers):
    # Material: 10.000 MZN
    # Mão de obra: 20h a 250 MZN/h = 5.000 MZN
    # Custo direto = 15.000 MZN
    # Overhead 15% = 2.250 MZN
    # Custo Total = 17.250 MZN
    # Margem 30% ("por dentro"): 17.250 / 0.70 = 24.642,86 MZN
    payload = {
        "material_cost": "10000.00",
        "labor_hours": "20.00",
        "labor_rate": "250.00",
        "overhead_percentage": "15.00",
        "margin_percentage": "30.00",
    }

    res = client.post("/api/v1/manufacturing/budget/calculate", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert float(data["labor_cost"]) == 5000.00
    assert float(data["overhead_cost"]) == 2250.00
    assert float(data["total_direct_cost"]) == 17250.00
    assert float(data["final_price"]) == 24642.86
    assert float(data["profit"]) == 7392.86


def test_cutting_plan_calculation(client, auth_headers):
    # Chapa padrão 2750 x 1830 mm
    # Peças: 4 laterais de 800 x 600 mm e 2 portas de 1200 x 500 mm
    payload = {
        "sheet_length": 2750.0,
        "sheet_width": 1830.0,
        "blade_thickness": 4.0,
        "pieces": [
            {"name": "Lateral Armário", "length": 800.0, "width": 600.0, "quantity": 4},
            {"name": "Porta Principal", "length": 1200.0, "width": 500.0, "quantity": 2},
        ],
    }

    res = client.post("/api/v1/manufacturing/cutting-plan/calculate", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert data["total_pieces"] == 6
    assert data["total_sheets_needed"] >= 1
    assert data["efficiency_percentage"] > 0
    assert len(data["placed_pieces"]) == 6


def test_work_order_lifecycle(client, auth_headers):
    # Criar Ordem de Produção (OP)
    payload = {
        "company_id": 1,
        "description": "Fabrico de 10 Balcões de Recepção em MDF Carvalho",
        "budget": "85000.00",
        "materials": [
            {"name": "Chapa MDF 18mm Carvalho", "quantity": "5", "unit": "chapa", "unit_price": "4500.00"},
            {"name": "Fita de Bordo 22mm", "quantity": "2", "unit": "rolo", "unit_price": "1200.00"},
        ],
    }

    res = client.post("/api/v1/manufacturing/work-orders", json=payload, headers=auth_headers)
    assert res.status_code == 201
    wo = res.json()

    assert "OP-" in wo["order_number"]
    assert wo["status"] == "pending"
    assert len(wo["materials"]) == 2

    # Listar OPs
    list_res = client.get("/api/v1/manufacturing/work-orders?company_id=1", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
