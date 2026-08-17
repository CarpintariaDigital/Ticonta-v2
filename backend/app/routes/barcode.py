from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Product
from app.models.user import User
from app.services.barcode import BarcodeService

router = APIRouter(tags=["Barcode Scanning"])


class GenerateBarcodeRequest(BaseModel):
    barcode_string: Optional[str] = Field(default=None, description="Código de barras manual ou SKU do produto")
    barcode_format: str = Field(default="Code-128", description="Code-128, EAN-13, UPC-A, QR-Code")


class BarcodeProductResponse(BaseModel):
    product_id: int
    name: str
    sku: str
    barcode: Optional[str] = None
    barcode_format: Optional[str] = None
    unit_price: float
    stock_quantity: float
    tax_rate: float
    category: Optional[str] = None
    active: bool
    scan_count: int


class GenerateBarcodeResponse(BaseModel):
    product_id: int
    name: str
    barcode: str
    barcode_format: str
    barcode_url: str


class ImportBarcodesResponse(BaseModel):
    imported_count: int
    errors: List[str]


# 1. GET /api/v1/barcodes/resolve/{barcode}
@router.get(
    "/api/v1/barcodes/resolve/{barcode}",
    response_model=BarcodeProductResponse,
    summary="Resolução instantânea de produto por código de barras ou SKU (<100ms)",
)
def resolve_barcode(
    barcode: str,
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = BarcodeService(db)
    product_data = svc.resolve_barcode(
        barcode_string=barcode,
        company_id=company_id,
        user_id=current_user.id,
    )
    if not product_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Nenhum produto associado ao código de barras '{barcode}' foi encontrado.",
        )
    return product_data


# 2. POST /api/v1/products/{id}/barcode/generate
@router.post(
    "/api/v1/products/{id}/barcode/generate",
    response_model=GenerateBarcodeResponse,
    summary="Gerar e associar imagem de código de barras a um produto",
)
def generate_product_barcode(
    id: int,
    req: GenerateBarcodeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    svc = BarcodeService(db)
    try:
        result = svc.generate_barcode(
            product_id=id,
            barcode_string=req.barcode_string,
            barcode_format=req.barcode_format,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return result


# 3. POST /api/v1/barcodes/import
@router.post(
    "/api/v1/barcodes/import",
    response_model=ImportBarcodesResponse,
    summary="Importação em massa de códigos de barras via ficheiro CSV",
)
async def bulk_import_barcodes(
    file: UploadFile = File(...),
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contents = await file.read()
    try:
        csv_text = contents.decode("utf-8")
    except UnicodeDecodeError:
        csv_text = contents.decode("latin-1")

    svc = BarcodeService(db)
    result = svc.bulk_import_barcodes(csv_content=csv_text, company_id=company_id)
    return result
