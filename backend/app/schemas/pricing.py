from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class MarketPriceCreate(BaseModel):
    product_type: str = Field(..., description="egg_dozen, egg_crate, live_chicken, slaughtered_chicken, quail_egg_tray, quail_live, duck_live")
    region: str = Field("Maputo/Matola", description="Mercado / Província de referência")
    current_price: Decimal = Field(..., description="Preço de mercado hoje em Meticais (MT)")
    min_price: Optional[Decimal] = Field(None, description="Preço mínimo observado")
    max_price: Optional[Decimal] = Field(None, description="Preço máximo observado")
    price_date: Optional[date] = Field(None, description="Data da pesquisa")
    source: Optional[str] = Field("market_survey", description="producer_data, market_survey, simap_gov")
    notes: Optional[str] = None


class MarketPriceResponse(BaseModel):
    id: int
    product_type: str
    region: str
    current_price: Decimal
    min_price: Optional[Decimal]
    max_price: Optional[Decimal]
    price_date: date
    source: str
    trend: str = Field("stable", description="up, down, stable")
    trend_percentage: float = Field(0.0, description="Variação percentual recente")
    historical_average: Decimal
    notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MarketPriceHistoryItem(BaseModel):
    date: date
    price: Decimal
    min_price: Optional[Decimal]
    max_price: Optional[Decimal]
    source: str


class MarketPriceHistoryResponse(BaseModel):
    product_type: str
    region: str
    days_span: int
    average_price: Decimal
    highest_price: Decimal
    lowest_price: Decimal
    history: List[MarketPriceHistoryItem]


class ProducerPriceCreate(BaseModel):
    product_type: str
    unit_price: Decimal
    min_order_quantity: int = 1
    bulk_discount_percent: Decimal = Decimal("0.00")
    notes: Optional[str] = None


class ProducerPriceUpdate(BaseModel):
    unit_price: Optional[Decimal] = None
    min_order_quantity: Optional[int] = None
    bulk_discount_percent: Optional[Decimal] = None
    active: Optional[bool] = None
    notes: Optional[str] = None


class ProducerPriceResponse(BaseModel):
    id: int
    company_id: int
    product_type: str
    unit_price: Decimal
    min_order_quantity: int
    bulk_discount_percent: Decimal
    active: bool
    notes: Optional[str]
    last_updated: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CostBreakdownItem(BaseModel):
    item: str
    total_cost: Decimal
    percentage: float


class FlockProfitabilityResponse(BaseModel):
    flock_id: int = Field(..., alias="flock_id")
    flock_number: str
    species: str
    quantity_current: int
    total_production_cost: Decimal
    cost_per_unit: Decimal
    suggested_market_price: Decimal
    projected_revenue: Decimal
    projected_gross_profit: Decimal
    profit_margin_percent: float
    break_even_price: Decimal
    cost_breakdown: List[CostBreakdownItem]


class PriceRecommendationResponse(BaseModel):
    flock_id: int
    flock_number: str
    product_type: str
    cost_per_unit: Decimal
    break_even_price: Decimal
    current_market_price: Decimal
    recommended_competitive_price: Decimal
    recommended_premium_price: Decimal
    recommended_bulk_price: Decimal
    estimated_profit_margin_at_recommended: float
    market_positioning: str
    pricing_strategy_notes: List[str]


class MarketComparisonRequest(BaseModel):
    product_type: str
    my_price: Decimal
    region: Optional[str] = "Maputo/Matola"


class MarketComparisonResponse(BaseModel):
    product_type: str
    region: str
    my_price: Decimal
    market_average_price: Decimal
    difference_amount: Decimal
    difference_percentage: float
    positioning: str  # below_market, at_market, above_market, premium
    analysis: str
