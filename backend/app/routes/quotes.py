from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.tenant import get_tenant_id
from app.models.entities import Customer, Product, Company
from app.models.sale import Sale, SaleItem, Payment
from app.schemas.quote import (
    QuoteCreate,
    QuoteResponse,
    QuoteItemResponse,
    QuoteUpdateStatus,
    ConvertQuoteToSaleResponse,
)

router = APIRouter(prefix="/api/v1/quotes", tags=["Quotes & Proforma Invoices"])

# Armazenamento em memória com persistência por tenant para cotações
_quotes_db: Dict[int, List[Dict[str, Any]]] = {}
_quote_counter = 1000


@router.get("", response_model=List[QuoteResponse])
def list_quotes(
    quote_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Listar todas as cotações e faturas proformas emitidas."""
    quotes = _quotes_db.get(tenant_id, [])

    # Seed inicial demonstrativo se vazio
    if not quotes:
        today = date.today()
        seed_quotes = [
            {
                "id": 1,
                "company_id": tenant_id,
                "quote_number": f"COT-{today.year}/001",
                "quote_type": "cotacao",
                "customer_id": 1,
                "customer_name": "Moza Distribuições Lda",
                "customer_nuit": "100829143",
                "customer_phone": "+258849988776",
                "customer_email": "compras@mozadist.co.mz",
                "customer_address": "Av. 24 de Julho, Maputo",
                "issue_date": today,
                "valid_until": today + timedelta(days=15),
                "status": "enviada",
                "subtotal": Decimal("25000.00"),
                "iva_total": Decimal("4000.00"),
                "discount_total": Decimal("0.00"),
                "total": Decimal("29000.00"),
                "payment_terms": "Pronto Pagamento via M-Pesa",
                "notes": "Cotação válida por 15 dias. Preços com IVA 16% incluso.",
                "converted_sale_id": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "items": [
                    {
                        "id": 1,
                        "product_id": 1,
                        "description": "Fardos de Arroz 25kg (Lote Comercial)",
                        "quantity": Decimal("10.000"),
                        "unit_price": Decimal("2500.00"),
                        "discount_percent": Decimal("0.00"),
                        "iva_rate": Decimal("16.00"),
                        "subtotal": Decimal("25000.00"),
                        "iva_amount": Decimal("4000.00"),
                        "total": Decimal("29000.00"),
                    }
                ],
            },
            {
                "id": 2,
                "company_id": tenant_id,
                "quote_number": f"PRO-{today.year}/002",
                "quote_type": "proforma",
                "customer_name": "Restaurante Zambi",
                "customer_nuit": "100554433",
                "customer_phone": "+258821122334",
                "customer_email": "financeiro@zambi.co.mz",
                "customer_address": "Av. 10 de Novembro, Maputo",
                "issue_date": today,
                "valid_until": today + timedelta(days=30),
                "status": "aprovada",
                "subtotal": Decimal("45000.00"),
                "iva_total": Decimal("7200.00"),
                "discount_total": Decimal("2250.00"),
                "total": Decimal("49950.00"),
                "payment_terms": "30 Dias",
                "notes": "Fatura Proforma para fornecimento mensal de frangos e ração.",
                "converted_sale_id": None,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "items": [
                    {
                        "id": 2,
                        "product_id": 2,
                        "description": "Frango de Corte Abatido 1.8kg (Grade A)",
                        "quantity": Decimal("200.000"),
                        "unit_price": Decimal("225.00"),
                        "discount_percent": Decimal("5.00"),
                        "iva_rate": Decimal("16.00"),
                        "subtotal": Decimal("45000.00"),
                        "iva_amount": Decimal("7200.00"),
                        "total": Decimal("49950.00"),
                    }
                ],
            },
        ]
        _quotes_db[tenant_id] = seed_quotes
        quotes = seed_quotes

    filtered = quotes
    if quote_type:
        filtered = [q for q in filtered if q["quote_type"] == quote_type.lower()]
    if status_filter:
        filtered = [q for q in filtered if q["status"] == status_filter.lower()]
    if search:
        s_clean = search.lower()
        filtered = [
            q for q in filtered
            if s_clean in q["customer_name"].lower()
            or s_clean in q["quote_number"].lower()
            or (q.get("customer_nuit") and s_clean in q["customer_nuit"].lower())
        ]

    return filtered


@router.post("", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def create_quote(
    payload: QuoteCreate,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Criar nova Cotação Comercial ou Fatura Proforma."""
    global _quote_counter
    _quote_counter += 1

    prefix = "PRO" if payload.quote_type == "proforma" else "COT"
    year = date.today().year
    quote_number = f"{prefix}-{year}/{str(_quote_counter).zfill(3)}"

    subtotal = Decimal("0.00")
    discount_total = Decimal("0.00")
    iva_total = Decimal("0.00")
    items_out = []

    for idx, item in enumerate(payload.items, start=1):
        item_gross = item.quantity * item.unit_price
        item_disc = item_gross * (item.discount_percent / Decimal("100.00"))
        item_net = item_gross - item_disc
        item_iva = item_net * (item.iva_rate / Decimal("100.00"))
        item_tot = item_net + item_iva

        subtotal += item_gross
        discount_total += item_disc
        iva_total += item_iva

        items_out.append({
            "id": idx,
            "product_id": item.product_id,
            "description": item.description,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "discount_percent": item.discount_percent,
            "iva_rate": item.iva_rate,
            "subtotal": round(item_gross, 2),
            "iva_amount": round(item_iva, 2),
            "total": round(item_tot, 2),
        })

    final_total = (subtotal - discount_total) + iva_total
    today = date.today()
    valid_date = payload.valid_until or (today + timedelta(days=15 if payload.quote_type == "cotacao" else 30))

    new_quote = {
        "id": _quote_counter,
        "company_id": tenant_id,
        "quote_number": quote_number,
        "quote_type": payload.quote_type.lower(),
        "customer_id": payload.customer_id,
        "customer_name": payload.customer_name,
        "customer_nuit": payload.customer_nuit,
        "customer_phone": payload.customer_phone,
        "customer_email": payload.customer_email,
        "customer_address": payload.customer_address,
        "issue_date": today,
        "valid_until": valid_date,
        "status": "enviada",
        "subtotal": round(subtotal, 2),
        "iva_total": round(iva_total, 2),
        "discount_total": round(discount_total, 2),
        "total": round(final_total, 2),
        "payment_terms": payload.payment_terms,
        "notes": payload.notes,
        "converted_sale_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "items": items_out,
    }

    if tenant_id not in _quotes_db:
        _quotes_db[tenant_id] = []

    _quotes_db[tenant_id].insert(0, new_quote)
    return new_quote


@router.get("/{quote_id}", response_model=QuoteResponse)
def get_quote(
    quote_id: int,
    tenant_id: int = Depends(get_tenant_id),
):
    """Consultar detalhes completos de uma cotação/proforma."""
    quotes = _quotes_db.get(tenant_id, [])
    match = next((q for q in quotes if q["id"] == quote_id), None)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")
    return match


@router.patch("/{quote_id}/status", response_model=QuoteResponse)
def update_quote_status(
    quote_id: int,
    payload: QuoteUpdateStatus,
    tenant_id: int = Depends(get_tenant_id),
):
    """Atualizar estado da cotação (rascunho, enviada, aprovada, recusada)."""
    quotes = _quotes_db.get(tenant_id, [])
    match = next((q for q in quotes if q["id"] == quote_id), None)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")

    match["status"] = payload.status.lower()
    match["updated_at"] = datetime.utcnow()
    if payload.rejection_reason:
        match["notes"] = f"{match.get('notes') or ''} [Motivo Recusa: {payload.rejection_reason}]"

    return match


@router.post("/{quote_id}/convert-to-sale", response_model=ConvertQuoteToSaleResponse)
def convert_quote_to_sale(
    quote_id: int,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Converter Cotação ou Proforma aprovada em Factura Final (FT/FR) no POS."""
    quotes = _quotes_db.get(tenant_id, [])
    match = next((q for q in quotes if q["id"] == quote_id), None)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cotação não encontrada")

    # Criar a venda no banco de dados
    inv_num = f"FT-{date.today().year}/{str(quote_id).zfill(4)}"
    sale = Sale(
        company_id=tenant_id,
        customer_id=match.get("customer_id"),
        user_id=1,
        invoice_number=inv_num,
        total_amount=match["total"],
        tax_amount=match["iva_total"],
        discount_amount=match["discount_total"],
        net_amount=match["subtotal"],
        payment_method="Pendente",
        payment_status="completed",
        created_at=datetime.utcnow(),
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)

    match["status"] = "convertida"
    match["converted_sale_id"] = sale.id
    match["updated_at"] = datetime.utcnow()

    return {
        "quote_id": quote_id,
        "quote_number": match["quote_number"],
        "sale_id": sale.id,
        "invoice_number": inv_num,
        "total_mzn": match["total"],
        "message": f"Cotação {match['quote_number']} convertida com sucesso na Fatura {inv_num}!",
    }

