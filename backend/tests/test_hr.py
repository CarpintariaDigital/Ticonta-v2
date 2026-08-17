from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.employee import Attendance, AttendanceStatus, Employee, Payroll, PayrollStatus
from app.models.entities import Company
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

    company = Company(id=1, name="TiConta RH Moçambique Lda", nuit="400999111", currency="MZN")
    user = User(id=1, username="gestor_rh", email="rh@ticonta.co.mz", pin_hash="hash123", role="admin")
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
    token = create_access_token(user_id=1, username="gestor_rh", roles=["admin"])
    return {"Authorization": f"Bearer {token}"}


def test_create_employee_and_attendance(client, auth_headers):
    # 1. Cadastrar Empregado com Salário de 30.000 MZN
    payload = {
        "company_id": 1,
        "first_name": "Manuel",
        "last_name": "Cossa",
        "email": "manuel.cossa@empresa.co.mz",
        "phone": "+258 84 777 6655",
        "nuit": "100200300",
        "inss_number": "99887766",
        "position": "Carpinteiro Chefe",
        "department": "Produção",
        "salary": "30000.00",
        "start_date": "2026-08-01",
    }

    res = client.post("/api/v1/hr/employees", json=payload, headers=auth_headers)
    assert res.status_code == 201
    emp = res.json()
    emp_id = emp["id"]

    assert emp["full_name"] == "Manuel Cossa"
    assert float(emp["salary"]) == 30000.00
    assert emp["inss_number"] == "99887766"

    # 2. Registar Presença Diária
    att_res = client.post(
        "/api/v1/hr/attendance",
        json={"employee_id": emp_id, "date": "2026-08-14", "status": "present", "hours": "8.00"},
        headers=auth_headers,
    )
    assert att_res.status_code == 201
    att = att_res.json()
    assert att["status"] == "present"
    assert float(att["hours"]) == 8.00


def test_payroll_generation_with_inss_and_irps(client, auth_headers):
    # Criar 2 empregados:
    # 1. Salário 25.000 MZN
    # 2. Salário 50.000 MZN
    client.post(
        "/api/v1/hr/employees",
        json={
            "company_id": 1,
            "first_name": "Ana",
            "last_name": "Mabote",
            "position": "Administrativa",
            "salary": "25000.00",
            "nuit": "100100100",
            "inss_number": "11122233",
        },
        headers=auth_headers,
    )

    client.post(
        "/api/v1/hr/employees",
        json={
            "company_id": 1,
            "first_name": "Carlos",
            "last_name": "Machel",
            "position": "Engenheiro Civil",
            "salary": "50000.00",
            "nuit": "200200200",
            "inss_number": "44455566",
        },
        headers=auth_headers,
    )

    # Gerar Folha do Mês 2026-08
    gen_res = client.post(
        "/api/v1/hr/payroll/generate",
        json={"company_id": 1, "period": "2026-08"},
        headers=auth_headers,
    )
    assert gen_res.status_code == 200
    payroll_data = gen_res.json()

    assert payroll_data["total_employees"] == 2
    assert float(payroll_data["total_gross"]) == 75000.00  # 25k + 50k

    # INSS:
    # Empregado: 3% de 75.000 = 2.250 MZN
    # Patronal: 4% de 75.000 = 3.000 MZN
    # Total Guia INSS: 7% de 75.000 = 5.250 MZN
    assert float(payroll_data["total_inss_employee"]) == 2250.00
    assert float(payroll_data["total_inss_employer"]) == 3000.00
    assert float(payroll_data["total_inss_due"]) == 5250.00


def test_export_inss_xml_declaration(client, auth_headers):
    # Cadastrar funcionário e gerar folha
    client.post(
        "/api/v1/hr/employees",
        json={
            "company_id": 1,
            "first_name": "Joao",
            "last_name": "Tembe",
            "position": "Operador",
            "salary": "20000.00",
            "nuit": "300300300",
            "inss_number": "88899900",
        },
        headers=auth_headers,
    )

    client.post(
        "/api/v1/hr/payroll/generate",
        json={"company_id": 1, "period": "2026-08"},
        headers=auth_headers,
    )

    # Exportar XML SISSMO
    xml_res = client.get("/api/v1/hr/payroll/2026-08/export-xml?company_id=1", headers=auth_headers)
    assert xml_res.status_code == 200
    xml_data = xml_res.json()

    assert "xml_content" in xml_data
    assert "<DeclaracaoINSS" in xml_data["xml_content"]
    assert "<NumeroINSS>88899900</NumeroINSS>" in xml_data["xml_content"]
    assert "<Desconto3Pct>600.00</Desconto3Pct>" in xml_data["xml_content"]  # 3% de 20.000
    assert "<Patronal4Pct>800.00</Patronal4Pct>" in xml_data["xml_content"]  # 4% de 20.000
