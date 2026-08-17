from datetime import date, datetime
from typing import Any, Dict, List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    Response,
    status
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.informal_sales import (
    QuickCustomerCreate,
    InformalCustomerUpdate,
    InformalCustomerResponse,
    SaleWithDebitCreate,
    SaleWithDebitResponse,
    CustomerDebitSummary,
    DebitResponse,
    PartialPaymentCreate,
    PartialPaymentResult,
    SendReminderRequest,
    SendReminderResponse,
    CreditRiskReportResponse,
    CashFlowForecastResponse,
    RevenueBreakdownResponse,
)
from app.services.informal_sales import InformalSalesService

router = APIRouter(prefix="/api/v1/informal", tags=["Informal Sales & Debit (Fiado)"])


# =========================================================================
# Customers Endpoints
# =========================================================================
@router.post("/customers/quick", response_model=InformalCustomerResponse, status_code=status.HTTP_201_CREATED)
def quick_create_customer(
    data: QuickCustomerCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Cadastro rápido de cliente informal/bairro pelo telefone e nome."""
    service = InformalSalesService(db)
    return service.create_customer_from_phone(
        name=data.name,
        phone_number=data.phone,
        location=data.location,
        trusted_credit_limit=data.trusted_credit_limit or 5000,
        notes=data.notes,
        company_id=company_id
    )


@router.get("/customers", response_model=List[InformalCustomerResponse])
def list_informal_customers(
    company_id: int = Query(1),
    search: Optional[str] = Query(None, description="Pesquisar por nome, telefone ou bairro"),
    only_with_debt: bool = Query(False, description="Apenas clientes com saldo devedor"),
    db: Session = Depends(get_db),
):
    """Listar clientes informais cadastrados com filtros."""
    service = InformalSalesService(db)
    return service.list_customers(
        company_id=company_id,
        search=search,
        only_with_debt=only_with_debt
    )


@router.get("/customers/{id}", response_model=InformalCustomerResponse)
def get_informal_customer(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Obter perfil de um cliente informal."""
    service = InformalSalesService(db)
    return service.get_customer(customer_id=id, company_id=company_id)


@router.put("/customers/{id}", response_model=InformalCustomerResponse)
def update_informal_customer(
    id: int,
    data: InformalCustomerUpdate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Atualizar dados ou limite de crédito do cliente informal."""
    service = InformalSalesService(db)
    return service.update_customer(customer_id=id, data=data, company_id=company_id)


# =========================================================================
# Sales With Debit (Venda com Fiado / Pagamento Parcial)
# =========================================================================
@router.post("/sales/with-debit", response_model=SaleWithDebitResponse, status_code=status.HTTP_201_CREATED)
def create_sale_with_debit(
    data: SaleWithDebitCreate,
    user_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """
    Criar venda com suporte a entrada parcial e registro de fiado (débito a pagar).
    Calcula automaticamente o saldo devedor e atualiza o score do cliente.
    """
    service = InformalSalesService(db)
    return service.create_sale_with_debit(data=data, user_id=user_id)


# =========================================================================
# Debits & Partial Payments (Amortização)
# =========================================================================
@router.get("/customers/{id}/debit", response_model=CustomerDebitSummary)
def get_customer_debit_summary(
    id: int,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Consultar total de dívidas e histórico de fiado de um cliente."""
    service = InformalSalesService(db)
    return service.get_customer_debits_summary(customer_id=id, company_id=company_id)


@router.post("/debits/{id}/pay", response_model=PartialPaymentResult)
def record_partial_payment(
    id: int,
    data: PartialPaymentCreate,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """
    Registar pagamento/amortização parcial de uma dívida de fiado.
    Envia automaticamente notificação/comprovativo por WhatsApp ou SMS.
    """
    service = InformalSalesService(db)
    return service.record_partial_payment(
        debit_id=id,
        data=data,
        company_id=company_id
    )


@router.get("/debits/overdue", response_model=List[DebitResponse])
def get_overdue_debits(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Listar todas as dívidas com prazos vencidos (overdue)."""
    service = InformalSalesService(db)
    return service.get_overdue_debits(company_id=company_id)


@router.post("/debits/{id}/send-reminder", response_model=SendReminderResponse)
def send_payment_reminder(
    id: int,
    data: SendReminderRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Enviar lembrete de cobrança amigável via WhatsApp ou SMS."""
    service = InformalSalesService(db)
    return service.send_payment_reminder(
        debit_id=id,
        data=data,
        company_id=company_id
    )


# =========================================================================
# Reports & Analytics (Credit Risk & Cash Flow Forecasting)
# =========================================================================
@router.get("/reports/credit-risk", response_model=CreditRiskReportResponse)
def get_credit_risk_report(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Relatório de Risco de Crédito: Clientes em risco de inadimplência (alto débito / baixo score)."""
    service = InformalSalesService(db)
    return service.get_credit_risk_report(company_id=company_id)


@router.get("/reports/cash-flow", response_model=CashFlowForecastResponse)
def get_cash_flow_forecast(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Previsão de Fluxo de Caixa: Cronograma de recebimento estimado dos débitos de fiado."""
    service = InformalSalesService(db)
    return service.get_cash_flow_forecast(company_id=company_id)


@router.get("/reports/revenue-breakdown", response_model=RevenueBreakdownResponse)
def get_revenue_breakdown(
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Divisão de receita à vista vs fiado e taxa de recuperação de dívidas."""
    service = InformalSalesService(db)
    return service.get_revenue_breakdown(company_id=company_id)


@router.get("/compliance/fiscal-report")
def get_fiscal_debit_compliance_report(
    company_id: int = Query(1),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """Relatório de conformidade fiscal e contábil das vendas a crédito informal."""
    service = InformalSalesService(db)
    return service.compliance.generate_fiscal_debit_report(
        company_id=company_id,
        start_date=start_date,
        end_date=end_date
    )
