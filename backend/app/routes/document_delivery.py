from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.document_delivery import DocumentDelivery
from app.models.user import User
from app.services.document_delivery import DocumentDeliveryService

router = APIRouter(prefix="/api/v1/documents", tags=["Document Delivery (WhatsApp / SMS)"])


class SendDocumentRequest(BaseModel):
    document_type: str = Field(default="invoice", description="invoice, receipt, quote, purchase_order")
    delivery_method: str = Field(default="whatsapp", description="whatsapp, sms, email")
    customer_phone: Optional[str] = Field(default=None, description="Formato com DDI: +258841234567")
    customer_email: Optional[str] = None


class BatchSendRequest(BaseModel):
    document_ids: List[int] = Field(..., min_length=1)
    document_type: str = Field(default="invoice")
    delivery_method: str = Field(default="whatsapp")


class DocumentDeliveryResponse(BaseModel):
    id: int
    company_id: int
    document_type: str
    document_id: int
    delivery_method: str
    status: str
    pdf_url: str
    message_id: Optional[str] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None


# 1. POST /api/v1/documents/{id}/send
@router.post("/{id}/send", response_model=DocumentDeliveryResponse, status_code=status.HTTP_201_CREATED)
def send_document(
    id: int,
    req: SendDocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Envia um documento específico por WhatsApp, SMS ou Email com link de download temporário."""
    svc = DocumentDeliveryService(db)
    try:
        delivery = svc.send_document(
            company_id=1,
            document_type=req.document_type,
            document_id=id,
            delivery_method=req.delivery_method,
            customer_phone=req.customer_phone,
            customer_email=req.customer_email,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

    return DocumentDeliveryResponse(
        id=delivery.id,
        company_id=delivery.company_id,
        document_type=delivery.document_type,
        document_id=delivery.document_id,
        delivery_method=delivery.delivery_method,
        status=delivery.status,
        pdf_url=delivery.pdf_url,
        message_id=delivery.message_id,
        sent_at=delivery.sent_at,
        delivered_at=delivery.delivered_at,
    )


# 2. GET /api/v1/documents/{id}/delivery-status
@router.get("/{id}/delivery-status")
def get_document_delivery_status(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Consulta o histórico de entregas de um determinado documento."""
    deliveries = db.query(DocumentDelivery).filter(DocumentDelivery.document_id == id).order_by(DocumentDelivery.created_at.desc()).all()
    if not deliveries:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nenhum registo de envio para este documento.")

    latest = deliveries[0]
    return {
        "document_id": id,
        "delivery_id": latest.id,
        "delivery_method": latest.delivery_method,
        "status": latest.status,
        "pdf_url": latest.pdf_url,
        "sent_at": latest.sent_at,
        "delivered_at": latest.delivered_at,
        "history_count": len(deliveries),
    }


# 3. POST /api/v1/documents/{id}/resend
@router.post("/{id}/resend", response_model=DocumentDeliveryResponse)
def resend_document(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reenvia o documento caso a entrega anterior tenha falhado ou seja necessária 2ª via."""
    delivery = db.query(DocumentDelivery).filter(DocumentDelivery.id == id).first()
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registo de entrega não encontrado.")

    svc = DocumentDeliveryService(db)
    new_delivery = svc.send_document(
        company_id=delivery.company_id,
        document_type=delivery.document_type,
        document_id=delivery.document_id,
        delivery_method=delivery.delivery_method,
        customer_phone=delivery.customer_phone,
        customer_email=delivery.customer_email,
    )

    return DocumentDeliveryResponse(
        id=new_delivery.id,
        company_id=new_delivery.company_id,
        document_type=new_delivery.document_type,
        document_id=new_delivery.document_id,
        delivery_method=new_delivery.delivery_method,
        status=new_delivery.status,
        pdf_url=new_delivery.pdf_url,
        message_id=new_delivery.message_id,
        sent_at=new_delivery.sent_at,
        delivered_at=new_delivery.delivered_at,
    )


# 4. GET /api/v1/documents/delivery-history
@router.get("/delivery-history")
def get_delivery_history(
    delivery_method: Optional[str] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Listagem e auditoria de todos os envios efetuados."""
    query = db.query(DocumentDelivery)
    if delivery_method:
        query = query.filter(DocumentDelivery.delivery_method == delivery_method.lower())
    if status_filter:
        query = query.filter(DocumentDelivery.status == status_filter.lower())

    results = query.order_by(DocumentDelivery.created_at.desc()).limit(100).all()
    return [
        {
            "id": d.id,
            "document_type": d.document_type,
            "document_id": d.document_id,
            "customer_phone": d.customer_phone,
            "customer_email": d.customer_email,
            "delivery_method": d.delivery_method,
            "status": d.status,
            "pdf_url": d.pdf_url,
            "sent_at": d.sent_at,
        }
        for d in results
    ]


# 5. POST /api/v1/documents/batch-send
@router.post("/batch-send")
def batch_send_documents(
    req: BatchSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Disparo em lote de múltiplos documentos."""
    svc = DocumentDeliveryService(db)
    result = svc.batch_send(
        company_id=1,
        document_ids=req.document_ids,
        document_type=req.document_type,
        delivery_method=req.delivery_method,
    )
    return result
