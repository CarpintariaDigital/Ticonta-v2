from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models.lead import LeadStage


class InteractionCreate(BaseModel):
    type: str = Field(..., description="call, meeting, email, whatsapp, note, proposal")
    description: str = Field(..., min_length=3, max_length=1000)
    date: Optional[datetime] = None


class InteractionResponse(BaseModel):
    id: int
    lead_id: int
    user_id: int
    user_name: Optional[str] = None
    type: str
    description: str
    date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadCreate(BaseModel):
    company_id: int = Field(default=1)
    name: str = Field(..., min_length=2, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = None
    source: str = Field(default="direct", description="website, referral, direct, whatsapp, phone")
    value: Decimal = Field(default=Decimal("0.00"), ge=0, description="Valor estimado do negócio em MZN")
    probability: int = Field(default=10, ge=0, le=100, description="Probabilidade de fecho (0-100%)")
    notes: Optional[str] = None
    assigned_user_id: Optional[int] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    stage: Optional[LeadStage] = None
    value: Optional[Decimal] = None
    probability: Optional[int] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    assigned_user_id: Optional[int] = None


class LeadStageUpdate(BaseModel):
    stage: LeadStage
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    company_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    stage: LeadStage
    value: Decimal
    probability: int
    source: str
    notes: Optional[str] = None
    assigned_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    interactions: List[InteractionResponse] = []

    model_config = ConfigDict(from_attributes=True)


class PipelineStageMetrics(BaseModel):
    stage: str
    count: int
    total_value: Decimal
    average_probability: float


class PipelineAnalysisResponse(BaseModel):
    company_id: int
    total_leads: int
    total_pipeline_value: Decimal
    weighted_pipeline_value: Decimal
    stages: List[PipelineStageMetrics]


class CRMAnalyticsResponse(BaseModel):
    company_id: int
    total_leads: int
    won_leads: int
    lost_leads: int
    active_leads: int
    win_rate_percentage: float
    conversion_by_source: List[Dict[str, Any]]
    average_deal_size: Decimal
    total_revenue_won: Decimal
    average_days_in_pipeline: float
