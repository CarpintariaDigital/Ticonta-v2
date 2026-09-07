from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# =========================================================================
# Farm Schemas
# =========================================================================
class FarmCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Nome da quinta")
    location: str = Field(..., min_length=2, max_length=255, description="Bairro, distrito, cidade")
    total_capacity: int = Field(1000, ge=10, description="Capacidade máxima de aves")
    owner_id: Optional[int] = None
    company_id: Optional[int] = 1


class FarmResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    name: str
    location: str
    total_capacity: int
    owner_id: Optional[int] = None
    active: bool
    created_at: datetime
    updated_at: datetime


# =========================================================================
# Flock Schemas
# =========================================================================
class FlockCreate(BaseModel):
    farm_id: int = Field(..., description="ID da quinta")
    flock_number: Optional[str] = Field(None, description="Código do lote (ex: LOTE-001)")
    species: str = Field("chicken_broiler", description="chicken_broiler, chicken_layer, quail, duck")
    quantity_at_start: int = Field(..., gt=0, description="Quantidade inicial de pintos")
    cost_per_bird: Decimal = Field(Decimal("55.00"), gt=0, description="Custo unitário inicial (MZN)")
    feed_type: Optional[str] = Field("Ração Inicial", description="Tipo de ração atual")
    start_date: Optional[date] = Field(None, description="Data de entrada do lote (default: hoje)")
    expected_slaughter_date: Optional[date] = None
    expected_first_lay_date: Optional[date] = None
    notes: Optional[str] = None


class FlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    flock_number: str
    species: str
    quantity_at_start: int
    quantity_current: int
    cost_per_bird: Decimal
    feed_type: Optional[str] = None
    start_date: date
    expected_slaughter_date: Optional[date] = None
    expected_first_lay_date: Optional[date] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# =========================================================================
# Production & Logs Schemas
# =========================================================================
class EggProductionCreate(BaseModel):
    production_date: Optional[date] = Field(None, description="Data da postura / colheita")
    quantity: int = Field(..., ge=0, description="Total de ovos colhidos")
    quality: str = Field("grade_a", description="grade_a, grade_b, grade_c")
    broken_quantity: int = Field(0, ge=0, description="Ovos rachados / rejeitados")
    notes: Optional[str] = None


class EggProductionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    flock_id: int
    production_date: date
    quantity: int
    quality: str
    broken_quantity: int
    notes: Optional[str] = None
    created_at: datetime


class FeedManagementCreate(BaseModel):
    farm_id: int
    feed_type: str = Field(..., description="Ex: Ração Inicial 50kg, Ração Postura")
    cost_per_bag: Decimal = Field(..., gt=0, description="Preço por saco (MZN)")
    bag_weight_kg: Decimal = Field(Decimal("50.00"), gt=0)
    quantity_in_stock: Decimal = Field(Decimal("0.00"), ge=0)
    supplier: Optional[str] = None
    date_last_purchase: Optional[date] = None


class FeedManagementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    feed_type: str
    cost_per_bag: Decimal
    bag_weight_kg: Decimal
    quantity_in_stock: Decimal
    supplier: Optional[str] = None
    date_last_purchase: Optional[date] = None
    created_at: datetime
    updated_at: datetime


class FeedConsumptionCreate(BaseModel):
    consumption_date: Optional[date] = None
    bags_used: Decimal = Field(..., gt=0, description="Sacos consumidos (ex: 1.5)")
    kg_used: Optional[Decimal] = Field(None, description="Kg consumidos (calculado automaticamente se omitido)")
    feed_id: Optional[int] = None
    cost: Optional[Decimal] = Field(None, description="Custo monetário da ração")
    notes: Optional[str] = None


class FeedConsumptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    flock_id: int
    feed_id: Optional[int] = None
    consumption_date: date
    bags_used: Decimal
    kg_used: Decimal
    cost: Decimal
    notes: Optional[str] = None
    created_at: datetime


class HealthRecordCreate(BaseModel):
    record_date: Optional[date] = None
    disease: str = Field(..., description="Doença ou motivo (ex: Newcastle, Vacinação)")
    birds_affected: int = Field(0, ge=0)
    treatment: str = Field(..., description="Medicação aplicada ou vacina")
    cost: Decimal = Field(Decimal("0.00"), ge=0)
    notes: Optional[str] = None


class HealthRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    flock_id: int
    record_date: date
    disease: str
    birds_affected: int
    treatment: str
    cost: Decimal
    notes: Optional[str] = None
    created_at: datetime


class MortalityRecordCreate(BaseModel):
    record_date: Optional[date] = None
    quantity: int = Field(..., gt=0, description="Quantidade de aves mortas")
    cause: str = Field("unknown", description="disease, predator, heat_stress, smothering, unknown")
    notes: Optional[str] = None


class MortalityRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    flock_id: int
    record_date: date
    quantity: int
    cause: str
    notes: Optional[str] = None
    created_at: datetime


# =========================================================================
# Analytics & Reports
# =========================================================================
class FlockPerformanceResponse(BaseModel):
    flock_id: int
    flock_number: str
    species: str
    age_in_days: int
    quantity_at_start: int
    quantity_current: int
    cumulative_mortality: int
    mortality_rate_percent: float
    total_feed_consumed_kg: float
    feed_conversion_ratio_fcr: float
    average_feed_per_bird_per_day_grams: float
    total_eggs_collected: int
    laying_percentage_current: float
    cost_per_bird_accumulated: Decimal
    total_accumulated_cost: Decimal
    cost_breakdown: Dict[str, Decimal]


class FlockForecastResponse(BaseModel):
    flock_id: int
    flock_number: str
    species: str
    current_age_days: int
    projected_ready_date: Optional[date] = None
    days_remaining: int
    estimated_final_weight_kg: float
    estimated_total_cost_at_sale: Decimal
    projected_revenue_at_sale: Decimal
    projected_net_profit: Decimal
    projected_roi_percent: float
    forecast_notes: List[str]


class PoultryProductionReportResponse(BaseModel):
    farm_id: int
    farm_name: str
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    total_flocks: int
    active_flocks: int
    live_birds_count: int
    total_mortality_count: int
    overall_mortality_rate_percent: float
    total_eggs_harvested: int
    total_feed_consumed_kg: float
    total_feed_cost: Decimal
    total_health_meds_cost: Decimal
    total_bird_acquisition_cost: Decimal
    total_estimated_revenue: Decimal
    net_production_profit: Decimal
    generated_at: datetime
