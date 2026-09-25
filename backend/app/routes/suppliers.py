from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.tenant import get_tenant_id
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierPurchaseInvoiceCreate,
    SupplierPurchaseInvoiceResponse,
    SupplierPaymentRecordCreate,
)

router = APIRouter(prefix="/api/v1/suppliers", tags=["Fornecedores & Contas a Pagar"])

# Armazenamento em memória com persistência por tenant
_suppliers_db: Dict[int, List[Dict[str, Any]]] = {}
_invoices_db: Dict[int, List[Dict[str, Any]]] = {}
_supplier_counter = 100
_invoice_counter = 500


@router.get("", response_model=List[SupplierResponse])
def list_suppliers(
    category: Optional[str] = None,
    search: Optional[str] = None,
    tenant_id: int = Depends(get_tenant_id),
):
    """Listar fornecedores cadastrados com saldos em dívida e histórico."""
    suppliers = _suppliers_db.get(tenant_id, [])

    # Seed inicial demonstrativo
    if not suppliers:
        seed_suppliers = [
            {
                "id": 1,
                "company_id": tenant_id,
                "name": "Companhia Industrial da Matola (CIM)",
                "nuit": "100123456",
                "contact_person": "Sr. Amílcar Sitoe",
                "phone": "+258843344556",
                "email": "vendas@cim.co.mz",
                "address": "Estrada Nacional 4, Matola",
                "city": "Matola",
                "category": "Alimentar",
                "payment_terms": "30 Dias",
                "bank_name": "Millennium BIM",
                "bank_account": "1234567890",
                "bank_nib": "000100001234567890123",
                "notes": "Fornecedor principal de farinha, arroz e farelo.",
                "active": True,
                "total_purchased_mzn": Decimal("185000.00"),
                "total_debt_mzn": Decimal("45000.00"),
                "purchases_count": 8,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            {
                "id": 2,
                "company_id": tenant_id,
                "name": "Agro-Nutrição Moçambique Lda",
                "nuit": "100789012",
                "contact_person": "Dra. Celma Cossa",
                "phone": "+258825566778",
                "email": "pedidos@agronutri.co.mz",
                "address": "Bairro do Zimpeto, Maputo",
                "city": "Maputo",
                "category": "Agro",
                "payment_terms": "15 Dias",
                "bank_name": "BCI",
                "bank_account": "9876543210",
                "bank_nib": "000800009876543210456",
                "notes": "Fornecimento de rações zootécnicas e suplementos avícolas.",
                "active": True,
                "total_purchased_mzn": Decimal("92000.00"),
                "total_debt_mzn": Decimal("12500.00"),
                "purchases_count": 5,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
            {
                "id": 3,
                "company_id": tenant_id,
                "name": "Auto Peças Central Maputo",
                "nuit": "100334455",
                "contact_person": "Sr. Manuel Ribeiro",
                "phone": "+258841122334",
                "email": "geral@autopecas.co.mz",
                "address": "Av. Karl Marx, Maputo",
                "city": "Maputo",
                "category": "Auto",
                "payment_terms": "Pronto Pagamento",
                "bank_name": "Standard Bank",
                "bank_account": "4455667788",
                "bank_nib": "000300004455667788789",
                "notes": "Peças sobressalentes e filtros para oficinas.",
                "active": True,
                "total_purchased_mzn": Decimal("34000.00"),
                "total_debt_mzn": Decimal("0.00"),
                "purchases_count": 3,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            },
        ]
        _suppliers_db[tenant_id] = seed_suppliers
        suppliers = seed_suppliers

    filtered = suppliers
    if category and category.lower() != "todas":
        filtered = [s for s in filtered if s["category"].lower() == category.lower()]
    if search:
        s_clean = search.lower()
        filtered = [
            s for s in filtered
            if s_clean in s["name"].lower()
            or (s.get("nuit") and s_clean in s["nuit"])
            or (s.get("contact_person") and s_clean in s["contact_person"].lower())
        ]

    return filtered


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    payload: SupplierCreate,
    tenant_id: int = Depends(get_tenant_id),
):
    """Registar novo fornecedor."""
    global _supplier_counter
    _supplier_counter += 1

    new_supp = {
        "id": _supplier_counter,
        "company_id": tenant_id,
        "name": payload.name,
        "nuit": payload.nuit,
        "contact_person": payload.contact_person,
        "phone": payload.phone,
        "email": payload.email,
        "address": payload.address,
        "city": payload.city or "Maputo",
        "category": payload.category,
        "payment_terms": payload.payment_terms,
        "bank_name": payload.bank_name,
        "bank_account": payload.bank_account,
        "bank_nib": payload.bank_nib,
        "notes": payload.notes,
        "active": payload.active,
        "total_purchased_mzn": Decimal("0.00"),
        "total_debt_mzn": Decimal("0.00"),
        "purchases_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    if tenant_id not in _suppliers_db:
        _suppliers_db[tenant_id] = []

    _suppliers_db[tenant_id].insert(0, new_supp)
    return new_supp


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    tenant_id: int = Depends(get_tenant_id),
):
    """Consultar dados de um fornecedor."""
    suppliers = _suppliers_db.get(tenant_id, [])
    match = next((s for s in suppliers if s["id"] == supplier_id), None)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado")
    return match


@router.post("/invoices", response_model=SupplierPurchaseInvoiceResponse, status_code=status.HTTP_201_CREATED)
def record_purchase_invoice(
    payload: SupplierPurchaseInvoiceCreate,
    tenant_id: int = Depends(get_tenant_id),
):
    """Registar fatura de compra a fornecedor e atualizar dívida."""
    global _invoice_counter
    _invoice_counter += 1

    suppliers = _suppliers_db.get(tenant_id, [])
    supp = next((s for s in suppliers if s["id"] == payload.supplier_id), None)
    if not supp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fornecedor não encontrado")

    invoice = {
        "id": _invoice_counter,
        "supplier_id": supp["id"],
        "supplier_name": supp["name"],
        "invoice_number": payload.invoice_number,
        "invoice_date": payload.invoice_date,
        "due_date": payload.due_date,
        "total_amount": payload.total_amount,
        "iva_amount": payload.iva_amount,
        "paid_amount": Decimal("0.00"),
        "balance_due": payload.total_amount,
        "status": "pendente",
        "description": payload.description,
        "created_at": datetime.utcnow(),
    }

    supp["total_purchased_mzn"] += payload.total_amount
    supp["total_debt_mzn"] += payload.total_amount
    supp["purchases_count"] += 1

    if tenant_id not in _invoices_db:
        _invoices_db[tenant_id] = []

    _invoices_db[tenant_id].insert(0, invoice)
    return invoice


@router.get("/invoices/all", response_model=List[SupplierPurchaseInvoiceResponse])
def list_purchase_invoices(
    supplier_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    tenant_id: int = Depends(get_tenant_id),
):
    """Listar faturas de fornecedores e contas a pagar."""
    invoices = _invoices_db.get(tenant_id, [])
    if supplier_id:
        invoices = [i for i in invoices if i["supplier_id"] == supplier_id]
    if status_filter:
        invoices = [i for i in invoices if i["status"] == status_filter.lower()]
    return invoices
