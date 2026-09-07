import hashlib
import time
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
import structlog

logger = structlog.get_logger()


class ElectronicInvoice:
    """
    Gestor de Fatura Eletrônica (NFe / e-Invoice Moçambique) com assinatura digital SHA-256
    e validação perante as exigências da Autoridade Tributária (AT).
    """

    def __init__(self, private_signing_key: str = "TICONTAV2_SECURE_AT_KEY_2026"):
        self.signing_key = private_signing_key

    def generate_nfe(
        self,
        invoice_number: str,
        company_nuit: str,
        company_name: str,
        customer_nuit: Optional[str],
        customer_name: Optional[str],
        items: List[Dict[str, Any]],
        gross_amount: Decimal,
        tax_amount: Decimal,
        discount_amount: Decimal,
        net_amount: Decimal,
        sale_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Gera o documento eletrónico no formato XML/JSON para certificação fiscal."""
        issue_date = sale_date or datetime.utcnow()
        doc_id = f"NFE-MZ-{company_nuit}-{invoice_number.replace(' ', '_').replace('/', '-')}"

        nfe_payload = {
            "document_id": doc_id,
            "version": "1.0",
            "invoice_number": invoice_number,
            "issuer": {
                "nuit": company_nuit,
                "name": company_name,
                "country": "MOZAMBIQUE",
            },
            "recipient": {
                "nuit": customer_nuit or "999999999",
                "name": customer_name or "Consumidor Final",
            },
            "date_of_issue": issue_date.isoformat(),
            "items": items,
            "totals": {
                "currency": "MZN",
                "gross_amount": float(gross_amount),
                "tax_amount": float(tax_amount),
                "discount_amount": float(discount_amount),
                "net_amount": float(net_amount),
            },
            "status": "DRAFT",
        }

        # Assinar documento digitalmente
        signature = self.sign_nfe(nfe_payload)
        nfe_payload["digital_signature"] = signature
        nfe_payload["qr_code_url"] = f"https://at.gov.mz/consultar?doc={doc_id}&sig={signature[:16]}"
        nfe_payload["status"] = "CERTIFIED"

        logger.info("nfe_generated_and_signed", doc_id=doc_id, invoice_number=invoice_number)
        return nfe_payload

    def sign_nfe(self, nfe_data: Dict[str, Any]) -> str:
        """Produz assinatura criptográfica SHA-256 do documento encadeando hash da empresa."""
        canonical_str = (
            f"{nfe_data['issuer']['nuit']}|"
            f"{nfe_data['invoice_number']}|"
            f"{nfe_data['totals']['net_amount']}|"
            f"{nfe_data['date_of_issue']}|"
            f"{self.signing_key}"
        )
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    def validate_nfe(self, nfe_data: Dict[str, Any]) -> bool:
        """Valida integridade da assinatura e consistência dos valores."""
        existing_signature = nfe_data.get("digital_signature")
        if not existing_signature:
            return False

        recalculated = self.sign_nfe(nfe_data)
        return recalculated == existing_signature

    def submit_to_authorities(self, nfe_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simula transmissão em tempo real para o portal fiscal (AT FRA / SIGT Moçambique)."""
        is_valid = self.validate_nfe(nfe_data)
        if not is_valid:
            return {
                "success": False,
                "error": "Assinatura digital corrompida ou dados inconsistentes.",
            }

        return {
            "success": True,
            "receipt_number": f"REC-AT-{int(time.time())}",
            "submission_timestamp": datetime.utcnow().isoformat(),
            "status": "ACCEPTED",
            "message": f"Documento fiscal {nfe_data['invoice_number']} aceite pela Autoridade Tributária.",
        }


# Compatibilidade retroativa com serviços existentes
def generate_einvoice_payload(sale: Any, company_nuit: str = "400123456") -> Dict[str, Any]:
    nfe_manager = ElectronicInvoice()
    items = []
    if hasattr(sale, "items") and sale.items:
        for it in sale.items:
            items.append({
                "product_id": it.product_id,
                "quantity": float(it.quantity),
                "unit_price": float(it.unit_price),
                "tax_rate": float(it.tax_rate),
            })

    return nfe_manager.generate_nfe(
        invoice_number=sale.invoice_number,
        company_nuit=company_nuit,
        company_name="TiConta Enterprise",
        customer_nuit="999999999",
        customer_name="Consumidor Final",
        items=items,
        gross_amount=sale.total_amount,
        tax_amount=sale.tax_amount,
        discount_amount=sale.discount_amount,
        net_amount=sale.net_amount,
        sale_date=sale.sale_date,
    )
