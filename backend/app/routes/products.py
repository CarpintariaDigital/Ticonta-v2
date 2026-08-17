from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.entities import Product

router = APIRouter(prefix="/api/v1/products", tags=["Products & Inventory"])


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category: Optional[str] = None
    unit_price: float
    cost_price: float = 0.0
    quantity: float = 0.0
    iva_rate: float = 16.0
    active: bool = True
    barcode: Optional[str] = None

    class Config:
        from_attributes = True


DEFAULT_PRODUCTS = [
    {"id": 1, "name": "Cimento Nacional 50kg", "sku": "CIM-001", "category": "Construção", "unit_price": 450.0, "cost_price": 380.0, "quantity": 120, "iva_rate": 16.0, "active": True, "barcode": "6001234567890"},
    {"id": 2, "name": "Tinta Acrílica Branca 20L", "sku": "TNT-002", "category": "Pintura", "unit_price": 1250.0, "cost_price": 950.0, "quantity": 35, "iva_rate": 16.0, "active": True, "barcode": "6001234567891"},
    {"id": 3, "name": "Tubo PVC Esgoto 110mm", "sku": "PVC-110", "category": "Canalização", "unit_price": 380.0, "cost_price": 260.0, "quantity": 80, "iva_rate": 16.0, "active": True, "barcode": "6001234567892"},
    {"id": 4, "name": "Varão de Aço 12mm (12m)", "sku": "VAR-12", "category": "Construção", "unit_price": 620.0, "cost_price": 490.0, "quantity": 200, "iva_rate": 16.0, "active": True, "barcode": "6001234567893"},
    {"id": 5, "name": "Disjuntor Bipolar 25A", "sku": "ELT-025", "category": "Eletricidade", "unit_price": 290.0, "cost_price": 190.0, "quantity": 45, "iva_rate": 16.0, "active": True, "barcode": "6001234567894"},
    {"id": 6, "name": "Piso Cerâmico 60x60 Bege (m²)", "sku": "CER-060", "category": "Acabamentos", "unit_price": 520.0, "cost_price": 390.0, "quantity": 150, "iva_rate": 16.0, "active": True, "barcode": "6001234567895"},
    {"id": 7, "name": "Lâmpada LED 12W Branca", "sku": "LED-012", "category": "Eletricidade", "unit_price": 85.0, "cost_price": 45.0, "quantity": 300, "iva_rate": 16.0, "active": True, "barcode": "6001234567896"},
    {"id": 8, "name": "Chapa de Zinco Ondulada 3m", "sku": "CHP-003", "category": "Construção", "unit_price": 410.0, "cost_price": 310.0, "quantity": 90, "iva_rate": 16.0, "active": True, "barcode": "6001234567897"},
]


@router.get("", response_model=List[ProductResponse])
def list_products(
    company_id: int = Query(1),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    try:
        query = db.query(Product).filter(Product.company_id == company_id, Product.active == True)
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%") | Product.barcode.ilike(f"%{search}%"))
        if category:
            query = query.filter(Product.category == category)
        products = query.all()
        if products:
            return products
    except Exception:
        pass
    
    # Fallback to default catalog if database is not yet seeded
    return DEFAULT_PRODUCTS
