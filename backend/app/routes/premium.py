from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.premium_features import PremiumFeatureService

router = APIRouter(prefix="/api/v1/premium", tags=["Premium Features & Subscriptions"])


class PremiumFeatureItem(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    monthly_cost_mzn: float
    category: str
    enabled: bool
    activated_at: Optional[Any] = None


class CostBreakdownResponse(BaseModel):
    base_plan: str
    base_plan_cost_mzn: float
    enabled_features: List[Dict[str, Any]]
    premium_addons_total_mzn: float
    grand_total_monthly_mzn: float
    next_billing_date: str


# 1. GET /api/v1/premium/available-features
@router.get(
    "/available-features",
    response_model=List[PremiumFeatureItem],
    summary="Listar todas as funcionalidades premium com status e custos para a empresa",
)
def get_available_features(
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = PremiumFeatureService(db)
    return svc.get_available_features(company_id=company_id)


# 2. POST /api/v1/premium/features/{feature}/enable
@router.post(
    "/features/{feature}/enable",
    summary="Ativar um módulo premium e atualizar o cálculo da subscrição",
)
def enable_premium_feature(
    feature: str,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = PremiumFeatureService(db)
    try:
        return svc.enable_feature(company_id=company_id, feature_name=feature, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# 3. POST /api/v1/premium/features/{feature}/disable
@router.post(
    "/features/{feature}/disable",
    summary="Desativar um módulo premium e recalcular o valor da mensalidade",
)
def disable_premium_feature(
    feature: str,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = PremiumFeatureService(db)
    try:
        return svc.disable_feature(company_id=company_id, feature_name=feature)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# 4. GET /api/v1/premium/cost-breakdown
@router.get(
    "/cost-breakdown",
    response_model=CostBreakdownResponse,
    summary="Discriminativo completo de custos (Plano Base + Módulos Premium)",
)
def get_cost_breakdown(
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = PremiumFeatureService(db)
    return svc.calculate_total_premium_cost(company_id=company_id)


# 5. GET /api/v1/premium/status
@router.get(
    "/status",
    summary="Status atual da subscrição e módulos contratados",
)
def get_premium_status(
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = PremiumFeatureService(db)
    return svc.calculate_total_premium_cost(company_id=company_id)
