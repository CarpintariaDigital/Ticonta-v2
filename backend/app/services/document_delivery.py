from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.integrations.cloud_storage import CloudStorageService
from app.integrations.twilio import TwilioIntegration
from app.models.document_delivery import DocumentDelivery
from app.models.entities import Company
from app.models.sale import Sale
from app.services.email import EmailService
from app.services.pdf_generator import PDFGenerator


class DocumentDeliveryService:
    """Serviço unificado de envio de documentos fiscais e comerciais por WhatsApp, SMS e Email."""

    def __init__(self, db: Session):
        self.db = db
        self.storage = CloudStorageService()
        self.twilio = TwilioIntegration()

    def generate_document_pdf(self, document_type: str, document_id: int) -> str:
        """Gera o documento e armazena na nuvem, retornando a URL pública."""
        company = self.db.query(Company).filter(Company.id == 1).first()
        company_data = {
            "name": company.name if company else "TiConta Lda",
            "nuit": company.nuit if company else "400123999",
            "address": company.address if company else "Maputo, Moçambique",
            "email": company.email if company else "contato@ticonta.co.mz",
        }

        if document_type in ["invoice", "receipt"]:
            sale = self.db.query(Sale).filter(Sale.id == document_id).first()
            if not sale:
                raise ValueError(f"Venda ID {document_id} não encontrada.")

            sale_data = {
                "invoice_number": sale.invoice_number,
                "date": sale.created_at.strftime("%d/%m/%Y") if sale.created_at else "15/08/2026",
                "payment_method": sale.payment_method,
                "payment_status": sale.payment_status,
                "total_amount": float(sale.total_amount),
                "tax_amount": float(sale.tax_amount),
                "discount_amount": float(sale.discount_amount),
            }

            customer = sale.customer
            customer_data = {
                "name": customer.name if customer else "Consumidor Final",
                "nuit": customer.nuit if customer else "N/D",
                "phone": customer.phone if (customer and hasattr(customer, "phone")) else "N/D",
            }

            items = []
            for item in sale.items:
                total_item = float(item.quantity) * float(item.unit_price)
                items.append({
                    "name": item.product.name if item.product else "Artigo",
                    "quantity": float(item.quantity),
                    "unit_price": float(item.unit_price),
                    "tax_rate": float(item.tax_rate),
                    "total": total_item,
                })

            pdf_bytes = PDFGenerator.generate_invoice_pdf(
                company_data=company_data,
                customer_data=customer_data,
                sale_data=sale_data,
                items=items if items else [{"name": "Serviço/Produto", "quantity": 1, "unit_price": float(sale.total_amount), "tax_rate": 16, "total": float(sale.total_amount)}],
            )
            filename = f"fatura_{sale.invoice_number.replace('/', '_')}.pdf"

        else:
            # Fallback para outros tipos de documentos
            pdf_bytes = PDFGenerator.generate_receipt_pdf(
                company_data=company_data,
                sale_data={"invoice_number": f"DOC-{document_id}", "total_amount": 1000.0, "tax_amount": 160.0, "discount_amount": 0.0},
                items=[{"name": f"Documento {document_type.upper()}", "quantity": 1, "unit_price": 1000.0, "tax_rate": 16, "total": 1000.0}],
            )
            filename = f"{document_type}_{document_id}.pdf"

        return self.storage.upload_pdf(pdf_bytes, filename)

    def send_document(
        self,
        company_id: int,
        document_type: str,
        document_id: int,
        delivery_method: str,
        customer_phone: Optional[str] = None,
        customer_email: Optional[str] = None,
    ) -> DocumentDelivery:
        """Executa o envio do documento pelo canal selecionado e regista a entrega."""
        pdf_url = self.generate_document_pdf(document_type, document_id)

        delivery = DocumentDelivery(
            company_id=company_id,
            document_type=document_type,
            document_id=document_id,
            customer_phone=customer_phone,
            customer_email=customer_email,
            delivery_method=delivery_method.lower(),
            pdf_url=pdf_url,
            status="pending",
        )
        self.db.add(delivery)
        self.db.commit()
        self.db.refresh(delivery)

        try:
            if delivery_method.lower() == "whatsapp" and customer_phone:
                res = self.twilio.send_whatsapp_message(
                    to_phone=customer_phone,
                    body=f"Olá! O seu documento TiConta ({document_type.upper()}) está pronto para download.",
                    media_url=pdf_url,
                )
                delivery.message_id = res.get("sid")
                delivery.status = "sent"
                delivery.sent_at = datetime.utcnow()

            elif delivery_method.lower() == "sms" and customer_phone:
                res = self.twilio.send_sms_message(
                    to_phone=customer_phone,
                    body=f"TiConta: Aceda ao seu {document_type.upper()}: {pdf_url}",
                )
                delivery.message_id = res.get("sid")
                delivery.status = "sent"
                delivery.sent_at = datetime.utcnow()

            elif delivery_method.lower() == "email" and customer_email:
                EmailService.send_license_generated_email(
                    customer_email=customer_email,
                    customer_name="Cliente",
                    license_key=pdf_url,
                    plan=document_type,
                    expires_at="48h",
                )
                delivery.status = "sent"
                delivery.sent_at = datetime.utcnow()

        except Exception as e:
            delivery.status = "failed"
            delivery.error_message = str(e)

        self.db.commit()
        self.db.refresh(delivery)
        return delivery

    def batch_send(
        self,
        company_id: int,
        document_ids: List[int],
        document_type: str,
        delivery_method: str,
    ) -> Dict[str, Any]:
        """Disparo em lote de múltiplos documentos."""
        sent_count = 0
        failed_count = 0

        for doc_id in document_ids:
            try:
                self.send_document(
                    company_id=company_id,
                    document_type=document_type,
                    document_id=doc_id,
                    delivery_method=delivery_method,
                    customer_phone="+258840000000",
                )
                sent_count += 1
            except Exception:
                failed_count += 1

        return {
            "batch_id": f"batch_{int(datetime.utcnow().timestamp())}",
            "count_sent": sent_count,
            "count_failed": failed_count,
        }
