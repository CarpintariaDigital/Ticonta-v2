import logging
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, and_, or_

from app.models.payment import UnifiedPayment, PaymentTransaction, PaymentStatus
from app.models.sale import Sale
from app.compliance.payment_tracking import PaymentComplianceTracker
from app.schemas.payment import (
    ProcessPaymentRequest,
    SplitPaymentRequest,
    PaymentStatusResponse,
    PaymentTransactionResponse,
    OutstandingPaymentItem,
    OutstandingPaymentsResponse,
)

logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.compliance = PaymentComplianceTracker(db)

    def _sync_overdue_payments(self, company_id: int = 1):
        now = datetime.utcnow()
        overdues = self.db.query(UnifiedPayment).filter(
            UnifiedPayment.company_id == company_id,
            UnifiedPayment.status.in_([PaymentStatus.PENDING.value, PaymentStatus.PARTIAL.value]),
            UnifiedPayment.due_date != None,
            UnifiedPayment.due_date < now,
            UnifiedPayment.amount_owed > 0
        ).all()

        for p in overdues:
            p.status = PaymentStatus.OVERDUE.value
        if overdues:
            self.db.commit()

    # =========================================================================
    # Process Full or Partial Payment
    # =========================================================================
    def process_payment(
        self,
        sale_id: int,
        data: ProcessPaymentRequest,
        company_id: int = 1
    ) -> PaymentStatusResponse:
        module_source = (data.module_source or "pos").lower()
        now = datetime.utcnow()

        # Find existing unified payment record or create a new one
        payment = self.db.query(UnifiedPayment).options(
            joinedload(UnifiedPayment.transactions)
        ).filter(
            UnifiedPayment.sale_id == sale_id,
            UnifiedPayment.module_source == module_source,
            UnifiedPayment.company_id == company_id
        ).first()

        if not payment:
            # Fallback check if sale_id matches the PK of unified_payments directly
            payment = self.db.query(UnifiedPayment).options(
                joinedload(UnifiedPayment.transactions)
            ).filter(
                UnifiedPayment.id == sale_id,
                UnifiedPayment.company_id == company_id
            ).first()

        if not payment:
            if data.amount_total is None or data.amount_total <= Decimal("0.00"):
                # Try to lookup from Sale table if module is POS
                sale = self.db.query(Sale).filter(Sale.id == sale_id, Sale.company_id == company_id).first()
                if sale:
                    data.amount_total = Decimal(str(sale.total_amount))
                    data.invoice_number = sale.invoice_number
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Para iniciar o pagamento de uma nova venda, informe 'amount_total'."
                    )

            tot_amount = Decimal(str(data.amount_total)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            payment = UnifiedPayment(
                company_id=company_id,
                sale_id=sale_id,
                module_source=module_source,
                invoice_number=data.invoice_number or f"PAY-{int(now.timestamp())}",
                customer_id=data.customer_id,
                customer_name=data.customer_name,
                customer_phone=data.customer_phone,
                amount_total=tot_amount,
                amount_paid=Decimal("0.00"),
                amount_owed=tot_amount,
                payment_method=data.payment_method,
                status=PaymentStatus.PENDING.value,
                due_date=data.due_date,
                notes=data.notes,
                created_at=now
            )
            self.db.add(payment)
            self.db.flush()

        # Check if already fully paid
        if payment.status == PaymentStatus.PAID.value and payment.amount_owed <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este pedido / venda já se encontra totalmente pago."
            )

        pay_amount = Decimal(str(data.amount_paid)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if pay_amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O valor pago deve ser maior que zero."
            )

        # 1. Create Transaction
        transaction = PaymentTransaction(
            payment_id=payment.id,
            amount=pay_amount,
            payment_method=data.payment_method,
            transaction_id=data.transaction_id,
            notes=data.notes,
            paid_at=now,
            created_at=now
        )
        self.db.add(transaction)
        self.db.flush()

        # 2. Update Payment Balances
        payment.amount_paid += pay_amount
        payment.amount_owed = max(Decimal("0.00"), payment.amount_total - payment.amount_paid)

        if payment.amount_owed == Decimal("0.00"):
            payment.status = PaymentStatus.PAID.value
            msg = f"Pagamento de {pay_amount:.2f} MZN registado. Totalmente LIQUIDADO!"
        else:
            payment.status = PaymentStatus.PARTIAL.value
            if data.due_date:
                payment.due_date = data.due_date
            msg = f"Pagamento parcial de {pay_amount:.2f} MZN registado. Saldo restante: {payment.amount_owed:.2f} MZN."

        # 3. Compliance Log
        self.compliance.log_payment_audit(
            payment=payment,
            transaction=transaction,
            company_id=company_id
        )

        self.db.commit()
        self.db.refresh(payment)

        return self._build_status_response(payment, message=msg)

    # =========================================================================
    # Split Payment (Dividir entre múltiplos métodos)
    # =========================================================================
    def split_payment(
        self,
        sale_id: int,
        data: SplitPaymentRequest,
        company_id: int = 1
    ) -> PaymentStatusResponse:
        module_source = (data.module_source or "pos").lower()
        now = datetime.utcnow()

        total_split = sum((Decimal(str(p.amount)) for p in data.payments), Decimal("0.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if total_split <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O total dos métodos de pagamento deve ser maior que zero."
            )

        # Lookup or create
        payment = self.db.query(UnifiedPayment).options(
            joinedload(UnifiedPayment.transactions)
        ).filter(
            UnifiedPayment.sale_id == sale_id,
            UnifiedPayment.module_source == module_source,
            UnifiedPayment.company_id == company_id
        ).first()

        if not payment:
            # Check by PK
            payment = self.db.query(UnifiedPayment).options(
                joinedload(UnifiedPayment.transactions)
            ).filter(
                UnifiedPayment.id == sale_id,
                UnifiedPayment.company_id == company_id
            ).first()

        if not payment:
            tot_amount = Decimal(str(data.amount_total or total_split)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            payment = UnifiedPayment(
                company_id=company_id,
                sale_id=sale_id,
                module_source=module_source,
                invoice_number=data.invoice_number or f"SPLIT-{int(now.timestamp())}",
                customer_id=data.customer_id,
                customer_name=data.customer_name,
                amount_total=tot_amount,
                amount_paid=Decimal("0.00"),
                amount_owed=tot_amount,
                payment_method="split",
                status=PaymentStatus.PENDING.value,
                created_at=now
            )
            self.db.add(payment)
            self.db.flush()

        # Add all split transactions
        for p in data.payments:
            amt = Decimal(str(p.amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            tx = PaymentTransaction(
                payment_id=payment.id,
                amount=amt,
                payment_method=p.payment_method,
                transaction_id=p.transaction_id,
                notes=p.notes,
                paid_at=now,
                created_at=now
            )
            self.db.add(tx)
            self.db.flush()
            self.compliance.log_payment_audit(payment=payment, transaction=tx, company_id=company_id)

        payment.amount_paid += total_split
        payment.amount_owed = max(Decimal("0.00"), payment.amount_total - payment.amount_paid)
        payment.payment_method = "split"

        if payment.amount_owed == Decimal("0.00"):
            payment.status = PaymentStatus.PAID.value
            msg = f"Pagamento dividido de {total_split:.2f} MZN registado. Totalmente QUITADO!"
        else:
            payment.status = PaymentStatus.PARTIAL.value
            msg = f"Pagamento dividido de {total_split:.2f} MZN registado. Saldo restante: {payment.amount_owed:.2f} MZN."

        self.db.commit()
        self.db.refresh(payment)

        return self._build_status_response(payment, message=msg)

    # =========================================================================
    # Status & Outstanding Inquiries
    # =========================================================================
    def get_payment_status(
        self,
        sale_id: int,
        module_source: Optional[str] = None,
        company_id: int = 1
    ) -> PaymentStatusResponse:
        self._sync_overdue_payments(company_id)

        query = self.db.query(UnifiedPayment).options(
            joinedload(UnifiedPayment.transactions)
        ).filter(
            UnifiedPayment.company_id == company_id
        )

        if module_source:
            payment = query.filter(
                UnifiedPayment.sale_id == sale_id,
                UnifiedPayment.module_source == module_source.lower()
            ).first()
        else:
            payment = query.filter(
                or_(
                    UnifiedPayment.sale_id == sale_id,
                    UnifiedPayment.id == sale_id
                )
            ).first()

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Registo de pagamento para a venda / ordem {sale_id} não encontrado."
            )

        return self._build_status_response(payment, message="Status consultado com sucesso.")

    def get_outstanding_payments(
        self,
        company_id: int = 1,
        module_source: Optional[str] = None
    ) -> OutstandingPaymentsResponse:
        self._sync_overdue_payments(company_id)
        now = datetime.utcnow()

        query = self.db.query(UnifiedPayment).filter(
            UnifiedPayment.company_id == company_id,
            UnifiedPayment.amount_owed > 0,
            UnifiedPayment.status.in_([
                PaymentStatus.PENDING.value,
                PaymentStatus.PARTIAL.value,
                PaymentStatus.OVERDUE.value
            ])
        )

        if module_source:
            query = query.filter(UnifiedPayment.module_source == module_source.lower())

        unpaid_payments = query.order_by(UnifiedPayment.created_at.desc()).all()
        total_outstanding = sum((Decimal(str(p.amount_owed)) for p in unpaid_payments), Decimal("0.00"))

        items: List[OutstandingPaymentItem] = []
        for p in unpaid_payments:
            is_overdue = False
            if p.due_date:
                due_naive = p.due_date.replace(tzinfo=None) if p.due_date.tzinfo else p.due_date
                if due_naive < now and p.amount_owed > 0:
                    is_overdue = True

            items.append(
                OutstandingPaymentItem(
                    payment_id=p.id,
                    sale_id=p.sale_id,
                    module_source=p.module_source,
                    invoice_number=p.invoice_number,
                    customer_name=p.customer_name,
                    customer_phone=p.customer_phone,
                    amount_total=p.amount_total,
                    amount_paid=p.amount_paid,
                    amount_owed=p.amount_owed,
                    status=p.status,
                    due_date=p.due_date,
                    is_overdue=is_overdue,
                    created_at=p.created_at
                )
            )

        return OutstandingPaymentsResponse(
            company_id=company_id,
            total_outstanding_amount=total_outstanding,
            total_unpaid_count=len(items),
            items=items
        )

    def _build_status_response(self, payment: UnifiedPayment, message: str) -> PaymentStatusResponse:
        now = datetime.utcnow()
        is_overdue = False
        if payment.due_date:
            due_naive = payment.due_date.replace(tzinfo=None) if payment.due_date.tzinfo else payment.due_date
            if due_naive < now and payment.amount_owed > 0:
                is_overdue = True

        transactions = [
            PaymentTransactionResponse(
                id=t.id,
                payment_id=t.payment_id,
                amount=t.amount,
                payment_method=t.payment_method,
                transaction_id=t.transaction_id,
                notes=t.notes,
                paid_at=t.paid_at,
                created_at=t.created_at
            ) for t in payment.transactions
        ]

        return PaymentStatusResponse(
            payment_id=payment.id,
            sale_id=payment.sale_id,
            module_source=payment.module_source,
            invoice_number=payment.invoice_number,
            customer_name=payment.customer_name,
            customer_phone=payment.customer_phone,
            amount_total=payment.amount_total,
            amount_paid=payment.amount_paid,
            amount_owed=payment.amount_owed,
            status=payment.status,
            due_date=payment.due_date,
            is_overdue=is_overdue,
            created_at=payment.created_at,
            updated_at=payment.updated_at,
            transactions=transactions,
            message=message
        )
