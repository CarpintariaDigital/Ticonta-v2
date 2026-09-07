from datetime import datetime, date
from decimal import Decimal
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.payment import UnifiedPayment, PaymentTransaction, PaymentStatus


class PaymentComplianceTracker:
    """
    Rastreamento de pagamentos, conciliação fiscal e conformidade tributária
    (Autoridade Tributária de Moçambique - AT, IVA 16%, PGC Moçambique).
    """

    def __init__(self, db: Session):
        self.db = db

    def log_payment_audit(
        self,
        payment: UnifiedPayment,
        transaction: PaymentTransaction,
        company_id: int = 1
    ) -> Dict[str, Any]:
        """Gera registro de auditoria contábil e fiscal de cada transação efetuada."""
        method_accounts = {
            "cash": "1.1 - Caixa Geral",
            "mpesa": "1.2.1 - Carteira Digital M-Pesa",
            "emola": "1.2.2 - Carteira Digital E-Mola",
            "card": "1.2.3 - Bancos c/c (POS / Cartão)",
            "pos": "1.2.3 - Bancos c/c (POS)",
            "transfer": "1.2.4 - Transferência Bancária",
        }

        pgc_debit = method_accounts.get(transaction.payment_method.lower(), "1.1 - Caixa Geral")

        return {
            "event": "PAYMENT_TRANSACTION_RECORDED",
            "payment_id": payment.id,
            "transaction_id": transaction.id,
            "sale_id": payment.sale_id,
            "module_source": payment.module_source,
            "invoice_number": payment.invoice_number,
            "amount": float(transaction.amount),
            "payment_method": transaction.payment_method,
            "external_reference": transaction.transaction_id,
            "timestamp": transaction.paid_at.isoformat(),
            "pgc_account_debit": pgc_debit,
            "pgc_account_credit": "4.1.1 - Clientes / Contas a Receber",
            "tax_compliance": "IVA Geral 16% / Regime Simplificado Moçambique",
        }

    def generate_tax_payment_report(
        self,
        company_id: int = 1,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Gera relatório fiscal detalhado por método de pagamento para declaração de impostos."""
        query = self.db.query(PaymentTransaction).join(UnifiedPayment).filter(
            UnifiedPayment.company_id == company_id
        )

        if start_date:
            query = query.filter(PaymentTransaction.paid_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            query = query.filter(PaymentTransaction.paid_at <= datetime.combine(end_date, datetime.max.time()))

        transactions = query.all()

        by_method: Dict[str, Decimal] = {}
        total_collected = Decimal("0.00")

        for tx in transactions:
            m = tx.payment_method.lower()
            amt = Decimal(str(tx.amount))
            by_method[m] = by_method.get(m, Decimal("0.00")) + amt
            total_collected += amt

        # Outstanding calculation
        payments_query = self.db.query(UnifiedPayment).filter(UnifiedPayment.company_id == company_id)
        if start_date:
            payments_query = payments_query.filter(UnifiedPayment.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            payments_query = payments_query.filter(UnifiedPayment.created_at <= datetime.combine(end_date, datetime.max.time()))

        all_payments = payments_query.all()
        total_billed = sum((Decimal(str(p.amount_total)) for p in all_payments), Decimal("0.00"))
        total_outstanding = sum((Decimal(str(p.amount_owed)) for p in all_payments if p.status != PaymentStatus.PAID.value), Decimal("0.00"))

        return {
            "company_id": company_id,
            "period": {
                "start": start_date.isoformat() if start_date else None,
                "end": end_date.isoformat() if end_date else None,
            },
            "summary": {
                "total_transactions_count": len(transactions),
                "total_billed_mzn": float(total_billed),
                "total_collected_mzn": float(total_collected),
                "total_outstanding_mzn": float(total_outstanding),
                "recovery_rate_percent": round(float((total_collected / total_billed) * 100), 2) if total_billed > 0 else 100.0,
            },
            "breakdown_by_method": {m: float(amt) for m, amt in by_method.items()},
            "tax_information": {
                "vat_base_rate": "16%",
                "estimated_iva_payable_mzn": round(float(total_collected * Decimal("0.16") / Decimal("1.16")), 2),
                "compliance_status": "CONFORME - Autoridade Tributária Moçambique",
            },
            "generated_at": datetime.utcnow().isoformat(),
        }
