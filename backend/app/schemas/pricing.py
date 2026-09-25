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


# ==========================================
# GESTOR DE PREÇOS, DESCONTOS E MÓDULOS ERP
# ==========================================

class ModulePriceItem(BaseModel):
    module_id: str = Field(..., description="Identificador único do módulo (ex: pos, restaurant, accounting)")
    name: str = Field(..., description="Nome de apresentação do módulo")
    category: str = Field("core", description="Categoria: core, retail, operations, finance, agro")
    base_price_mzn: Decimal = Field(default=Decimal("300.00"), description="Preço base mensal em Meticais (MT)")
    discount_percent: Decimal = Field(default=Decimal("0.00"), description="Desconto promocional (%)")
    is_active: bool = Field(default=True, description="Módulo disponível para contratação")
    description: str = Field("", description="Descrição breve do que o módulo oferece")
    icon: str = Field("Layers", description="Nome do ícone Lucide")


class PlanTierItem(BaseModel):
    plan_id: str
    name: str
    monthly_price_mzn: Decimal
    included_modules: List[str]
    discount_annual_percent: Decimal = Decimal("20.00")
    badge: str = ""
    description: str = ""


class DiscountRuleItem(BaseModel):
    rule_id: str
    name: str
    code: Optional[str] = None
    discount_percent: Decimal = Decimal("0.00")
    discount_fixed_mzn: Decimal = Decimal("0.00")
    min_modules_count: int = 1
    billing_cycle: Optional[str] = None  # monthly, semiannual, annual
    is_active: bool = True


class ModulePricingCatalogResponse(BaseModel):
    currency: str = "MZN"
    starting_price_mzn: Decimal = Field(default=Decimal("300.00"), description="Preço de partida mínimo (300 MT)")
    modules: List[ModulePriceItem]
    plans: List[PlanTierItem]
    discount_rules: List[DiscountRuleItem]


class UpdateModulePriceItem(BaseModel):
    module_id: str
    base_price_mzn: Decimal
    discount_percent: Optional[Decimal] = Decimal("0.00")
    is_active: Optional[bool] = True


class UpdateModulePricingRequest(BaseModel):
    modules: List[UpdateModulePriceItem]
    starting_price_mzn: Optional[Decimal] = None


class CalculateCustomPlanRequest(BaseModel):
    selected_modules: List[str] = Field(..., description="Lista de IDs dos módulos escolhidos")
    billing_cycle: str = Field("monthly", description="Ciclo: monthly, semiannual, annual")
    coupon_code: Optional[str] = Field(None, description="Código de cupão promocional opcional")


class CustomPlanItemBreakdown(BaseModel):
    module_id: str
    name: str
    base_price_mzn: Decimal
    discount_mzn: Decimal
    net_price_mzn: Decimal


class CalculateCustomPlanResponse(BaseModel):
    selected_modules_count: int
    billing_cycle: str
    billing_months: int
    monthly_subtotal_mzn: Decimal
    cycle_subtotal_mzn: Decimal
    cycle_discount_mzn: Decimal
    cycle_total_mzn: Decimal
    effective_monthly_mzn: Decimal
    applied_discounts: List[str]
    breakdown: List[CustomPlanItemBreakdown]
    currency: str = "MZN"

