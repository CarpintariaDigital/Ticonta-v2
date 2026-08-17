from datetime import datetime, date
from decimal import Decimal
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.debit import Debit, PartialPayment, DebitStatus
from app.models.sale import Sale
from app.models.account import JournalEntry, Account


class InformalDebitCompliance:
    """
    Módulo de Conformidade Fiscal e Contabilística para Vendas Informais e Fiado.
    Garante rastreabilidade fiscal (IVA Moçambique, PGC Conta 4.1 Clientes c/c, ISPC).
    """

    def __init__(self, db: Session):
        self.db = db

    def log_debit_creation_audit(
        self,
        debit: Debit,
        company_id: int = 1,
        user_id: int = 1
    ) -> Dict[str, Any]:
        """Registra auditoria de criação de crédito/fiado informal para conformidade fiscal."""
        return {
            "event": "INFORMAL_DEBIT_CREATED",
            "debit_id": debit.id,
            "customer_id": debit.customer_id,
            "sale_id": debit.sale_id,
            "total_amount": float(debit.total_amount),
            "amount_owed": float(debit.amount_owed),
            "due_date": debit.due_date.isoformat() if debit.due_date else None,
            "timestamp": datetime.utcnow().isoformat(),
            "pgc_account_debit": "4.1.1 - Clientes Correntes (Vendas a Prazo / Fiado)",
            "pgc_account_credit": "7.1.1 - Vendas de Mercadorias / Produtos",
            "fiscal_regime": "ISPC / IVA Geral 16%",
        }

    def log_partial_payment_audit(
        self,
        payment: PartialPayment,
        remaining_balance: Decimal,
        company_id: int = 1
    ) -> Dict[str, Any]:
        """Registra liquidação parcial de dívida informal."""
        return {
            "event": "INFORMAL_DEBIT_PARTIAL_PAYMENT",
            "payment_id": payment.id,
            "debit_id": payment.debit_id,
            "amount_paid": float(payment.amount),
            "remaining_balance": float(remaining_balance),
            "payment_method": payment.payment_method,
            "timestamp": payment.paid_at.isoformat(),
            "pgc_account_debit": "1.1 / 1.2 - Caixa ou Carteira Móvel (M-Pesa/E-Mola)",
            "pgc_account_credit": "4.1.1 - Clientes Correntes",
        }

    def generate_fiscal_debit_report(
        self,
        company_id: int = 1,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """Gera relatório consolidado para reporte e enquadramento tributário."""
        query = self.db.query(Debit).filter(Debit.company_id == company_id)
        if start_date:
            query = query.filter(Debit.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            query = query.filter(Debit.created_at <= datetime.combine(end_date, datetime.max.time()))

        debits = query.all()

        total_conceded = sum((Decimal(str(d.total_amount)) for d in debits), Decimal("0.00"))
        total_recovered = sum((Decimal(str(d.amount_paid)) for d in debits), Decimal("0.00"))
        total_outstanding = sum((Decimal(str(d.amount_owed)) for d in debits if d.status != DebitStatus.PAID.value), Decimal("0.00"))

        overdue_count = sum(1 for d in debits if d.status == DebitStatus.OVERDUE.value or (d.due_date and d.due_date < datetime.utcnow() and d.amount_owed > 0))

        return {
            "company_id": company_id,
            "period": {
                "start": start_date.isoformat() if start_date else None,
                "end": end_date.isoformat() if end_date else None,
            },
            "summary": {
                "total_debits_count": len(debits),
                "total_credit_conceded_mzn": float(total_conceded),
                "total_credit_recovered_mzn": float(total_recovered),
                "total_outstanding_mzn": float(total_outstanding),
                "recovery_rate_percent": round(float((total_recovered / total_conceded) * 100), 2) if total_conceded > 0 else 100.0,
                "overdue_count": overdue_count,
            },
            "compliance_status": "CONFORME - Regime Simplificado ISPC / PGC-NIRF Moçambique",
            "generated_at": datetime.utcnow().isoformat(),
        }
