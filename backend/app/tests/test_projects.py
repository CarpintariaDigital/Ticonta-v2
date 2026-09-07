from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.entities import Company
from app.models.project import Project, ProjectExpense, ProjectStatus, ProjectTask, TaskStatus
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

    company = Company(id=1, name="Carpintaria e Construções Moçambique Lda", nuit="400123777", currency="MZN")
    user = User(id=1, username="engenheiro_chefe", email="eng@obra.co.mz", pin_hash="hash123", role="admin")
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
    token = create_access_token(user_id=1, username="engenheiro_chefe", roles=["admin"])
    return {"Authorization": f"Bearer {token}"}


def test_projects_lifecycle_and_tasks(client, auth_headers):
    # 1. Criar Projeto com Orçamento de 500.000 MZN
    project_payload = {
        "company_id": 1,
        "name": "Construção de Pavilhão Industrial Matola",
        "description": "Obra civil completa de alvenaria e cobertura metálica",
        "budget": "500000.00",
        "start_date": "2026-09-01",
        "end_date": "2026-12-15",
    }

    res = client.post("/api/v1/projects", json=project_payload, headers=auth_headers)
    assert res.status_code == 201
    p_data = res.json()
    project_id = p_data["id"]

    assert p_data["name"] == "Construção de Pavilhão Industrial Matola"
    assert float(p_data["budget"]) == 500000.00
    assert p_data["status"] == "planning"

    # 2. Adicionar 2 Tarefas no Cronograma
    task1 = client.post(
        f"/api/v1/projects/{project_id}/tasks",
        json={"title": "Fundações e Betonagem", "description": "Escavação e sapatas"},
        headers=auth_headers,
    ).json()

    task2 = client.post(
        f"/api/v1/projects/{project_id}/tasks",
        json={"title": "Montagem da Estrutura Metálica"},
        headers=auth_headers,
    ).json()

    # 3. Concluir 1 Tarefa -> Progresso deve ser 50%
    client.put(
        f"/api/v1/projects/{project_id}/tasks/{task1['id']}",
        json={"status": "completed"},
        headers=auth_headers,
    )

    # 4. Verificar Progresso no Resumo
    summary_res = client.get(f"/api/v1/projects/{project_id}/summary", headers=auth_headers)
    assert summary_res.status_code == 200
    s_data = summary_res.json()
    assert s_data["total_tasks"] == 2
    assert s_data["completed_tasks"] == 1
    assert s_data["progress_percentage"] == 50.0


def test_project_expenses_budget_alerts_and_profit(client, auth_headers):
    # Criar Projeto de 100.000 MZN
    p = client.post(
        "/api/v1/projects",
        json={"company_id": 1, "name": "Reforma Escritórios Sede", "budget": "100000.00"},
        headers=auth_headers,
    ).json()
    project_id = p["id"]

    # 1. Lançar Despesa de Materiais: 50.000 MZN (50% do budget)
    client.post(
        f"/api/v1/projects/{project_id}/expenses",
        json={"description": "Madeira e Verniz", "amount": "50000.00", "category": "material"},
        headers=auth_headers,
    )

    summary1 = client.get(f"/api/v1/projects/{project_id}/summary", headers=auth_headers).json()
    assert float(summary1["actual_cost"]) == 50000.00
    assert float(summary1["remaining_budget"]) == 50000.00
    assert float(summary1["profit"]) == 50000.00
    assert summary1["budget_used_percentage"] == 50.0
    assert summary1["budget_alert"] is False  # Menos de 80%

    # 2. Lançar Despesa Adicional de 35.000 MZN (Total 85.000 MZN = 85%) -> Alerta deve ativar
    client.post(
        f"/api/v1/projects/{project_id}/expenses",
        json={"description": "Mão de Obra de Pintores", "amount": "35000.00", "category": "labor"},
        headers=auth_headers,
    )

    summary2 = client.get(f"/api/v1/projects/{project_id}/summary", headers=auth_headers).json()
    assert float(summary2["actual_cost"]) == 85000.00
    assert float(summary2["profit"]) == 15000.00
    assert summary2["budget_used_percentage"] == 85.0
    assert summary2["budget_alert"] is True  # Acima de 80%
    assert summary2["is_over_budget"] is False
