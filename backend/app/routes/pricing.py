from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.pricing import (
    MarketPriceCreate,
    MarketPriceResponse,
    MarketPriceHistoryResponse,
    ProducerPriceCreate,
    ProducerPriceResponse,
    FlockProfitabilityResponse,
    PriceRecommendationResponse,
    MarketComparisonRequest,
    MarketComparisonResponse,
)
from app.services.pricing import PricingService

router = APIRouter(tags=["Market & Producer Pricing (Poultry & Eggs)"])


@router.get("/api/v1/market/prices", response_model=List[MarketPriceResponse])
def get_market_prices(
    region: Optional[str] = Query("Maputo/Matola", description="Mercado / Região"),
    db: Session = Depends(get_db),
):
    """Listar cotações de mercado atuais para todas as categorias de aves e ovos."""
    service = PricingService(db)
    return service.list_all_market_prices(region=region)


@router.get("/api/v1/market/prices/history", response_model=MarketPriceHistoryResponse)
def get_market_price_history(
    product_type: str = Query("live_chicken", description="egg_dozen, egg_crate, live_chicken, slaughtered_chicken"),
    region: Optional[str] = Query("Maputo/Matola"),
    days: int = Query(30, ge=7, le=180),
    db: Session = Depends(get_db),
):
    """Obter série histórica e evolução de preços no mercado de referência."""
    service = PricingService(db)
    return service.get_market_price_history(product_type=product_type, region=region, days=days)


@router.post("/api/v1/market/prices", response_model=MarketPriceResponse, status_code=status.HTTP_201_CREATED)
def record_market_price(
    data: MarketPriceCreate,
    db: Session = Depends(get_db),
):
    """Registar nova pesquisa de preço / cotação de mercado."""
    service = PricingService(db)
    return service.record_market_price(data=data)


@router.get("/api/v1/producer/prices", response_model=List[ProducerPriceResponse])
def get_producer_prices(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Listar tabela de preços praticada pela quinta / produtor."""
    service = PricingService(db)
    return service.get_producer_prices(company_id=company_id)


@router.post("/api/v1/producer/prices", response_model=ProducerPriceResponse, status_code=status.HTTP_201_CREATED)
def set_producer_price(
    data: ProducerPriceCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Definir ou atualizar tabela de preços do produtor."""
    service = PricingService(db)
    return service.set_producer_price(company_id=company_id, data=data)


@router.get("/api/v1/production/{flock_id}/profitability", response_model=FlockProfitabilityResponse)
def get_flock_profitability(
    flock_id: int,
    selling_price: Optional[Decimal] = Query(None, description="Preço de venda simulado"),
    db: Session = Depends(get_db),
):
    """Calcular rentabilidade, custos unitários e margem de lucro real do lote."""
    service = PricingService(db)
    try:
        return service.get_flock_profitability(flock_id=flock_id, selling_price=selling_price)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/api/v1/production/{flock_id}/recommendation", response_model=PriceRecommendationResponse)
def suggest_optimal_price(
    flock_id: int,
    db: Session = Depends(get_db),
):
    """Obter recomendação de preço ótimo de venda baseado no custo zootécnico e mercado."""
    service = PricingService(db)
    try:
        return service.suggest_optimal_price(flock_id=flock_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/api/v1/market/compare", response_model=MarketComparisonResponse)
def compare_price_with_market(
    data: MarketComparisonRequest,
    db: Session = Depends(get_db),
):
    """Comparar preço ofertado pelo produtor com a média de mercado."""
    service = PricingService(db)
    return service.compare_with_market(
        product_type=data.product_type,
        my_price=data.my_price,
        region=data.region or "Maputo/Matola"
    )
