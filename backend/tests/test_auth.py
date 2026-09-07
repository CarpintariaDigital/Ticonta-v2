from datetime import timedelta
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from main import app
from app.routes.auth import _login_attempts

# Setup SQLite in-memory DB for tests
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
    _login_attempts.clear()
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


def test_register_user_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "mario", "pin": "1234", "role": "admin", "email": "mario@ticonta.co.mz"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "mario"
    assert data["role"] == "admin"
    assert "id" in data
    assert "pin" not in data
    assert "pin_hash" not in data


def test_register_user_duplicate_fails(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "mario", "pin": "1234", "role": "admin"},
    )
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "mario", "pin": "9999", "role": "operator"},
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "carlos", "pin": "4321", "role": "manager"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "carlos", "pin": "4321"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0


def test_login_wrong_pin_fails(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "ana", "pin": "1111", "role": "operator"},
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "ana", "pin": "0000"},
    )
    assert response.status_code == 401
    assert "Invalid username or PIN" in response.json()["detail"]


def test_login_user_not_found(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "nonexistent", "pin": "1111"},
    )
    assert response.status_code == 401
    assert "Invalid username or PIN" in response.json()["detail"]


def test_token_refresh_flow(client):
    reg = client.post(
        "/api/v1/auth/register",
        json={"username": "fatima", "pin": "5678", "role": "operator"},
    )
    assert reg.status_code == 201

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "fatima", "pin": "5678"},
    )
    assert login_res.status_code == 200
    refresh_token = login_res.json()["refresh_token"]

    # Exchange refresh token
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    new_tokens = refresh_res.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens


def test_get_me_with_valid_token(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "joao", "pin": "2222", "role": "admin"},
    )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "joao", "pin": "2222"},
    )
    access_token = login_res.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "joao"
    assert data["role"] == "admin"


def test_expired_access_token_rejected(client):
    client.post(
        "/api/v1/auth/register",
        json={"username": "paulo", "pin": "3333", "role": "operator"},
    )
    
    # Create expired token (-1 minute)
    expired_token = create_access_token(
        user_id=1,
        username="paulo",
        roles=["operator"],
        expires_delta=timedelta(minutes=-1)
    )

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
    assert "Token has expired" in response.json()["detail"]
