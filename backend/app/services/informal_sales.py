import logging
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc, and_, or_

from app.models.informal_customer import InformalCustomer
from app.models.debit import Debit, PartialPayment, DebitStatus
from app.models.sale import Sale, SaleItem, Payment
from app.models.entities import Product, Company
from app.notifications.debit_reminders import debit_reminder_service
from app.compliance.informal_debit import InformalDebitCompliance
from app.schemas.informal_sales import (
    QuickCustomerCreate,
    InformalCustomerUpdate,
    SaleWithDebitCreate,
    SaleWithDebitResponse,
    CustomerDebitSummary,
    DebitResponse,
    PartialPaymentCreate,
    PartialPaymentResult,
    PartialPaymentItem,
    SendReminderRequest,
    SendReminderResponse,
    CreditRiskCustomer,
    CreditRiskReportResponse,
    CashFlowForecastItem,
    CashFlowForecastResponse,
    RevenueBreakdownResponse,
)

logger = logging.getLogger(__name__)


class InformalSalesService:
    def __init__(self, db: Session):
        self.db = db
        self.compliance = InformalDebitCompliance(db)

    # =========================================================================
    # Customers Management
    # =========================================================================
    def create_customer_from_phone(
        self,
        name: str,
        phone_number: Optional[str] = None,
        phone: Optional[str] = None,
        location: Optional[str] = None,
        trusted_credit_limit: Decimal = Decimal("5000.00"),
        notes: Optional[str] = None,
        company_id: int = 1
    ) -> InformalCustomer:
        """Cria ou retorna cliente informal de forma rápida pelo telefone/nome."""
        raw_phone = phone_number or phone
        if raw_phone and raw_phone.strip():
            clean_phone = raw_phone.strip()
            existing = self.db.query(InformalCustomer).filter(
                InformalCustomer.company_id == company_id,
                InformalCustomer.phone == clean_phone,
                InformalCustomer.active == True
            ).first()
            if existing:
                return existing

        customer = InformalCustomer(
            company_id=company_id,
            name=name.strip(),
            phone=raw_phone.strip() if raw_phone else None,
            location=location.strip() if location else None,
            trusted_credit_limit=trusted_credit_limit,
            total_purchases=Decimal("0.00"),
            total_owed=Decimal("0.00"),
            payment_reliability=Decimal("5.00"),
            notes=notes,
            verified=False,
            active=True
        )
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def list_customers(
        self,
        company_id: int = 1,
        search: Optional[str] = None,
        only_with_debt: bool = False
    ) -> List[InformalCustomer]:
        query = self.db.query(InformalCustomer).filter(
            InformalCustomer.company_id == company_id,
            InformalCustomer.active == True
        )
        if search:
            query = query.filter(
                or_(
                    InformalCustomer.name.ilike(f"%{search}%"),
                    InformalCustomer.phone.ilike(f"%{search}%"),
                    InformalCustomer.location.ilike(f"%{search}%"),
                )
            )
        if only_with_debt:
            query = query.filter(InformalCustomer.total_owed > 0)

        return query.order_by(InformalCustomer.name.asc()).all()

    def get_customer(self, customer_id: int, company_id: int = 1) -> InformalCustomer:
        customer = self.db.query(InformalCustomer).filter(
            InformalCustomer.id == customer_id,
            InformalCustomer.company_id == company_id,
            InformalCustomer.active == True
        ).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cliente informal com ID {customer_id} não encontrado."
            )
        return customer

    def update_customer(
        self,
        customer_id: int,
        data: InformalCustomerUpdate,
        company_id: int = 1
    ) -> InformalCustomer:
        customer = self.get_customer(customer_id, company_id)
        if data.name is not None:
            customer.name = data.name.strip()
        if data.phone is not None:
            customer.phone = data.phone.strip()
        if data.location is not None:
            customer.location = data.location.strip()
        if data.profile_picture is not None:
            customer.profile_picture = data.profile_picture
        if data.trusted_credit_limit is not None:
            customer.trusted_credit_limit = data.trusted_credit_limit
        if data.payment_reliability is not None:
            customer.payment_reliability = data.payment_reliability
        if data.notes is not None:
            customer.notes = data.notes
        if data.verified is not None:
            customer.verified = data.verified
        if data.active is not None:
            customer.active = data.active

        self.db.commit()
        self.db.refresh(customer)
        return customer

    # =========================================================================
    # Sales With Debit (Venda com Fiado / Entrada Parcial)
    # =========================================================================
    def create_sale_with_debit(
        self,
        data: SaleWithDebitCreate,
        user_id: int = 1
    ) -> SaleWithDebitResponse:
        company_id = data.company_id or 1
        customer = self.get_customer(data.customer_id, company_id)

        # Calculate Total Amount
        total_amount = Decimal("0.00")
        for item in data.items:
            qty = Decimal(str(item.quantity))
            price = Decimal(str(item.unit_price))
            total_amount += (qty * price).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        if total_amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O valor total dos itens da venda deve ser maior que zero."
            )

        amount_paid_now = Decimal(str(data.amount_paid_now or 0.00)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        amount_owed = max(Decimal("0.00"), total_amount - amount_paid_now)

        now = datetime.utcnow()
        invoice_num = f"INF-{int(now.timestamp())}"

        # 1. Create Sale Record
        sale = Sale(
            company_id=company_id,
            user_id=user_id,
            invoice_number=invoice_num,
            total_amount=total_amount,
            tax_amount=(total_amount * Decimal("0.16")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP),
            discount_amount=Decimal("0.00"),
            net_amount=total_amount,
            payment_method=data.payment_method,
            payment_status="completed" if amount_owed == Decimal("0.00") else "partially_paid",
            sale_date=now
        )
        self.db.add(sale)
        self.db.flush()

        debit_id = None
        debit_status_str = "paid"

        # 2. If there is a debit balance (fiado)
        if amount_owed > Decimal("0.00"):
            debit = Debit(
                company_id=company_id,
                customer_id=customer.id,
                sale_id=sale.id,
                total_amount=total_amount,
                initial_paid=amount_paid_now,
                amount_owed=amount_owed,
                amount_paid=Decimal("0.00"),
                due_date=data.due_date,
                status=DebitStatus.ACTIVE.value,
                notes=data.notes,
                created_at=now
            )
            self.db.add(debit)
            self.db.flush()
            debit_id = debit.id
            debit_status_str = DebitStatus.ACTIVE.value

            # Update customer balance
            customer.total_owed += amount_owed

            # Log fiscal compliance
            self.compliance.log_debit_creation_audit(debit, company_id=company_id, user_id=user_id)
        else:
            # Fully paid immediately
            customer.verified = True

        # Update customer stats
        customer.total_purchases += total_amount
        customer.last_purchase_date = now
        customer.last_purchase_amount = total_amount

        # Recalculate credit reliability score
        self.calculate_credit_score(customer.id, company_id=company_id)

        self.db.commit()
        self.db.refresh(customer)

        msg = (
            f"Venda de {total_amount:.2f} MZN registada com sucesso. Saldo a dever: {amount_owed:.2f} MZN."
            if amount_owed > 0
            else f"Venda de {total_amount:.2f} MZN quitada na totalidade."
        )

        return SaleWithDebitResponse(
            sale_id=sale.id,
            invoice_number=invoice_num,
            debit_id=debit_id,
            customer_id=customer.id,
            customer_name=customer.name,
            customer_phone=customer.phone,
            total_amount=total_amount,
            amount_paid_now=amount_paid_now,
            amount_owed=amount_owed,
            due_date=data.due_date,
            status=debit_status_str,
            payment_reliability_score=customer.payment_reliability,
            message=msg
        )

    # =========================================================================
    # Debits & Partial Payments (Amortização de Fiado)
    # =========================================================================
    def get_customer_debits_summary(self, customer_id: int, company_id: int = 1) -> CustomerDebitSummary:
        customer = self.get_customer(customer_id, company_id)
        
        # Check overdue dates
        self._sync_overdue_statuses(company_id)

        debits = self.db.query(Debit).options(
            joinedload(Debit.partial_payments)
        ).filter(
            Debit.customer_id == customer.id,
            Debit.company_id == company_id,
            Debit.status.in_([DebitStatus.ACTIVE.value, DebitStatus.PARTIALLY_PAID.value, DebitStatus.OVERDUE.value])
        ).order_by(Debit.created_at.desc()).all()

        now = datetime.utcnow()
        debit_responses: List[DebitResponse] = []

        for d in debits:
            is_overdue = False
            days_overdue = 0
            if d.due_date:
                due_naive = d.due_date.replace(tzinfo=None) if d.due_date.tzinfo else d.due_date
                if due_naive < now and d.amount_owed > 0:
                    is_overdue = True
                    days_overdue = max(0, (now - due_naive).days)

            debit_responses.append(
                DebitResponse(
                    id=d.id,
                    company_id=d.company_id,
                    customer_id=d.customer_id,
                    customer_name=customer.name,
                    customer_phone=customer.phone,
                    customer_location=customer.location,
                    sale_id=d.sale_id,
                    total_amount=d.total_amount,
                    initial_paid=d.initial_paid,
                    amount_owed=d.amount_owed,
                    amount_paid=d.amount_paid,
                    due_date=d.due_date,
                    status=d.status,
                    notes=d.notes,
                    reminder_count=d.reminder_count,
                    last_reminder_sent_at=d.last_reminder_sent_at,
                    is_overdue=is_overdue,
                    days_overdue=days_overdue,
                    created_at=d.created_at,
                    updated_at=d.updated_at,
                    partial_payments=[
                        PartialPaymentItem(
                            id=p.id,
                            debit_id=p.debit_id,
                            amount=p.amount,
                            payment_method=p.payment_method,
                            paid_at=p.paid_at,
                            notes=p.notes,
                            created_at=p.created_at
                        ) for p in d.partial_payments
                    ]
                )
            )

        return CustomerDebitSummary(
            customer_id=customer.id,
            customer_name=customer.name,
            phone=customer.phone,
            location=customer.location,
            total_purchases=customer.total_purchases,
            total_owed=customer.total_owed,
            trusted_credit_limit=customer.trusted_credit_limit,
            payment_reliability=customer.payment_reliability,
            active_debits_count=len(debit_responses),
            active_debits=debit_responses
        )

    def record_partial_payment(
        self,
        debit_id: int,
        data: PartialPaymentCreate,
        company_id: int = 1
    ) -> PartialPaymentResult:
        """Amortiza valor de uma dívida e atualiza saldo do cliente e score de confiança."""
        debit = self.db.query(Debit).options(
            joinedload(Debit.customer)
        ).filter(
            Debit.id == debit_id,
            Debit.company_id == company_id
        ).first()

        if not debit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dívida/Débito com ID {debit_id} não encontrado."
            )

        if debit.status == DebitStatus.PAID.value or debit.amount_owed <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esta dívida já se encontra totalmente liquidada."
            )

        pay_amount = Decimal(str(data.amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        if pay_amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O valor do pagamento deve ser maior que zero."
            )

        actual_pay = min(pay_amount, debit.amount_owed)
        now = datetime.utcnow()

        # 1. Create Partial Payment Record
        partial_payment = PartialPayment(
            debit_id=debit.id,
            amount=actual_pay,
            payment_method=data.payment_method,
            notes=data.notes,
            paid_at=now,
            created_at=now
        )
        self.db.add(partial_payment)
        self.db.flush()

        # 2. Update Debit Status
        debit.amount_paid += actual_pay
        debit.amount_owed = max(Decimal("0.00"), debit.amount_owed - actual_pay)

        if debit.amount_owed == Decimal("0.00"):
            debit.status = DebitStatus.PAID.value
        else:
            debit.status = DebitStatus.PARTIALLY_PAID.value

        # 3. Update Customer Balance
        customer = debit.customer
        customer.total_owed = max(Decimal("0.00"), customer.total_owed - actual_pay)
        if debit.status == DebitStatus.PAID.value:
            customer.verified = True

        # 4. Compliance Logging
        self.compliance.log_partial_payment_audit(
            payment=partial_payment,
            remaining_balance=debit.amount_owed,
            company_id=company_id
        )

        # 5. Recalculate Credit Score
        self.calculate_credit_score(customer.id, company_id=company_id)

        # 6. Send WhatsApp/SMS Confirmation if requested
        notification_sent = False
        notification_msg = None

        if data.send_notification and customer.phone:
            reminder_type = "fully_paid" if debit.status == DebitStatus.PAID.value else "partial_payment_received"
            res = debit_reminder_service.send_debit_reminder(
                debit=debit,
                reminder_type=reminder_type,
                channel="whatsapp"
            )
            notification_sent = res.get("success", False)
            notification_msg = res.get("message")

        self.db.commit()
        self.db.refresh(debit)
        self.db.refresh(customer)

        msg = (
            f"Pagamento de {actual_pay:.2f} MZN registado com sucesso! Dívida totalmente QUITADA."
            if debit.status == DebitStatus.PAID.value
            else f"Pagamento de {actual_pay:.2f} MZN registado. Saldo restante: {debit.amount_owed:.2f} MZN."
        )

        return PartialPaymentResult(
            payment_id=partial_payment.id,
            debit_id=debit.id,
            amount_paid_now=actual_pay,
            total_amortized=debit.amount_paid,
            remaining_balance=debit.amount_owed,
            debit_status=debit.status,
            notification_sent=notification_sent,
            notification_message=notification_msg,
            message=msg
        )

    # =========================================================================
    # Credit Scoring Engine (1.00 - 5.00)
    # =========================================================================
    def calculate_credit_score(self, customer_id: int, company_id: int = 1) -> Decimal:
        """
        Calcula o score de confiabilidade do cliente de 1.00 a 5.00 baseado em:
        - Volume total de compras
        - Regularidade e histórico de pagamentos
        - Existência de dívidas vencidas (overdue)
        - Confiança verificada
        """
        customer = self.db.query(InformalCustomer).filter(
            InformalCustomer.id == customer_id,
            InformalCustomer.company_id == company_id
        ).first()
        if not customer:
            return Decimal("5.00")

        # Base score
        score = Decimal("3.50")

        # Verification bonus
        if customer.verified:
            score += Decimal("0.50")

        # Purchase volume bonus (up to +1.0)
        purchases = Decimal(str(customer.total_purchases or 0))
        volume_bonus = min(Decimal("1.00"), (purchases / Decimal("10000.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        score += volume_bonus

        # Check overdue debits
        now = datetime.utcnow()
        debits = self.db.query(Debit).filter(
            Debit.customer_id == customer.id,
            Debit.company_id == company_id
        ).all()

        overdue_count = 0
        paid_count = 0

        for d in debits:
            if d.status == DebitStatus.PAID.value:
                paid_count += 1
            elif d.due_date and d.amount_owed > 0:
                due_naive = d.due_date.replace(tzinfo=None) if d.due_date.tzinfo else d.due_date
                if due_naive < now:
                    overdue_count += 1

        # Penalty for overdue
        score -= (Decimal(overdue_count) * Decimal("0.75"))

        # Bonus for successfully paid debits
        score += min(Decimal("0.75"), Decimal(paid_count) * Decimal("0.25"))

        # Clamp between 1.00 and 5.00
        final_score = max(Decimal("1.00"), min(Decimal("5.00"), score)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        customer.payment_reliability = final_score

        # Dynamically adjust credit limit based on score and volume
        if final_score >= Decimal("4.50"):
            customer.trusted_credit_limit = max(customer.trusted_credit_limit, Decimal("10000.00"))
        elif final_score <= Decimal("2.00"):
            customer.trusted_credit_limit = min(customer.trusted_credit_limit, Decimal("1500.00"))

        return final_score

    # =========================================================================
    # Overdue Detection & Automated Reminders
    # =========================================================================
    def _sync_overdue_statuses(self, company_id: int = 1):
        now = datetime.utcnow()
        active_debits = self.db.query(Debit).filter(
            Debit.company_id == company_id,
            Debit.status.in_([DebitStatus.ACTIVE.value, DebitStatus.PARTIALLY_PAID.value]),
            Debit.due_date != None,
            Debit.due_date < now,
            Debit.amount_owed > 0
        ).all()

        for d in active_debits:
            d.status = DebitStatus.OVERDUE.value
        if active_debits:
            self.db.commit()

    def get_overdue_debits(self, company_id: int = 1) -> List[DebitResponse]:
        self._sync_overdue_statuses(company_id)
        now = datetime.utcnow()

        overdue_debits = self.db.query(Debit).options(
            joinedload(Debit.customer),
            joinedload(Debit.partial_payments)
        ).filter(
            Debit.company_id == company_id,
            Debit.amount_owed > 0,
            or_(
                Debit.status == DebitStatus.OVERDUE.value,
                and_(Debit.due_date != None, Debit.due_date < now)
            )
        ).order_by(Debit.due_date.asc()).all()

        results: List[DebitResponse] = []
        for d in overdue_debits:
            due_naive = d.due_date.replace(tzinfo=None) if d.due_date and d.due_date.tzinfo else d.due_date
            days = max(0, (now - due_naive).days) if due_naive else 0

            results.append(
                DebitResponse(
                    id=d.id,
                    company_id=d.company_id,
                    customer_id=d.customer_id,
                    customer_name=d.customer.name if d.customer else "Cliente",
                    customer_phone=d.customer.phone if d.customer else None,
                    customer_location=d.customer.location if d.customer else None,
                    sale_id=d.sale_id,
                    total_amount=d.total_amount,
                    initial_paid=d.initial_paid,
                    amount_owed=d.amount_owed,
                    amount_paid=d.amount_paid,
                    due_date=d.due_date,
                    status=d.status,
                    notes=d.notes,
                    reminder_count=d.reminder_count,
                    last_reminder_sent_at=d.last_reminder_sent_at,
                    is_overdue=True,
                    days_overdue=days,
                    created_at=d.created_at,
                    updated_at=d.updated_at,
                    partial_payments=[
                        PartialPaymentItem(
                            id=p.id,
                            debit_id=p.debit_id,
                            amount=p.amount,
                            payment_method=p.payment_method,
                            paid_at=p.paid_at,
                            notes=p.notes,
                            created_at=p.created_at
                        ) for p in d.partial_payments
                    ]
                )
            )
        return results

    def send_payment_reminder(
        self,
        debit_id: int,
        data: SendReminderRequest,
        company_id: int = 1
    ) -> SendReminderResponse:
        debit = self.db.query(Debit).options(
            joinedload(Debit.customer)
        ).filter(
            Debit.id == debit_id,
            Debit.company_id == company_id
        ).first()

        if not debit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Débito ID {debit_id} não encontrado."
            )

        now = datetime.utcnow()
        reminder_type = "overdue" if debit.status == DebitStatus.OVERDUE.value else "due_today"

        res = debit_reminder_service.send_debit_reminder(
            debit=debit,
            reminder_type=reminder_type,
            channel=data.channel,
            custom_message=data.custom_message
        )

        debit.reminder_count += 1
        debit.last_reminder_sent_at = now
        self.db.commit()

        return SendReminderResponse(
            debit_id=debit.id,
            customer_name=debit.customer.name if debit.customer else "Cliente",
            recipient=res.get("recipient", ""),
            channel=data.channel,
            message=res.get("message", ""),
            status=res.get("status", "sent"),
            sent_at=now
        )

    # =========================================================================
    # Credit Risk & Cash Flow Forecasting Reports
    # =========================================================================
    def get_credit_risk_report(self, company_id: int = 1) -> CreditRiskReportResponse:
        self._sync_overdue_statuses(company_id)

        customers = self.db.query(InformalCustomer).options(
            joinedload(InformalCustomer.debits)
        ).filter(
            InformalCustomer.company_id == company_id,
            InformalCustomer.active == True
        ).all()

        risk_list: List[CreditRiskCustomer] = []
        total_debt_at_risk = Decimal("0.00")
        high_risk_count = 0
        medium_risk_count = 0
        low_risk_count = 0

        for c in customers:
            overdue_debits = [d for d in c.debits if d.status == DebitStatus.OVERDUE.value and d.amount_owed > 0]
            overdue_amt = sum((Decimal(str(d.amount_owed)) for d in overdue_debits), Decimal("0.00"))

            # Risk Classification
            score = Decimal(str(c.payment_reliability))
            if score < Decimal("2.50") or len(overdue_debits) >= 2 or overdue_amt > Decimal("3000.00"):
                risk_level = "high"
                high_risk_count += 1
                total_debt_at_risk += c.total_owed
            elif score < Decimal("4.00") or len(overdue_debits) == 1:
                risk_level = "medium"
                medium_risk_count += 1
            else:
                risk_level = "low"
                low_risk_count += 1

            if c.total_owed > 0:
                risk_list.append(
                    CreditRiskCustomer(
                        customer_id=c.id,
                        name=c.name,
                        phone=c.phone,
                        location=c.location,
                        total_owed=c.total_owed,
                        trusted_credit_limit=c.trusted_credit_limit,
                        payment_reliability=c.payment_reliability,
                        risk_level=risk_level,
                        overdue_debits_count=len(overdue_debits),
                        overdue_amount=overdue_amt
                    )
                )

        # Sort: highest risk & highest debt first
        risk_list.sort(key=lambda x: (x.risk_level != "high", -x.total_owed))

        return CreditRiskReportResponse(
            company_id=company_id,
            total_debt_at_risk=total_debt_at_risk,
            high_risk_customers_count=high_risk_count,
            medium_risk_customers_count=medium_risk_count,
            low_risk_customers_count=low_risk_count,
            customers=risk_list
        )

    def get_cash_flow_forecast(self, company_id: int = 1) -> CashFlowForecastResponse:
        self._sync_overdue_statuses(company_id)
        now = datetime.utcnow()
        today_date = now.date()

        debits = self.db.query(Debit).options(
            joinedload(Debit.customer)
        ).filter(
            Debit.company_id == company_id,
            Debit.status.in_([DebitStatus.ACTIVE.value, DebitStatus.PARTIALLY_PAID.value, DebitStatus.OVERDUE.value]),
            Debit.amount_owed > 0
        ).all()

        total_outstanding = sum((Decimal(str(d.amount_owed)) for d in debits), Decimal("0.00"))
        overdue_amt = Decimal("0.00")
        today_amt = Decimal("0.00")
        this_week_amt = Decimal("0.00")

        # Buckets
        overdue_items = []
        today_items = []
        this_week_items = []
        next_15_days_items = []
        future_items = []

        for d in debits:
            amt = Decimal(str(d.amount_owed))
            cname = d.customer.name if d.customer else "Cliente"

            if not d.due_date:
                future_items.append((amt, cname))
                continue

            due_d = d.due_date.date()
            diff_days = (due_d - today_date).days

            if diff_days < 0:
                overdue_amt += amt
                overdue_items.append((amt, cname))
            elif diff_days == 0:
                today_amt += amt
                today_items.append((amt, cname))
            elif diff_days <= 7:
                this_week_amt += amt
                this_week_items.append((amt, cname))
            elif diff_days <= 15:
                next_15_days_items.append((amt, cname))
            else:
                future_items.append((amt, cname))

        def make_forecast_item(label: str, items_list):
            amt = sum((i[0] for i in items_list), Decimal("0.00"))
            names = list(set([i[1] for i in items_list]))
            return CashFlowForecastItem(
                period_label=label,
                expected_amount=amt,
                debit_count=len(items_list),
                customer_names=names
            )

        timeline = [
            make_forecast_item("Vencidos (Atrasados)", overdue_items),
            make_forecast_item("Vencem Hoje", today_items),
            make_forecast_item("Esta Semana (Próximos 7 dias)", this_week_items),
            make_forecast_item("Próximos 15 Dias", next_15_days_items),
            make_forecast_item("Próximo Mês / A Acordar", future_items),
        ]

        return CashFlowForecastResponse(
            company_id=company_id,
            total_outstanding_debt=total_outstanding,
            overdue_amount=overdue_amt,
            due_today_amount=today_amt,
            due_this_week_amount=this_week_amt,
            forecast_timeline=timeline
        )

    def get_revenue_breakdown(self, company_id: int = 1) -> RevenueBreakdownResponse:
        debits = self.db.query(Debit).filter(Debit.company_id == company_id).all()

        total_conceded = sum((Decimal(str(d.total_amount)) for d in debits), Decimal("0.00"))
        total_initial_paid = sum((Decimal(str(d.initial_paid)) for d in debits), Decimal("0.00"))
        total_amortized = sum((Decimal(str(d.amount_paid)) for d in debits), Decimal("0.00"))

        # Sales with direct cash
        sales = self.db.query(Sale).filter(Sale.company_id == company_id).all()
        total_sales_revenue = sum((Decimal(str(s.total_amount)) for s in sales), Decimal("0.00"))

        direct_cash_revenue = max(Decimal("0.00"), total_sales_revenue - (total_conceded - total_initial_paid))
        total_recovered_debt = total_amortized

        recovery_rate = (
            (total_recovered_debt / (total_conceded - total_initial_paid) * Decimal("100.00")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            if (total_conceded - total_initial_paid) > Decimal("0.00")
            else Decimal("100.00")
        )

        return RevenueBreakdownResponse(
            company_id=company_id,
            immediate_cash_revenue=direct_cash_revenue,
            debit_credit_revenue=total_conceded,
            total_revenue=total_sales_revenue,
            total_recovered_debt=total_recovered_debt,
            debit_recovery_rate_percent=recovery_rate
        )
