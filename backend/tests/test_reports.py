from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.entities import Company
from app.models.sale import Sale, SaleItem, Payment
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

    company = Company(id=1, name="TiConta Relatórios Lda", nuit="400111222", currency="MZN")
    user = User(id=1, username="diretor_executivo", email="diretor@ticonta.co.mz", pin_hash="hash123", role="admin")
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
    token = create_access_token(user_id=1, username="diretor_executivo", roles=["admin"])
    return {"Authorization": f"Bearer {token}"}


def test_reports_endpoints(client, auth_headers):
    # 1. Sales Report
    sales_res = client.get("/api/v1/reports/sales?company_id=1", headers=auth_headers)
    assert sales_res.status_code == 200
    sales_data = sales_res.json()
    assert "total_revenue" in sales_data
    assert "average_ticket" in sales_data

    # 2. Financial Report
    fin_res = client.get("/api/v1/reports/financial?company_id=1&period=2026-08", headers=auth_headers)
    assert fin_res.status_code == 200
    fin_data = fin_res.json()
    assert "total_income" in fin_data
    assert "net_cash_flow" in fin_data

    # 3. CRM Report
    crm_res = client.get("/api/v1/reports/crm?company_id=1&period=2026-08", headers=auth_headers)
    assert crm_res.status_code == 200
    crm_data = crm_res.json()
    assert "pipeline_total_value" in crm_data
    assert "win_rate_percentage" in crm_data

    # 4. Projects Report
    proj_res = client.get("/api/v1/reports/projects?company_id=1&period=2026-08", headers=auth_headers)
    assert proj_res.status_code == 200
    proj_data = proj_res.json()
    assert "total_budget_contracted" in proj_data
    assert "overall_profit" in proj_data

    # 5. HR Report
    hr_res = client.get("/api/v1/reports/hr?company_id=1&period=2026-08", headers=auth_headers)
    assert hr_res.status_code == 200
    hr_data = hr_res.json()
    assert "total_gross_payroll" in hr_data
    assert "total_inss_guia" in hr_data

    # 6. Export CSV
    csv_res = client.get("/api/v1/reports/export/csv?report_type=sales&company_id=1", headers=auth_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "TiConta ERP Moçambique" in csv_res.text
