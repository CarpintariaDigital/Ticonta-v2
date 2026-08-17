from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.payment import (
    ProcessPaymentRequest,
    SplitPaymentRequest,
    PaymentStatusResponse,
    OutstandingPaymentsResponse,
)
from app.services.payment import PaymentService

router = APIRouter(prefix="/api/v1/payments", tags=["Unified Payments & Partial Settlements"])


@router.post("/{sale_id}", response_model=PaymentStatusResponse, status_code=status.HTTP_200_OK)
def process_payment(
    sale_id: int,
    data: ProcessPaymentRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """
    Processar pagamento integral ou amortização parcial para qualquer módulo
    (POS, Restaurante, Takeaway, Informal, Fabrico, Projetos).
    """
    service = PaymentService(db)
    return service.process_payment(sale_id=sale_id, data=data, company_id=company_id)


@router.get("/{sale_id}/status", response_model=PaymentStatusResponse)
def get_payment_status(
    sale_id: int,
    module: Optional[str] = Query(None, description="pos, restaurant, takeaway, informal, etc."),
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Consultar saldo, total amortizado e histórico de transações de uma venda."""
    service = PaymentService(db)
    return service.get_payment_status(sale_id=sale_id, module_source=module, company_id=company_id)


@router.post("/{sale_id}/split", response_model=PaymentStatusResponse)
def split_payment(
    sale_id: int,
    data: SplitPaymentRequest,
    company_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """
    Dividir o pagamento entre múltiplos métodos simultâneos
    (ex: 1000 MT em M-Pesa + 500 MT em Dinheiro).
    """
    service = PaymentService(db)
    return service.split_payment(sale_id=sale_id, data=data, company_id=company_id)


@router.get("/outstanding", response_model=OutstandingPaymentsResponse)
def get_outstanding_payments(
    company_id: int = Query(1),
    module: Optional[str] = Query(None, description="Filtrar por módulo (pos, restaurant, takeaway, informal)"),
    db: Session = Depends(get_db),
):
    """Listar todas as vendas e encomendas em aberto com saldos pendentes ou em atraso."""
    service = PaymentService(db)
    return service.get_outstanding_payments(company_id=company_id, module_source=module)


@router.get("/tax-report")
def get_tax_payment_report(
    company_id: int = Query(1),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """Relatório fiscal e mapa de arrecadação por método de pagamento (AT / IVA 16%)."""
    service = PaymentService(db)
    return service.compliance.generate_tax_payment_report(
        company_id=company_id,
        start_date=start_date,
        end_date=end_date
    )
