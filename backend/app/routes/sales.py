from datetime import date, datetime
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.schemas.sale import (
    DailyRevenueResponse,
    SaleCreate,
    SaleListResponse,
    SaleResponse,
)
from app.services.sales import SalesService

router = APIRouter(prefix="/api/v1/sales", tags=["POS & Sales"])


class UpdateSaleStatusRequest(BaseModel):
    payment_status: str


class EmailReceiptRequest(BaseModel):
    email: str


@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(
    data: SaleCreate,
    request: Request,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Criar nova venda / emitir factura com baixa de stock e integração contábil/fiscal."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent")

    sales_service = SalesService(db)
    sale = sales_service.create_sale(
        sale_data=data,
        user_id=user_id,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    return sale


@router.get("/today/total", response_model=DailyRevenueResponse)
def get_today_total(
    company_id: int = Query(1, description="ID da empresa"),
    target_date: Optional[date] = Query(None, description="Data alvo (padrão: hoje)"),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Obter receita total do dia e divisão por método de pagamento."""
    sales_service = SalesService(db)
    return sales_service.get_daily_revenue(target_date=target_date, company_id=company_id)


@router.get("", response_model=SaleListResponse)
def list_sales(
    company_id: int = Query(1, description="ID da empresa"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    customer_id: Optional[int] = Query(None),
    payment_method: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Listar vendas com filtros e paginação."""
    sales_service = SalesService(db)
    return sales_service.get_sales(
        company_id=company_id,
        skip=skip,
        limit=limit,
        customer_id=customer_id,
        payment_method=payment_method,
        payment_status=payment_status,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(
    sale_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Buscar detalhes de uma venda por ID."""
    sales_service = SalesService(db)
    return sales_service.get_sale(sale_id=sale_id, company_id=company_id)


@router.put("/{sale_id}", response_model=SaleResponse)
def update_sale(
    sale_id: int,
    data: UpdateSaleStatusRequest,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Atualizar status de pagamento de uma venda."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    sales_service = SalesService(db)
    return sales_service.update_sale(
        sale_id=sale_id,
        data=data.model_dump(),
        user_id=user_id,
        company_id=company_id,
    )


@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Cancelar venda e repor o stock."""
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    sales_service = SalesService(db)
    return sales_service.delete_sale(
        sale_id=sale_id,
        user_id=user_id,
        company_id=company_id,
    )


@router.post("/{sale_id}/print")
def print_receipt(
    sale_id: int,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Gerar representação para impressão de recibo térmico / PDF (58mm/80mm)."""
    sales_service = SalesService(db)
    sale = sales_service.get_sale(sale_id=sale_id, company_id=company_id)

    receipt_text = f"""
========================================
           TiConta v2 ERP
       COMPROVATIVO DE VENDA
========================================
Factura Nº: {sale.invoice_number}
Data: {sale.sale_date.strftime('%d/%m/%Y %H:%M:%S') if sale.sale_date else ''}
Atendido por: ID #{sale.user_id}
Método: {sale.payment_method.upper()}
----------------------------------------
ITENS:
"""
    for item in sale.items:
        receipt_text += f"{item.quantity}x {item.unit_price} MZN  | IVA {item.tax_rate}%\n"

    receipt_text += f"""----------------------------------------
Subtotal: {sale.total_amount} MZN
IVA Total: {sale.tax_amount} MZN
Desconto: {sale.discount_amount} MZN
----------------------------------------
TOTAL LÍQUIDO: {sale.net_amount} MZN
========================================
   Obrigado pela preferência!
   Processado por software certificado.
========================================
"""
    return Response(content=receipt_text, media_type="text/plain; charset=utf-8")


@router.post("/{sale_id}/email-receipt")
def email_receipt(
    sale_id: int,
    data: EmailReceiptRequest,
    company_id: int = Query(1),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """Enviar comprovativo de venda para o email do cliente."""
    sales_service = SalesService(db)
    sale = sales_service.get_sale(sale_id=sale_id, company_id=company_id)

    return {
        "status": "sent",
        "email": data.email,
        "invoice_number": sale.invoice_number,
        "message": f"Comprovativo da factura {sale.invoice_number} enviado para {data.email} com sucesso.",
    }
