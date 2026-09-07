from datetime import date
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.models.report import ReportType
from app.schemas.report import (
    CRMReportData,
    FinancialReportData,
    HRReportData,
    ProjectsReportData,
    SalesReportData,
    CustomReportConfig,
)
from app.services.reports import ReportsService

router = APIRouter(prefix="/api/v1/reports", tags=["Relatórios Executivos & BI"])


@router.get("/sales", response_model=SalesReportData)
def get_sales_report(
    company_id: int = Query(1),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    customer_id: Optional[int] = Query(None),
    product_id: Optional[int] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Relatório gerencial de vendas com ticket médio, produtos top e formas de pagamento."""
    service = ReportsService(db)
    return service.generate_sales_report(
        company_id=company_id,
        date_from=date_from,
        date_to=date_to,
        customer_id=customer_id,
        product_id=product_id,
    )


@router.get("/financial", response_model=FinancialReportData)
def get_financial_report(
    company_id: int = Query(1),
    period: str = Query("2026-08"),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Relatório financeiro com fluxo de caixa, receitas vs despesas e margem operacional."""
    service = ReportsService(db)
    return service.generate_financial_report(company_id=company_id, period=period)


@router.get("/crm", response_model=CRMReportData)
def get_crm_report(
    company_id: int = Query(1),
    period: str = Query("2026-08"),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Relatório do pipeline CRM com taxas de conversão e win rate %."""
    service = ReportsService(db)
    return service.generate_crm_report(company_id=company_id, period=period)


@router.get("/projects", response_model=ProjectsReportData)
def get_projects_report(
    company_id: int = Query(1),
    period: str = Query("2026-08"),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Relatório de obras e projetos com controle orçamentário vs despesas reais."""
    service = ReportsService(db)
    return service.generate_project_report(company_id=company_id, period=period)


@router.get("/hr", response_model=HRReportData)
def get_hr_report(
    company_id: int = Query(1),
    period: str = Query("2026-08"),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Relatório de Recursos Humanos, massa salarial e guias de recolhimento INSS."""
    service = ReportsService(db)
    return service.generate_hr_report(company_id=company_id, period=period)


@router.get("/export/csv")
def export_report_csv(
    report_type: ReportType = Query(...),
    period: str = Query("2026-08"),
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Exportar qualquer relatório consolidado em formato CSV/Excel."""
    service = ReportsService(db)

    if report_type == ReportType.SALES:
        data = service.generate_sales_report(company_id=company_id).model_dump()
    elif report_type == ReportType.FINANCIAL:
        data = service.generate_financial_report(company_id=company_id, period=period).model_dump()
    elif report_type == ReportType.CRM:
        data = service.generate_crm_report(company_id=company_id, period=period).model_dump()
    elif report_type == ReportType.PROJECTS:
        data = service.generate_project_report(company_id=company_id, period=period).model_dump()
    elif report_type == ReportType.HR:
        data = service.generate_hr_report(company_id=company_id, period=period).model_dump()
    else:
        raise HTTPException(status_code=400, detail="Tipo de relatório não suportado para CSV.")

    csv_content = service.export_report_to_csv(report_type=report_type, data=data)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=relatorio_{report_type.value}_{period}.csv"},
    )
