from datetime import datetime, date, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from app.models.poultry import Farm, Flock, PoultrySpecies, FlockStatus, EggQuality


def test_farm_and_flock_creation(client: TestClient, db_session):
    """Test creating a poultry farm and initiating a new flock."""
    # 1. Create Farm
    farm_res = client.post("/api/v1/poultry/farms", json={
        "name": "Quinta Avícola Matola-Rio",
        "location": "Matola-Rio, Bairro Mussumbuluco, Província de Maputo",
        "total_capacity": 5000,
    })
    assert farm_res.status_code == 201
    farm = farm_res.json()
    assert farm["name"] == "Quinta Avícola Matola-Rio"
    assert farm["total_capacity"] == 5000
    farm_id = farm["id"]

    # 2. Create Broiler Flock
    flock_res = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm_id,
        "species": "chicken_broiler",
        "quantity_at_start": 1000,
        "cost_per_bird": 55.00,
        "feed_type": "Ração Inicial 50kg",
        "notes": "Lote Cobb 500 de 1 dia de idade fornecido pela Higest",
    })
    assert flock_res.status_code == 201
    flock = flock_res.json()
    assert flock["flock_number"].startswith("LOTE-")
    assert flock["species"] == "chicken_broiler"
    assert flock["quantity_at_start"] == 1000
    assert flock["quantity_current"] == 1000
    assert float(flock["cost_per_bird"]) == 55.00
    assert flock["status"] == "growing"
    assert flock["expected_slaughter_date"] is not None


def test_egg_production_recording(client: TestClient, db_session):
    """Test recording daily egg collections for layer hens."""
    # 1. Create Farm & Layer Flock
    farm = client.post("/api/v1/poultry/farms", json={
        "name": "Quinta de Poedeiras Boane",
        "location": "Boane, Campo 2",
        "total_capacity": 2000,
    }).json()

    flock = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm["id"],
        "species": "chicken_layer",
        "quantity_at_start": 500,
        "cost_per_bird": 120.00,
        "feed_type": "Ração Postura",
    }).json()
    flock_id = flock["id"]

    # 2. Record Daily Egg Harvest
    res = client.post(f"/api/v1/poultry/flocks/{flock_id}/production", json={
        "quantity": 420,
        "quality": "grade_a",
        "broken_quantity": 8,
        "notes": "Postura da manhã e tarde",
    })
    assert res.status_code == 201
    data = res.json()
    assert data["quantity"] == 420
    assert data["quality"] == "grade_a"
    assert data["broken_quantity"] == 8

    # Verify flock status advanced to 'producing'
    flock_updated = client.get(f"/api/v1/poultry/flocks/{flock_id}").json()
    assert flock_updated["status"] == "producing"


def test_feed_consumption_and_mortality_tracking(client: TestClient, db_session):
    """Test recording feed usage and bird mortality with automatic count reductions."""
    # 1. Setup Farm & Flock
    farm = client.post("/api/v1/poultry/farms", json={
        "name": "Exploração Avícola Marracuene",
        "location": "Marracuene, Vila Sede",
        "total_capacity": 3000,
    }).json()

    flock = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm["id"],
        "species": "chicken_broiler",
        "quantity_at_start": 800,
        "cost_per_bird": 55.00,
    }).json()
    flock_id = flock["id"]

    # 2. Record Feed Consumption
    feed_res = client.post(f"/api/v1/poultry/flocks/{flock_id}/feed", json={
        "bags_used": 4.0,
        "kg_used": 200.0,
        "cost": 7800.00,
        "notes": "Consumo dos primeiros 7 dias",
    })
    assert feed_res.status_code == 201
    assert float(feed_res.json()["kg_used"]) == 200.0
    assert float(feed_res.json()["cost"]) == 7800.00

    # 3. Record Bird Mortality
    mort_res = client.post(f"/api/v1/poultry/flocks/{flock_id}/mortality", json={
        "quantity": 12,
        "cause": "heat_stress",
        "notes": "Onda de calor na tarde",
    })
    assert mort_res.status_code == 201
    assert mort_res.json()["quantity"] == 12

    # Check flock current quantity decreased
    flock_detail = client.get(f"/api/v1/poultry/flocks/{flock_id}").json()
    assert flock_detail["quantity_at_start"] == 800
    assert flock_detail["quantity_current"] == 788  # 800 - 12


def test_health_issues_and_veterinary_logs(client: TestClient, db_session):
    """Test logging disease, medication, and vaccination costs."""
    farm = client.post("/api/v1/poultry/farms", json={
        "name": "Quinta Avícola Manhiça",
        "location": "Manhiça",
        "total_capacity": 1000,
    }).json()

    flock = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm["id"],
        "species": "chicken_broiler",
        "quantity_at_start": 500,
        "cost_per_bird": 55.00,
    }).json()

    res = client.post(f"/api/v1/poultry/flocks/{flock['id']}/health", json={
        "disease": "Vacinação Newcastle + Gumboro",
        "birds_affected": 500,
        "treatment": "Vacina liofilizada na água de beber com corante azul",
        "cost": 1500.00,
        "notes": "Administrado às 06:00",
    })
    assert res.status_code == 201
    assert res.json()["disease"] == "Vacinação Newcastle + Gumboro"
    assert float(res.json()["cost"]) == 1500.00


def test_performance_metrics_and_production_forecast(client: TestClient, db_session):
    """Test calculating FCR, mortality rate, cost per bird, and future profit forecast."""
    # Setup flock
    farm = client.post("/api/v1/poultry/farms", json={
        "name": "Quinta Agro Frangos Zimpeto",
        "location": "Zimpeto",
        "total_capacity": 2000,
    }).json()

    flock = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm["id"],
        "species": "chicken_broiler",
        "quantity_at_start": 600,
        "cost_per_bird": 55.00,
    }).json()
    flock_id = flock["id"]

    # Add feed and mortality
    client.post(f"/api/v1/poultry/flocks/{flock_id}/feed", json={"bags_used": 6.0, "cost": 11700.00})
    client.post(f"/api/v1/poultry/flocks/{flock_id}/mortality", json={"quantity": 6, "cause": "unknown"})

    # 1. Test Performance
    perf_res = client.get(f"/api/v1/poultry/flocks/{flock_id}/performance")
    assert perf_res.status_code == 200
    perf = perf_res.json()
    assert perf["flock_number"] == flock["flock_number"]
    assert perf["quantity_at_start"] == 600
    assert perf["quantity_current"] == 594
    assert perf["cumulative_mortality"] == 6
    assert perf["mortality_rate_percent"] == 1.0  # (6/600)*100
    assert perf["total_feed_consumed_kg"] == 300.0
    assert float(perf["cost_per_bird_accumulated"]) > 0

    # 2. Test Forecast
    fore_res = client.get(f"/api/v1/poultry/flocks/{flock_id}/forecast")
    assert fore_res.status_code == 200
    forecast = fore_res.json()
    assert forecast["species"] == "chicken_broiler"
    assert forecast["projected_ready_date"] is not None
    assert float(forecast["projected_revenue_at_sale"]) > 0
    assert float(forecast["estimated_total_cost_at_sale"]) > 0
    assert len(forecast["forecast_notes"]) >= 1


def test_comprehensive_production_report(client: TestClient, db_session):
    """Test generating full farm production and profitability report."""
    farm = client.post("/api/v1/poultry/farms", json={
        "name": "Quinta Piloto Gaza",
        "location": "Chókwè, Gaza",
        "total_capacity": 10000,
    }).json()
    farm_id = farm["id"]

    flock = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm_id,
        "species": "chicken_layer",
        "quantity_at_start": 1000,
        "cost_per_bird": 100.00,
    }).json()

    # Add eggs & feed
    client.post(f"/api/v1/poultry/flocks/{flock['id']}/production", json={"quantity": 900, "quality": "grade_a"})
    client.post(f"/api/v1/poultry/flocks/{flock['id']}/feed", json={"bags_used": 10.0, "cost": 19500.00})

    # Generate report
    rep_res = client.get(f"/api/v1/poultry/reports?farm_id={farm_id}")
    assert rep_res.status_code == 200
    rep = rep_res.json()
    assert rep["farm_id"] == farm_id
    assert rep["total_flocks"] == 1
    assert rep["live_birds_count"] == 1000
    assert rep["total_eggs_harvested"] == 900
    assert float(rep["total_feed_cost"]) == 19500.00
    assert float(rep["total_bird_acquisition_cost"]) == 100000.00
