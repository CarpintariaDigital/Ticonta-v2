from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.compliance.pgc import is_valid_account, validate_account_code
from app.models.entities import Company
from app.models.account import Account, JournalEntry
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

    company = Company(
        id=1,
        name="Empresa Contábil Moçambique Lda",
        nuit="400111222",
        currency="MZN",
    )
    user = User(
        id=1,
        username="contabilista",
        email="contabilista@empresa.co.mz",
        pin_hash="pin1234",
        role="admin",
    )
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
    token = create_access_token(user_id=1, username="contabilista", roles=["admin"])
    return {"Authorization": f"Bearer {token}"}


def test_pgc_code_validation():
    assert validate_account_code("1.1") is True
    assert validate_account_code("1.1.1") is True
    assert validate_account_code("7.1.1") is True
    assert validate_account_code("9.9.9") is False  # PGC vai de 1 a 8
    assert validate_account_code("invalid_code") is False

    assert is_valid_account("1.1.1") is True
    assert is_valid_account("7.1.1") is True
    assert is_valid_account("1.9.9.9") is False


def test_get_chart_of_accounts_seeds_automatically(client, auth_headers):
    response = client.get("/api/v1/accounting/chart-of-accounts?company_id=1", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 20
    # Checar se inclui contas essenciais PGC
    codes = [acc["account_code"] for acc in data]
    assert "1.1.1" in codes
    assert "1.2.1" in codes
    assert "7.1.1" in codes
    assert "6.1" in codes


def test_create_journal_entry_double_entry(client, auth_headers, db):
    # Carregar plano de contas
    client.get("/api/v1/accounting/chart-of-accounts?company_id=1", headers=auth_headers)

    caixa_acc = db.query(Account).filter(Account.account_code == "1.1.1").first()
    vendas_acc = db.query(Account).filter(Account.account_code == "7.1.1").first()

    payload = {
        "company_id": 1,
        "debit_account_id": caixa_acc.id,
        "credit_account_id": vendas_acc.id,
        "amount": "5000.00",
        "description": "Venda a pronto pagamento em dinheiro",
    }

    response = client.post("/api/v1/accounting/journal-entries", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()

    assert data["entry_number"].startswith("JE-")
    assert float(data["amount"]) == 5000.00
    assert data["debit_account_code"] == "1.1.1"
    assert data["credit_account_code"] == "7.1.1"

    # Verificar saldo atualizado das contas
    db.expire_all()
    caixa_refreshed = db.query(Account).filter(Account.id == caixa_acc.id).first()
    vendas_refreshed = db.query(Account).filter(Account.id == vendas_acc.id).first()

    assert float(caixa_refreshed.debit_balance) == 5000.00
    assert float(caixa_refreshed.current_balance) == 5000.00  # Asset: Debit - Credit

    assert float(vendas_refreshed.credit_balance) == 5000.00
    assert float(vendas_refreshed.current_balance) == 5000.00  # Revenue: Credit - Debit


def test_create_journal_entry_same_account_fails(client, auth_headers, db):
    client.get("/api/v1/accounting/chart-of-accounts?company_id=1", headers=auth_headers)
    caixa_acc = db.query(Account).filter(Account.account_code == "1.1.1").first()

    payload = {
        "company_id": 1,
        "debit_account_id": caixa_acc.id,
        "credit_account_id": caixa_acc.id,
        "amount": "100.00",
        "description": "Lançamento inválido mesma conta",
    }

    response = client.post("/api/v1/accounting/journal-entries", json=payload, headers=auth_headers)
    assert response.status_code == 422  # Validação Pydantic


def test_trial_balance_is_balanced(client, auth_headers, db):
    # Carregar contas
    client.get("/api/v1/accounting/chart-of-accounts?company_id=1", headers=auth_headers)

    caixa_acc = db.query(Account).filter(Account.account_code == "1.1.1").first()
    vendas_acc = db.query(Account).filter(Account.account_code == "7.1.1").first()

    # Lançamento 1: 3000 MZN
    client.post(
        "/api/v1/accounting/journal-entries",
        json={
            "company_id": 1,
            "debit_account_id": caixa_acc.id,
            "credit_account_id": vendas_acc.id,
            "amount": "3000.00",
            "description": "Venda 1",
        },
        headers=auth_headers,
    )

    tb_res = client.get("/api/v1/accounting/trial-balance?company_id=1", headers=auth_headers)
    assert tb_res.status_code == 200
    tb_data = tb_res.json()

    assert tb_data["is_balanced"] is True
    assert float(tb_data["sum_total_debits"]) == 3000.00
    assert float(tb_data["sum_total_credits"]) == 3000.00


def test_income_statement_and_balance_sheet(client, auth_headers, db):
    client.get("/api/v1/accounting/chart-of-accounts?company_id=1", headers=auth_headers)

    bancos_acc = db.query(Account).filter(Account.account_code == "1.2.1").first()
    vendas_acc = db.query(Account).filter(Account.account_code == "7.1.1").first()
    gastos_acc = db.query(Account).filter(Account.account_code == "6.3.1").first()

    # Venda de 10.000 MZN (Depósito no banco)
    client.post(
        "/api/v1/accounting/journal-entries",
        json={
            "company_id": 1,
            "debit_account_id": bancos_acc.id,
            "credit_account_id": vendas_acc.id,
            "amount": "10000.00",
            "description": "Venda via transferência bancária",
        },
        headers=auth_headers,
    )

    # Pagamento de Eletricidade: 2.000 MZN (Sai do banco)
    client.post(
        "/api/v1/accounting/journal-entries",
        json={
            "company_id": 1,
            "debit_account_id": gastos_acc.id,
            "credit_account_id": bancos_acc.id,
            "amount": "2000.00",
            "description": "Pagamento EDM Electricidade",
        },
        headers=auth_headers,
    )

    # DRE (Demonstração de Resultados)
    dre_res = client.get("/api/v1/accounting/income-statement?company_id=1", headers=auth_headers)
    assert dre_res.status_code == 200
    dre_data = dre_res.json()
    assert float(dre_data["total_revenues"]) == 10000.00
    assert float(dre_data["total_expenses"]) == 2000.00
    assert float(dre_data["net_income"]) == 8000.00

    # Balanço Patrimonial (Balance Sheet)
    bs_res = client.get("/api/v1/accounting/balance-sheet?company_id=1", headers=auth_headers)
    assert bs_res.status_code == 200
    bs_data = bs_res.json()
    assert float(bs_data["total_assets"]) == 8000.00  # Banco: 10.000 - 2.000 = 8.000
    assert float(bs_data["retained_earnings"]) == 8000.00
    assert bs_data["is_balanced"] is True
