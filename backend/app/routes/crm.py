from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.models.lead import LeadStage
from app.schemas.crm import (
    CRMAnalyticsResponse,
    InteractionCreate,
    InteractionResponse,
    LeadCreate,
    LeadResponse,
    LeadStageUpdate,
    LeadUpdate,
    PipelineAnalysisResponse,
)
from app.services.crm import CRMService

router = APIRouter(prefix="/api/v1/crm", tags=["CRM & Gestão de Leads"])


@router.get("/leads", response_model=List[LeadResponse])
def list_leads(
    company_id: int = Query(1),
    stage: Optional[LeadStage] = Query(None),
    source: Optional[str] = Query(None),
    min_value: Optional[Decimal] = Query(None),
    max_value: Optional[Decimal] = Query(None),
    assigned_user_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar oportunidades comerciais / leads com filtros."""
    service = CRMService(db)
    return service.get_leads(
        company_id=company_id,
        stage=stage,
        source=source,
        min_value=min_value,
        max_value=max_value,
        assigned_user_id=assigned_user_id,
        search=search,
    )


@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    data: LeadCreate,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Registar novo lead no funil de vendas."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = CRMService(db)
    return service.create_lead(data=data, user_id=user_id)


@router.get("/leads/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Obter detalhes completos do lead."""
    service = CRMService(db)
    return service.get_lead_by_id(lead_id=lead_id, company_id=company_id)


@router.put("/leads/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    data: LeadUpdate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Atualizar dados do lead."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = CRMService(db)
    return service.update_lead(lead_id=lead_id, data=data, user_id=user_id, company_id=company_id)


@router.delete("/leads/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Excluir lead comercial."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = CRMService(db)
    service.delete_lead(lead_id=lead_id, user_id=user_id, company_id=company_id)
    return None


@router.post("/leads/{lead_id}/stage", response_model=LeadResponse)
def move_lead_stage(
    lead_id: int,
    data: LeadStageUpdate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Mover estágio do lead no funil (novo -> proposta -> ganho / perdido)."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = CRMService(db)
    return service.move_lead_stage(
        lead_id=lead_id,
        new_stage=data.stage,
        notes=data.notes,
        user_id=user_id,
        company_id=company_id,
    )


@router.post("/leads/{lead_id}/interactions", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
def add_lead_interaction(
    lead_id: int,
    data: InteractionCreate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Registar interação ou contacto com o lead (ligação, reunião, mensagem)."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = CRMService(db)
    interaction = service.add_interaction(
        lead_id=lead_id,
        data=data,
        user_id=user_id,
        company_id=company_id,
    )
    return InteractionResponse(
        id=interaction.id,
        lead_id=interaction.lead_id,
        user_id=interaction.user_id,
        user_name=interaction.user.username if interaction.user else f"User #{interaction.user_id}",
        type=interaction.type,
        description=interaction.description,
        date=interaction.date,
        created_at=interaction.created_at,
    )


@router.get("/leads/{lead_id}/interactions", response_model=List[InteractionResponse])
def get_lead_interactions(
    lead_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar histórico de contactos do lead."""
    service = CRMService(db)
    interactions = service.get_lead_interactions(lead_id=lead_id, company_id=company_id)
    return [
        InteractionResponse(
            id=i.id,
            lead_id=i.lead_id,
            user_id=i.user_id,
            user_name=i.user.username if i.user else f"User #{i.user_id}",
            type=i.type,
            description=i.description,
            date=i.date,
            created_at=i.created_at,
        )
        for i in interactions
    ]


@router.get("/pipeline", response_model=PipelineAnalysisResponse)
def get_pipeline_analysis(
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Análise de valor e volume por etapa do funil comercial."""
    service = CRMService(db)
    return service.calculate_pipeline_analysis(company_id=company_id)


@router.get("/analytics", response_model=CRMAnalyticsResponse)
def get_crm_analytics(
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Métricas de conversão, win rate e receita ganha."""
    service = CRMService(db)
    return service.get_crm_analytics(company_id=company_id)
