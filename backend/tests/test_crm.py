from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.entities import Company
from app.models.lead import Lead, LeadStage
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

    company = Company(id=1, name="TiConta CRM Enterprise", nuit="400123999", currency="MZN")
    user = User(id=1, username="comercial_lead", email="vendas@ticonta.co.mz", pin_hash="hash123", role="admin")
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
    token = create_access_token(user_id=1, username="comercial_lead", roles=["admin"])
    return {"Authorization": f"Bearer {token}"}


def test_crm_create_lead_and_lifecycle(client, auth_headers):
    # 1. Criar Lead
    payload = {
        "company_id": 1,
        "name": "Construções do Norte Lda",
        "email": "compras@constnorte.co.mz",
        "phone": "+258 84 999 8877",
        "source": "referral",
        "value": "150000.00",
        "probability": 20,
        "notes": "Cliente interessado em software e PDVs completos",
    }

    create_res = client.post("/api/v1/crm/leads", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    lead = create_res.json()
    lead_id = lead["id"]

    assert lead["name"] == "Construções do Norte Lda"
    assert lead["stage"] == "novo"
    assert float(lead["value"]) == 150000.00
    assert len(lead["interactions"]) >= 1  # Interação inicial automática

    # 2. Adicionar interação comercial
    inter_payload = {
        "type": "meeting",
        "description": "Reunião de apresentação remota realizada. Proposta solicitada.",
    }
    inter_res = client.post(f"/api/v1/crm/leads/{lead_id}/interactions", json=inter_payload, headers=auth_headers)
    assert inter_res.status_code == 201
    inter_data = inter_res.json()
    assert inter_data["type"] == "meeting"
    assert inter_data["user_name"] == "comercial_lead"

    # 3. Mover estágio para Proposta
    move_res = client.post(
        f"/api/v1/crm/leads/{lead_id}/stage",
        json={"stage": "proposta", "notes": "Proposta comercial enviada no valor de 150.000 MZN"},
        headers=auth_headers,
    )
    assert move_res.status_code == 200
    assert move_res.json()["stage"] == "proposta"
    assert move_res.json()["probability"] == 60

    # 4. Mover estágio para Ganho (Fecho)
    won_res = client.post(
        f"/api/v1/crm/leads/{lead_id}/stage",
        json={"stage": "ganho", "notes": "Contrato assinado!"},
        headers=auth_headers,
    )
    assert won_res.status_code == 200
    assert won_res.json()["stage"] == "ganho"
    assert won_res.json()["probability"] == 100


def test_crm_pipeline_and_analytics(client, auth_headers):
    # Criar 2 leads: 1 Ganho (100k) e 1 Perdido (50k)
    client.post(
        "/api/v1/crm/leads",
        json={"company_id": 1, "name": "Lead Ganho", "value": "100000.00", "source": "whatsapp"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/crm/leads",
        json={"company_id": 1, "name": "Lead Perdido", "value": "50000.00", "source": "website"},
        headers=auth_headers,
    )

    leads = client.get("/api/v1/crm/leads", headers=auth_headers).json()
    lead_won_id = leads[0]["id"]
    lead_lost_id = leads[1]["id"]

    client.post(f"/api/v1/crm/leads/{lead_won_id}/stage", json={"stage": "ganho"}, headers=auth_headers)
    client.post(f"/api/v1/crm/leads/{lead_lost_id}/stage", json={"stage": "perdido"}, headers=auth_headers)

    # Análise de Pipeline
    pipeline_res = client.get("/api/v1/crm/pipeline?company_id=1", headers=auth_headers)
    assert pipeline_res.status_code == 200
    p_data = pipeline_res.json()
    assert p_data["total_leads"] == 2
    assert float(p_data["total_pipeline_value"]) == 150000.00

    # Métricas de CRM e Win Rate
    analytics_res = client.get("/api/v1/crm/analytics?company_id=1", headers=auth_headers)
    assert analytics_res.status_code == 200
    a_data = analytics_res.json()

    assert a_data["total_leads"] == 2
    assert a_data["won_leads"] == 1
    assert a_data["lost_leads"] == 1
    assert a_data["win_rate_percentage"] == 50.0  # 1 ganho de 2 fechados
    assert float(a_data["total_revenue_won"]) == 100000.00
    assert float(a_data["average_deal_size"]) == 100000.00
