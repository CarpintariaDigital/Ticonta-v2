from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.models.manufacturing import WorkOrderStatus
from app.schemas.manufacturing import (
    BudgetCalculationInput,
    BudgetCalculationResult,
    CuttingPlanInput,
    CuttingPlanResult,
    WorkOrderCreate,
    WorkOrderMaterialResponse,
    WorkOrderResponse,
    WorkOrderUpdate,
)
from app.services.manufacturing import ManufacturingService

router = APIRouter(prefix="/api/v1/manufacturing", tags=["Fabrico & Carpintaria"])


@router.post("/budget/calculate", response_model=BudgetCalculationResult)
def calculate_budget(
    data: BudgetCalculationInput,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Calcular orçamento de fabrico com base em matéria-prima, mão de obra, encargos e markup."""
    service = ManufacturingService(db)
    return service.calculate_budget(data)


@router.post("/cutting-plan/calculate", response_model=CuttingPlanResult)
def calculate_cutting_plan(
    data: CuttingPlanInput,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Calcular plano de corte 2D otimizado para chapas de MDF, contraplacado e madeira maciça."""
    service = ManufacturingService(db)
    return service.calculate_cutting_plan(data)


@router.get("/work-orders", response_model=List[WorkOrderResponse])
def list_work_orders(
    company_id: int = Query(1),
    status: Optional[WorkOrderStatus] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar Ordens de Produção (OP) em fábrica."""
    service = ManufacturingService(db)
    orders = service.get_work_orders(company_id=company_id, status=status)
    return [
        WorkOrderResponse(
            id=w.id,
            company_id=w.company_id,
            project_id=w.project_id,
            project_name=w.project.name if w.project else None,
            order_number=w.order_number,
            description=w.description,
            status=w.status,
            budget=w.budget,
            actual_cost=w.actual_cost,
            profit=w.budget - w.actual_cost,
            start_date=w.start_date,
            end_date=w.end_date,
            created_at=w.created_at,
            materials=[
                WorkOrderMaterialResponse(
                    id=m.id,
                    name=m.name,
                    quantity=m.quantity,
                    unit=m.unit,
                    unit_price=m.unit_price,
                    total_cost=m.total_cost,
                )
                for m in w.materials
            ],
        )
        for w in orders
    ]


@router.post("/work-orders", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
def create_work_order(
    data: WorkOrderCreate,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Emitir nova Ordem de Produção (OP)."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ManufacturingService(db)
    w = service.create_work_order(data=data, user_id=user_id)
    return WorkOrderResponse(
        id=w.id,
        company_id=w.company_id,
        project_id=w.project_id,
        project_name=w.project.name if w.project else None,
        order_number=w.order_number,
        description=w.description,
        status=w.status,
        budget=w.budget,
        actual_cost=w.actual_cost,
        profit=w.budget - w.actual_cost,
        start_date=w.start_date,
        end_date=w.end_date,
        created_at=w.created_at,
        materials=[
            WorkOrderMaterialResponse(
                id=m.id,
                name=m.name,
                quantity=m.quantity,
                unit=m.unit,
                unit_price=m.unit_price,
                total_cost=m.total_cost,
            )
            for m in w.materials
        ],
    )


@router.get("/work-orders/{work_order_id}", response_model=WorkOrderResponse)
def get_work_order(
    work_order_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Obter detalhes da Ordem de Produção."""
    service = ManufacturingService(db)
    w = service.get_work_order_by_id(work_order_id=work_order_id, company_id=company_id)
    return WorkOrderResponse(
        id=w.id,
        company_id=w.company_id,
        project_id=w.project_id,
        project_name=w.project.name if w.project else None,
        order_number=w.order_number,
        description=w.description,
        status=w.status,
        budget=w.budget,
        actual_cost=w.actual_cost,
        profit=w.budget - w.actual_cost,
        start_date=w.start_date,
        end_date=w.end_date,
        created_at=w.created_at,
        materials=[
            WorkOrderMaterialResponse(
                id=m.id,
                name=m.name,
                quantity=m.quantity,
                unit=m.unit,
                unit_price=m.unit_price,
                total_cost=m.total_cost,
            )
            for m in w.materials
        ],
    )


@router.put("/work-orders/{work_order_id}", response_model=WorkOrderResponse)
def update_work_order(
    work_order_id: int,
    data: WorkOrderUpdate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Atualizar status ou custos da Ordem de Produção."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = ManufacturingService(db)
    w = service.update_work_order(work_order_id=work_order_id, data=data, user_id=user_id, company_id=company_id)
    return WorkOrderResponse(
        id=w.id,
        company_id=w.company_id,
        project_id=w.project_id,
        project_name=w.project.name if w.project else None,
        order_number=w.order_number,
        description=w.description,
        status=w.status,
        budget=w.budget,
        actual_cost=w.actual_cost,
        profit=w.budget - w.actual_cost,
        start_date=w.start_date,
        end_date=w.end_date,
        created_at=w.created_at,
        materials=[],
    )
