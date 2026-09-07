from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.auto_services import MechanicTechnician
from app.schemas.auto_services import (
    VehicleCreate,
    VehicleResponse,
    TechnicianCreate,
    TechnicianResponse,
    ServiceOrderCreate,
    ServiceOrderStatusUpdate,
    ServiceOrderResponse,
    WorkshopStatsResponse,
)
from app.services.auto_services import AutoServiceService

router = APIRouter(prefix="/api/v1/auto", tags=["Auto Services & Workshop"])
auto_service = AutoServiceService()


# ==========================================
# 1. VEÍCULOS
# ==========================================
@router.post("/vehicles", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_or_get_vehicle(
    vehicle_in: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Regista ou obtém um veículo por matrícula."""
    return auto_service.get_or_create_vehicle(db, vehicle_in)


@router.get("/vehicles", response_model=List[VehicleResponse])
def list_vehicles(
    search: Optional[str] = None,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Listar veículos cadastrados com pesquisa por matrícula, marca, modelo ou VIN."""
    return auto_service.list_vehicles(db, company_id=company_id, search=search)


@router.get("/vehicles/{vehicle_id}/history")
def get_vehicle_history(
    vehicle_id: int,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obter histórico de todas as intervenções, revisões e diagnósticos do veículo."""
    try:
        return auto_service.get_vehicle_history(db, vehicle_id=vehicle_id, company_id=company_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


# ==========================================
# 2. TÉCNICOS & MECÂNICOS
# ==========================================
@router.post("/technicians", response_model=TechnicianResponse, status_code=status.HTTP_201_CREATED)
def create_technician(
    tech_in: TechnicianCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cadastra um novo técnico/mecânico especialista."""
    tech = MechanicTechnician(
        company_id=tech_in.company_id or 1,
        name=tech_in.name,
        specialty=tech_in.specialty,
        phone=tech_in.phone,
        is_active=tech_in.is_active,
    )
    db.add(tech)
    db.commit()
    db.refresh(tech)
    return tech


@router.get("/technicians", response_model=List[TechnicianResponse])
def list_technicians(
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Listar técnicos ativos da oficina."""
    return (
        db.query(MechanicTechnician)
        .filter(MechanicTechnician.company_id == company_id, MechanicTechnician.is_active == True)
        .all()
    )


# ==========================================
# 3. ORDENS DE SERVIÇO (OS)
# ==========================================
@router.post("/orders", response_model=ServiceOrderResponse, status_code=status.HTTP_201_CREATED)
def create_service_order(
    order_in: ServiceOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Abre uma nova Ordem de Serviço (OS) com checklist e itens de orçamento."""
    try:
        return auto_service.create_service_order(db, order_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/orders", response_model=List[ServiceOrderResponse])
def list_service_orders(
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    search: Optional[str] = None,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Listar Ordens de Serviço com filtros por estado de Box, tipo de serviço ou matrícula."""
    return auto_service.list_service_orders(
        db, company_id=company_id, status=status, service_type=service_type, search=search
    )


@router.get("/orders/{order_id}", response_model=ServiceOrderResponse)
def get_service_order(
    order_id: int,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obter detalhes completos de uma Ordem de Serviço."""
    try:
        return auto_service.get_service_order(db, order_id=order_id, company_id=company_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/orders/{order_id}/status", response_model=ServiceOrderResponse)
def update_order_status(
    order_id: int,
    status_in: ServiceOrderStatusUpdate,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Atualizar o estado da OS / Mover no Quadro Kanban da Oficina."""
    try:
        return auto_service.update_order_status(
            db, order_id=order_id, status_in=status_in, company_id=company_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/orders/{order_id}/convert-to-sale")
def convert_order_to_sale(
    order_id: int,
    payment_method: str = Query(default="cash"),
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Converte a Ordem de Serviço concluída numa Fatura/Venda Oficial com IVA 16%."""
    try:
        return auto_service.convert_order_to_sale(
            db, order_id=order_id, payment_method=payment_method, company_id=company_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ==========================================
# 4. KPI & PAINEL DE CONTROLO
# ==========================================
@router.get("/stats", response_model=WorkshopStatsResponse)
def get_workshop_stats(
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obter métricas operacionais e financeiras em tempo real da oficina."""
    return auto_service.get_workshop_stats(db, company_id=company_id)
