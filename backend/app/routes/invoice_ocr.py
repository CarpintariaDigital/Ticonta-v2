"""
Invoice OCR & Ingestion Router (TiConta ERP v2).
Provides endpoints for extracting and validating fiscal invoices from PDF/images using Marker + Pydantic.
"""

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.schemas.invoice_ocr import InvoiceOCRResponse
from app.services.invoice_ocr_service import invoice_ocr_service

router = APIRouter(prefix="/api/v1/invoices", tags=["Invoices & OCR"])


@router.post("/ocr", response_model=dict, status_code=status.HTTP_200_OK)
async def process_invoice_ocr(file: UploadFile = File(...)):
    """
    Processa uma fatura em formato PDF ou imagem, executando OCR estruturado
    e validação tributária estrita (NUIT de 9 dígitos e cálculo de IVA a 16%).
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo não fornecido ou nome de arquivo inválido."
        )

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O arquivo enviado está vazio."
            )

        validated_invoice, errors = invoice_ocr_service.process_invoice(contents, file.filename)

        if errors or not validated_invoice:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"message": "Inconformidade fiscal detectada na fatura", "errors": errors}
            )

        return {
            "success": True,
            "message": "Fatura processada e validada com sucesso.",
            "data": validated_invoice.model_dump(mode="json")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno no processamento OCR: {str(e)}"
        )
