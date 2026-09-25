from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.dependencies.tenant import get_tenant_id
from app.models.entities import Product
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
    StockMovementCreate,
    StockMovementResponse,
    InventoryOverviewStats,
)

router = APIRouter(prefix="/api/v1/inventory", tags=["Stock & Aprovisionamento"])

# Movimentos de stock em memória com persistência por tenant
_stock_movements_db: Dict[int, List[Dict[str, Any]]] = {}
_movement_counter = 1000


@router.get("/overview", response_model=InventoryOverviewStats)
def get_inventory_overview(
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Resumo estatístico do inventário, valor de stock e alertas de rutura."""
    products = db.query(Product).filter(Product.company_id == tenant_id, Product.active == True).all()

    total_items = len(products)
    low_stock = 0
    out_of_stock = 0
    total_units = Decimal("0.000")
    total_cost = Decimal("0.00")
    total_retail = Decimal("0.00")

    for p in products:
        qty = Decimal(str(p.quantity or 0))
        cost = Decimal(str(p.cost_price or 0))
        price = Decimal(str(p.unit_price or 0))

        total_units += qty
        total_cost += qty * cost
        total_retail += qty * price

        if qty <= Decimal("0.000"):
            out_of_stock += 1
        elif qty <= Decimal("5.000"):
            low_stock += 1

    potential_margin = max(Decimal("0.00"), total_retail - total_cost)

    return {
        "total_items": total_items,
        "low_stock_count": low_stock,
        "out_of_stock_count": out_of_stock,
        "total_stock_units": round(total_units, 2),
        "total_cost_value_mzn": round(total_cost, 2),
        "total_retail_value_mzn": round(total_retail, 2),
        "potential_margin_mzn": round(potential_margin, 2),
        "currency": "MZN",
    }


@router.get("/items", response_model=List[InventoryItemResponse])
def list_inventory_items(
    category: Optional[str] = None,
    low_stock_only: bool = False,
    search: Optional[str] = None,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Listar artigos em stock com valores e alertas."""
    query = db.query(Product).filter(Product.company_id == tenant_id)

    if category and category.lower() != "todas":
        query = query.filter(Product.category == category)
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%"))
            | (Product.sku.ilike(f"%{search}%"))
            | (Product.barcode.ilike(f"%{search}%"))
        )

    products = query.order_by(Product.name.asc()).all()

    # Seed inicial caso não existam produtos cadastrados
    if not products:
        seed_products = [
            Product(
                company_id=tenant_id,
                name="Sacos de Arroz 25kg (Lote Especial)",
                sku="ALIM-ARR-025",
                category="Alimentar",
                unit_price=Decimal("1350.00"),
                cost_price=Decimal("1100.00"),
                quantity=Decimal("45.000"),
                iva_rate=Decimal("16.00"),
                active=True,
            ),
            Product(
                company_id=tenant_id,
                name="Óleo Alimentar 5L (Caixa 4un)",
                sku="ALIM-OLE-005",
                category="Alimentar",
                unit_price=Decimal("580.00"),
                cost_price=Decimal("460.00"),
                quantity=Decimal("18.000"),
                iva_rate=Decimal("16.00"),
                active=True,
            ),
            Product(
                company_id=tenant_id,
                name="Ração Inicial Frangos 50kg",
                sku="AGRO-RAC-050",
                category="Agro",
                unit_price=Decimal("2450.00"),
                cost_price=Decimal("1950.00"),
                quantity=Decimal("4.000"),  # Alerta de stock baixo (< 5)
                iva_rate=Decimal("16.00"),
                active=True,
            ),
            Product(
                company_id=tenant_id,
                name="Óleo de Motor 20W50 5L",
                sku="AUTO-OLE-020",
                category="Auto",
                unit_price=Decimal("1850.00"),
                cost_price=Decimal("1400.00"),
                quantity=Decimal("2.000"),  # Alerta de stock baixo
                iva_rate=Decimal("16.00"),
                active=True,
            ),
            Product(
                company_id=tenant_id,
                name="Frango Congelado 1.5kg",
                sku="REST-FRA-015",
                category="Restaurante",
                unit_price=Decimal("220.00"),
                cost_price=Decimal("165.00"),
                quantity=Decimal("80.000"),
                iva_rate=Decimal("16.00"),
                active=True,
            ),
        ]
        for sp in seed_products:
            db.add(sp)
        db.commit()
        products = db.query(Product).filter(Product.company_id == tenant_id).all()

    results = []
    for p in products:
        qty = Decimal(str(p.quantity or 0))
        cost = Decimal(str(p.cost_price or 0))
        price = Decimal(str(p.unit_price or 0))
        is_low = qty <= Decimal("5.000")

        if low_stock_only and not is_low:
            continue

        results.append({
            "id": p.id,
            "company_id": p.company_id,
            "name": p.name,
            "sku": p.sku,
            "barcode": p.barcode,
            "category": p.category or "Geral",
            "unit": "un",
            "unit_price": price,
            "cost_price": cost,
            "current_stock": qty,
            "min_stock_alert": Decimal("5.000"),
            "iva_rate": Decimal(str(p.iva_rate or 16.00)),
            "location": "Armazém Principal",
            "supplier_id": None,
            "active": p.active,
            "stock_value_cost_mzn": round(qty * cost, 2),
            "stock_value_retail_mzn": round(qty * price, 2),
            "is_low_stock": is_low,
            "created_at": p.created_at or datetime.utcnow(),
            "updated_at": p.updated_at or datetime.utcnow(),
        })

    return results


@router.post("/items", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    payload: InventoryItemCreate,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Criar novo artigo no catálogo de inventário."""
    existing = db.query(Product).filter(Product.company_id == tenant_id, Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"O SKU '{payload.sku}' já existe.")

    product = Product(
        company_id=tenant_id,
        name=payload.name,
        sku=payload.sku,
        barcode=payload.barcode,
        category=payload.category,
        unit_price=payload.unit_price,
        cost_price=payload.cost_price,
        quantity=payload.current_stock,
        iva_rate=payload.iva_rate,
        active=payload.active,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    qty = Decimal(str(product.quantity))
    cost = Decimal(str(product.cost_price))
    price = Decimal(str(product.unit_price))

    return {
        "id": product.id,
        "company_id": product.company_id,
        "name": product.name,
        "sku": product.sku,
        "barcode": product.barcode,
        "category": product.category or "Geral",
        "unit": payload.unit,
        "unit_price": price,
        "cost_price": cost,
        "current_stock": qty,
        "min_stock_alert": payload.min_stock_alert,
        "iva_rate": Decimal(str(product.iva_rate)),
        "location": payload.location or "Armazém Principal",
        "supplier_id": payload.supplier_id,
        "active": product.active,
        "stock_value_cost_mzn": round(qty * cost, 2),
        "stock_value_retail_mzn": round(qty * price, 2),
        "is_low_stock": qty <= payload.min_stock_alert,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }


@router.post("/movements", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
def record_stock_movement(
    payload: StockMovementCreate,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    """Registar entrada ou saída manual / aprovisionamento de stock."""
    global _movement_counter
    _movement_counter += 1

    product = db.query(Product).filter(Product.id == payload.product_id, Product.company_id == tenant_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artigo não encontrado no catálogo")

    stock_before = Decimal(str(product.quantity or 0))
    qty = payload.quantity

    if payload.movement_type.startswith("in_"):
        stock_after = stock_before + qty
        if payload.unit_cost and payload.unit_cost > 0:
            product.cost_price = payload.unit_cost
    else:
        if stock_before < qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente ({stock_before}) para efetuar a saída de {qty} unidades.",
            )
        stock_after = stock_before - qty

    product.quantity = stock_after
    db.commit()

    movement = {
        "id": _movement_counter,
        "company_id": tenant_id,
        "product_id": product.id,
        "product_name": product.name,
        "product_sku": product.sku,
        "movement_type": payload.movement_type,
        "quantity": qty,
        "stock_before": stock_before,
        "stock_after": stock_after,
        "unit_cost": payload.unit_cost or product.cost_price,
        "reference_document": payload.reference_document,
        "notes": payload.notes,
        "created_at": datetime.utcnow(),
    }

    if tenant_id not in _stock_movements_db:
        _stock_movements_db[tenant_id] = []

    _stock_movements_db[tenant_id].insert(0, movement)
    return movement


@router.get("/movements", response_model=List[StockMovementResponse])
def list_stock_movements(
    product_id: Optional[int] = None,
    tenant_id: int = Depends(get_tenant_id),
):
    """Listar histórico de movimentos de stock."""
    movements = _stock_movements_db.get(tenant_id, [])
    if product_id:
        movements = [m for m in movements if m["product_id"] == product_id]
    return movements
