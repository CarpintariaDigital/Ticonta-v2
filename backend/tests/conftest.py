from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token, hash_pin
from app.models.entities import Company, Customer, Product
from app.models.user import User
from app.models.account import Account
from main import app

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Cria e destrói o banco SQLite em memória a cada teste isolado."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed inicial de Company padrão
    company = Company(
        id=1,
        name="Carpintaria e Móveis TiConta Lda",
        nuit="400123789",
        currency="MZN",
    )
    session.add(company)

    # Seed de Usuário Admin
    admin_user = User(
        id=1,
        username="admin_user",
        email="admin@ticonta.co.mz",
        pin_hash=hash_pin("1234"),
        role="admin",
        is_active=True,
    )
    # Seed de Usuário Operador / Vendedor
    operator_user = User(
        id=2,
        username="operador_pos",
        email="pos@ticonta.co.mz",
        pin_hash=hash_pin("4321"),
        role="operator",
        is_active=True,
    )
    session.add_all([admin_user, operator_user])

    # Seed de Clientes
    customer = Customer(
        id=1,
        company_id=1,
        name="Cliente Matola Industrial",
        email="compras@matola.co.mz",
        phone="+258841234567",
        nuit="400999888",
    )
    session.add(customer)

    # Seed de Produtos com Stock inicial
    prod1 = Product(
        id=1,
        company_id=1,
        name="Porta Chanfuta Maciça",
        sku="SKU-PORTA-01",
        unit_price=Decimal("7500.00"),
        cost_price=Decimal("4000.00"),
        quantity=Decimal("15.00"),
        iva_rate=Decimal("16.00"),
        active=True,
    )
    prod2 = Product(
        id=2,
        company_id=1,
        name="Cadeira de Escritório Ergonómica",
        sku="SKU-CAD-02",
        unit_price=Decimal("3200.00"),
        cost_price=Decimal("1800.00"),
        quantity=Decimal("30.00"),
        iva_rate=Decimal("16.00"),
        active=True,
    )
    session.add_all([prod1, prod2])
    session.commit()

    # Limpar cache de relatórios
    from app.services.reports import REPORT_CACHE
    REPORT_CACHE.clear()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """TestClient do FastAPI com override de banco de dados."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_token_headers():
    token = create_access_token(user_id=1, username="admin_user", roles=["admin"])
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def operator_token_headers():
    token = create_access_token(user_id=2, username="operador_pos", roles=["operator"])
    return {"Authorization": f"Bearer {token}"}
