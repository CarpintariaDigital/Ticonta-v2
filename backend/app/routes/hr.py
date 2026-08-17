from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.schemas.hr import (
    AttendanceCreate,
    AttendanceResponse,
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
    INSSDeclarationXMLResponse,
    MonthlyPayrollSummaryResponse,
    PayrollGenerateRequest,
    PayrollItemResponse,
)
from app.services.hr import HRService

router = APIRouter(prefix="/api/v1/hr", tags=["Recursos Humanos & Folha INSS"])


@router.get("/employees", response_model=List[EmployeeResponse])
def list_employees(
    company_id: int = Query(1),
    active_only: bool = Query(True),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar colaboradores e pessoal da empresa."""
    service = HRService(db)
    employees = service.get_employees(company_id=company_id, active_only=active_only)
    return [
        EmployeeResponse(
            id=e.id,
            company_id=e.company_id,
            first_name=e.first_name,
            last_name=e.last_name,
            full_name=e.full_name,
            email=e.email,
            phone=e.phone,
            nuit=e.nuit,
            inss_number=e.inss_number,
            position=e.position,
            department=e.department,
            salary=e.salary,
            start_date=e.start_date,
            active=e.active,
            created_at=e.created_at,
        )
        for e in employees
    ]


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: EmployeeCreate,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Adicionar novo empregado."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = HRService(db)
    e = service.create_employee(data=data, user_id=user_id)
    return EmployeeResponse(
        id=e.id,
        company_id=e.company_id,
        first_name=e.first_name,
        last_name=e.last_name,
        full_name=e.full_name,
        email=e.email,
        phone=e.phone,
        nuit=e.nuit,
        inss_number=e.inss_number,
        position=e.position,
        department=e.department,
        salary=e.salary,
        start_date=e.start_date,
        active=e.active,
        created_at=e.created_at,
    )


@router.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Obter detalhes do trabalhador."""
    service = HRService(db)
    e = service.get_employee_by_id(employee_id=employee_id, company_id=company_id)
    return EmployeeResponse(
        id=e.id,
        company_id=e.company_id,
        first_name=e.first_name,
        last_name=e.last_name,
        full_name=e.full_name,
        email=e.email,
        phone=e.phone,
        nuit=e.nuit,
        inss_number=e.inss_number,
        position=e.position,
        department=e.department,
        salary=e.salary,
        start_date=e.start_date,
        active=e.active,
        created_at=e.created_at,
    )


@router.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Atualizar dados do funcionário."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = HRService(db)
    e = service.update_employee(employee_id=employee_id, data=data, user_id=user_id, company_id=company_id)
    return EmployeeResponse(
        id=e.id,
        company_id=e.company_id,
        first_name=e.first_name,
        last_name=e.last_name,
        full_name=e.full_name,
        email=e.email,
        phone=e.phone,
        nuit=e.nuit,
        inss_number=e.inss_number,
        position=e.position,
        department=e.department,
        salary=e.salary,
        start_date=e.start_date,
        active=e.active,
        created_at=e.created_at,
    )


@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def record_attendance(
    data: AttendanceCreate,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Registar presença / ponto diário."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = HRService(db)
    att = service.record_attendance(data=data, user_id=user_id, company_id=company_id)
    return AttendanceResponse(
        id=att.id,
        employee_id=att.employee_id,
        employee_name=att.employee.full_name if att.employee else None,
        date=att.date,
        status=att.status,
        hours=att.hours,
        notes=att.notes,
        created_at=att.created_at,
    )


@router.post("/payroll/generate", response_model=MonthlyPayrollSummaryResponse)
def generate_payroll(
    data: PayrollGenerateRequest,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Gerar e calcular folha de pagamento do mês com descontos automáticos de INSS (3% + 4%) e IRPS."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    service = HRService(db)
    return service.generate_monthly_payroll(company_id=data.company_id, period=data.period, user_id=user_id)


@router.get("/payroll/{period}", response_model=MonthlyPayrollSummaryResponse)
def get_payroll_by_period(
    period: str,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Consultar folha de pagamento de um período específico."""
    service = HRService(db)
    return service.get_monthly_payroll(company_id=company_id, period=period)


@router.get("/payroll/{period}/export-xml", response_model=INSSDeclarationXMLResponse)
def export_inss_xml(
    period: str,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Gerar ficheiro XML para submissão oficial no portal SISSMO do INSS de Moçambique."""
    service = HRService(db)
    return service.generate_inss_declaration_xml(company_id=company_id, period=period)
