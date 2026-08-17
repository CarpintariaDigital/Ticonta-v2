from datetime import date, timedelta
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient

from app.models.pricing import MarketProductType, PriceSource


def test_market_prices_listing_and_seeding(client: TestClient, db_session):
    """Test getting current market prices with default baseline seeding."""
    res = client.get("/api/v1/market/prices?region=Maputo/Matola")
    assert res.status_code == 200
    prices = res.json()
    assert len(prices) >= 4
    
    product_types = [p["product_type"] for p in prices]
    assert "live_chicken" in product_types
    assert "egg_crate" in product_types

    # Record new survey
    new_survey = client.post("/api/v1/market/prices", json={
        "product_type": "live_chicken",
        "region": "Maputo/Matola",
        "current_price": 290.00,
        "min_price": 270.00,
        "max_price": 315.00,
        "notes": "Pesquisa no Mercado Grossista do Zimpeto",
    })
    assert new_survey.status_code == 201
    survey_data = new_survey.json()
    assert survey_data["product_type"] == "live_chicken"
    assert float(survey_data["current_price"]) == 290.00


def test_market_price_history(client: TestClient, db_session):
    """Test getting market price historical series and averages."""
    res = client.get("/api/v1/market/prices/history?product_type=live_chicken&days=30")
    assert res.status_code == 200
    history = res.json()
    assert history["product_type"] == "live_chicken"
    assert float(history["average_price"]) > 0
    assert len(history["history"]) >= 1


def test_producer_price_setting_and_catalog(client: TestClient, db_session):
    """Test setting and retrieving the producer's price catalog."""
    # 1. Set own price for Live Chicken
    res = client.post("/api/v1/producer/prices?company_id=1", json={
        "product_type": "live_chicken",
        "unit_price": 275.00,
        "min_order_quantity": 10,
        "bulk_discount_percent": 5.0,
        "notes": "Preço direto da quinta em Matola",
    })
    assert res.status_code == 201
    prod_price = res.json()
    assert prod_price["product_type"] == "live_chicken"
    assert float(prod_price["unit_price"]) == 275.00
    assert float(prod_price["bulk_discount_percent"]) == 5.0

    # 2. Get list of producer prices
    list_res = client.get("/api/v1/producer/prices?company_id=1")
    assert list_res.status_code == 200
    prices = list_res.json()
    assert len(prices) >= 1
    assert any(p["product_type"] == "live_chicken" for p in prices)


def test_flock_production_cost_and_profitability(client: TestClient, db_session):
    """Test calculating full production cost, unit cost and gross margin."""
    # 1. Create Farm & Broiler Flock
    farm = client.post("/api/v1/poultry/farms", json={
        "name": "Quinta Avícola Teste Preços",
        "location": "Matola",
        "total_capacity": 1000,
    }).json()

    flock = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm["id"],
        "species": "chicken_broiler",
        "quantity_at_start": 500,
        "cost_per_bird": 55.00,
    }).json()
    flock_id = flock["id"]

    # 2. Add Feed and Health Costs
    client.post(f"/api/v1/poultry/flocks/{flock_id}/feed", json={"bags_used": 10.0, "cost": 19500.00})
    client.post(f"/api/v1/poultry/flocks/{flock_id}/health", json={
        "disease": "Vacinação Newcastle",
        "treatment": "Vacina",
        "cost": 1500.00,
    })

    # 3. Calculate Profitability with custom selling price of 280 MT
    prof_res = client.get(f"/api/v1/production/{flock_id}/profitability?selling_price=280.00")
    assert prof_res.status_code == 200
    prof = prof_res.json()
    assert prof["flock_id"] == flock_id
    assert float(prof["total_production_cost"]) > 0
    assert float(prof["cost_per_unit"]) > 0
    assert float(prof["projected_gross_profit"]) > 0
    assert prof["profit_margin_percent"] > 0
    assert len(prof["cost_breakdown"]) == 4


def test_optimal_price_suggestion_and_market_comparison(client: TestClient, db_session):
    """Test AI/algorithmic price recommendations and market comparison tool."""
    # Setup flock
    farm = client.post("/api/v1/poultry/farms", json={
        "name": "Quinta Recomendação Preço",
        "location": "Boane",
        "total_capacity": 1000,
    }).json()

    flock = client.post("/api/v1/poultry/flocks", json={
        "farm_id": farm["id"],
        "species": "chicken_broiler",
        "quantity_at_start": 400,
        "cost_per_bird": 55.00,
    }).json()
    flock_id = flock["id"]

    client.post(f"/api/v1/poultry/flocks/{flock_id}/feed", json={"bags_used": 8.0, "cost": 15600.00})

    # 1. Test Price Recommendation
    rec_res = client.get(f"/api/v1/production/{flock_id}/recommendation")
    assert rec_res.status_code == 200
    rec = rec_res.json()
    assert rec["flock_id"] == flock_id
    assert float(rec["cost_per_unit"]) > 0
    assert float(rec["recommended_competitive_price"]) >= float(rec["break_even_price"])
    assert float(rec["recommended_premium_price"]) > float(rec["recommended_competitive_price"])
    assert float(rec["recommended_bulk_price"]) > 0
    assert len(rec["pricing_strategy_notes"]) >= 3

    # 2. Test Market Comparison Tool
    comp_res = client.post("/api/v1/market/compare", json={
        "product_type": "live_chicken",
        "my_price": 260.00,
        "region": "Maputo/Matola",
    })
    assert comp_res.status_code == 200
    comp = comp_res.json()
    assert comp["positioning"] == "below_market"
    assert comp["difference_percentage"] < 0
    assert "abaixo da média" in comp["analysis"]
