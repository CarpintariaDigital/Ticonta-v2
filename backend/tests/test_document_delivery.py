import pytest
from app.services.pdf_generator import PDFGenerator
from app.integrations.cloud_storage import CloudStorageService
from app.integrations.twilio import TwilioIntegration


def test_pdf_generation_invoice_and_receipt():
    company = {"name": "Carpintaria Moderna Lda", "nuit": "400123999"}
    customer = {"name": "Cliente Exemplo", "nuit": "999888777", "phone": "+258841112233"}
    sale = {
        "invoice_number": "FT-2026/001",
        "date": "15/08/2026",
        "payment_method": "mpesa",
        "payment_status": "completed",
        "total_amount": 7500.0,
        "tax_amount": 1200.0,
        "discount_amount": 0.0,
    }
    items = [
        {"name": "Porta Chanfuta Maciça", "quantity": 1, "unit_price": 7500.0, "tax_rate": 16, "total": 7500.0}
    ]

    # 1. Gerar PDF de Fatura
    pdf_bytes = PDFGenerator.generate_invoice_pdf(company, customer, sale, items)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")

    # 2. Gerar PDF de Recibo
    receipt_bytes = PDFGenerator.generate_receipt_pdf(company, sale, items)
    assert len(receipt_bytes) > 500
    assert receipt_bytes.startswith(b"%PDF")


def test_cloud_storage_temporary_urls():
    storage = CloudStorageService()
    pdf_data = b"%PDF-1.4 Mock Content"
    url = storage.upload_pdf(pdf_data, "fatura_teste.pdf", expiration_hours=48)
    assert url.startswith("https://")
    assert "exp=" in url
    assert "sig=" in url


def test_twilio_whatsapp_and_sms_sending():
    twilio = TwilioIntegration()

    # WhatsApp
    wa_res = twilio.send_whatsapp_message(
        to_phone="+258841234567",
        body="Olá! O seu recibo TiConta v2 está disponível.",
        media_url="https://documents.ticonta.co.mz/docs/recibo.pdf",
    )
    assert wa_res["success"] is True
    assert wa_res["status"] == "sent"
    assert wa_res["sid"].startswith("SM_WA_")

    # SMS
    sms_res = twilio.send_sms_message(
        to_phone="+258841234567",
        body="TiConta: Seu recibo: https://documents.ticonta.co.mz/docs/recibo.pdf",
    )
    assert sms_res["success"] is True
    assert sms_res["status"] == "sent"
    assert sms_res["sid"].startswith("SM_SMS_")


def test_document_delivery_api_routes(client, admin_token_headers):
    # 1. Criar uma venda no sistema para ter um sale_id válido
    sale_res = client.post(
        "/api/v1/sales",
        json={
            "company_id": 1,
            "customer_id": 1,
            "payment_method": "mpesa",
            "items": [{"product_id": 1, "quantity": 1, "unit_price": "7500.00", "tax_rate": "16.00"}],
            "discount": "0.00",
        },
        headers=admin_token_headers,
    )
    assert sale_res.status_code == 201
    sale_id = sale_res.json()["id"]

    # 2. Disparar envio de fatura por WhatsApp
    send_res = client.post(
        f"/api/v1/documents/{sale_id}/send",
        json={
            "document_type": "invoice",
            "delivery_method": "whatsapp",
            "customer_phone": "+258841234567",
        },
        headers=admin_token_headers,
    )
    assert send_res.status_code == 201
    delivery_data = send_res.json()
    assert delivery_data["status"] == "sent"
    assert delivery_data["pdf_url"].startswith("https://")
    delivery_id = delivery_data["id"]

    # 3. Consultar status da entrega
    status_res = client.get(
        f"/api/v1/documents/{sale_id}/delivery-status",
        headers=admin_token_headers,
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "sent"

    # 4. Reenviar documento
    resend_res = client.post(
        f"/api/v1/documents/{delivery_id}/resend",
        headers=admin_token_headers,
    )
    assert resend_res.status_code == 200
    assert resend_res.json()["status"] == "sent"

    # 5. Consultar histórico de entregas
    history_res = client.get(
        "/api/v1/documents/delivery-history?delivery_method=whatsapp",
        headers=admin_token_headers,
    )
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1

    # 6. Disparo em lote (Batch Send)
    batch_res = client.post(
        "/api/v1/documents/batch-send",
        json={
            "document_ids": [sale_id],
            "document_type": "invoice",
            "delivery_method": "sms",
        },
        headers=admin_token_headers,
    )
    assert batch_res.status_code == 200
    assert batch_res.json()["count_sent"] == 1
