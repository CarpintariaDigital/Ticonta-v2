from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.poultry import (
    FarmCreate,
    FarmResponse,
    FlockCreate,
    FlockResponse,
    EggProductionCreate,
    EggProductionResponse,
    FeedConsumptionCreate,
    FeedConsumptionResponse,
    HealthRecordCreate,
    HealthRecordResponse,
    MortalityRecordCreate,
    MortalityRecordResponse,
    FlockPerformanceResponse,
    FlockForecastResponse,
    PoultryProductionReportResponse,
)
from app.services.poultry import PoultryService

router = APIRouter(prefix="/api/v1/poultry", tags=["Poultry & Egg Farm Management"])


@router.post("/farms", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(
    data: FarmCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Registar nova quinta / exploração avícola."""
    service = PoultryService(db)
    return service.create_farm(data=data, company_id=company_id)


@router.get("/farms", response_model=List[FarmResponse])
def list_farms(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Listar todas as quintas avícolas registadas."""
    service = PoultryService(db)
    return service.list_farms(company_id=company_id)


@router.post("/flocks", response_model=FlockResponse, status_code=status.HTTP_201_CREATED)
def create_flock(
    data: FlockCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Criar novo lote de aves (frango de corte, poedeiras, codornas, patos)."""
    service = PoultryService(db)
    return service.create_flock(data=data, company_id=company_id)


@router.get("/flocks", response_model=List[FlockResponse])
def list_flocks(
    farm_id: Optional[int] = Query(None),
    species: Optional[str] = Query(None, description="chicken_broiler, chicken_layer, quail, duck"),
    status: Optional[str] = Query(None, description="growing, producing, sold, culled, closed"),
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Listar lotes com filtros por quinta, espécie e estado."""
    service = PoultryService(db)
    return service.list_flocks(
        farm_id=farm_id,
        species=species,
        status_filter=status,
        company_id=company_id
    )


@router.get("/flocks/{id}", response_model=FlockResponse)
def get_flock(
    id: int,
    db: Session = Depends(get_db),
):
    """Obter detalhes do lote de aves."""
    service = PoultryService(db)
    return service.get_flock(flock_id=id)


@router.post("/flocks/{id}/production", response_model=EggProductionResponse, status_code=status.HTTP_201_CREATED)
def record_egg_production(
    id: int,
    data: EggProductionCreate,
    db: Session = Depends(get_db),
):
    """Registar colheita diária de ovos (postura, classificação e rejeição)."""
    service = PoultryService(db)
    return service.record_egg_production(flock_id=id, data=data)


@router.post("/flocks/{id}/feed", response_model=FeedConsumptionResponse, status_code=status.HTTP_201_CREATED)
def record_feed_consumption(
    id: int,
    data: FeedConsumptionCreate,
    db: Session = Depends(get_db),
):
    """Registar consumo de ração em sacos e kg."""
    service = PoultryService(db)
    return service.record_feed_consumption(flock_id=id, data=data)


@router.post("/flocks/{id}/mortality", response_model=MortalityRecordResponse, status_code=status.HTTP_201_CREATED)
def record_mortality(
    id: int,
    data: MortalityRecordCreate,
    db: Session = Depends(get_db),
):
    """Registar mortes de aves e abater automaticamente o saldo vivo do lote."""
    service = PoultryService(db)
    return service.record_mortality(flock_id=id, data=data)


@router.post("/flocks/{id}/health", response_model=HealthRecordResponse, status_code=status.HTTP_201_CREATED)
def record_health_record(
    id: int,
    data: HealthRecordCreate,
    db: Session = Depends(get_db),
):
    """Registar ocorrência sanitária, vacinação ou medicação administrada."""
    service = PoultryService(db)
    return service.record_health_issue(flock_id=id, data=data)


@router.get("/flocks/{id}/performance", response_model=FlockPerformanceResponse)
def get_flock_performance(
    id: int,
    db: Session = Depends(get_db),
):
    """Obter métricas de desempenho zootécnico (idade, mortalidade %, FCR, postura % e custo/ave)."""
    service = PoultryService(db)
    return service.get_flock_performance(flock_id=id)


@router.get("/flocks/{id}/forecast", response_model=FlockForecastResponse)
def forecast_flock_production(
    id: int,
    db: Session = Depends(get_db),
):
    """Prever data de abate/prontidão, pico de postura, custos totais e rentabilidade projetada."""
    service = PoultryService(db)
    return service.forecast_production(flock_id=id)


@router.get("/reports", response_model=PoultryProductionReportResponse)
def generate_production_report(
    farm_id: int = Query(..., description="ID da quinta"),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Relatório completo de produção avícola (vivos vs mortes, ovos, ração, custos e lucro líquido)."""
    service = PoultryService(db)
    return service.generate_production_report(
        farm_id=farm_id,
        start_date=start_date,
        end_date=end_date,
        company_id=company_id
    )
