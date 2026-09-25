from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.savings import (
    SavingsGroup,
    SavingsMember,
    SavingsDeposit,
    SavingsLoan,
    SavingsRepayment,
    SavingsGroupStatus,
    SavingsMemberStatus,
    SavingsPaymentMethod,
    SavingsLoanStatus,
)


class SavingsService:
    @staticmethod
    def list_groups(db: Session, company_id: int) -> List[SavingsGroup]:
        return db.query(SavingsGroup).filter(SavingsGroup.company_id == company_id).order_by(SavingsGroup.created_at.desc()).all()

    @staticmethod
    def get_group(db: Session, group_id: int, company_id: int) -> Optional[SavingsGroup]:
        return db.query(SavingsGroup).filter(SavingsGroup.id == group_id, SavingsGroup.company_id == company_id).first()

    @staticmethod
    def create_group(
        db: Session,
        company_id: int,
        name: str,
        interest_rate: Decimal = Decimal("10.00"),
        cycle_months: int = 12,
        start_date: Optional[date] = None,
        admin_user_id: Optional[int] = None,
    ) -> SavingsGroup:
        group = SavingsGroup(
            company_id=company_id,
            name=name,
            interest_rate=Decimal(str(interest_rate)),
            cycle_months=cycle_months,
            start_date=start_date or date.today(),
            admin_user_id=admin_user_id,
            status=SavingsGroupStatus.ACTIVE,
        )
        db.add(group)
        db.commit()
        db.refresh(group)
        return group

    @staticmethod
    def add_member(
        db: Session,
        group_id: int,
        company_id: int,
        name: str,
        phone: str,
    ) -> SavingsMember:
        group = SavingsService.get_group(db, group_id, company_id)
        if not group:
            raise ValueError("Grupo de poupança não encontrado")
        if group.status == SavingsGroupStatus.CLOSED:
            raise ValueError("Não é possível adicionar membros a um grupo encerrado")

        member = SavingsMember(
            group_id=group_id,
            name=name,
            phone=phone,
            status=SavingsMemberStatus.ACTIVE,
        )
        db.add(member)
        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def register_deposit(
        db: Session,
        group_id: int,
        member_id: int,
        amount: Decimal,
        payment_method: str = "CASH",
        notes: Optional[str] = None,
        company_id: int = 0,
    ) -> SavingsDeposit:
        group = SavingsService.get_group(db, group_id, company_id)
        if not group:
            raise ValueError("Grupo de poupança não encontrado")
        if group.status == SavingsGroupStatus.CLOSED:
            raise ValueError("Grupo de poupança encerrado")

        member = db.query(SavingsMember).filter(
            SavingsMember.id == member_id,
            SavingsMember.group_id == group_id
        ).first()
        if not member:
            raise ValueError("Membro não encontrado neste grupo")

        amt = Decimal(str(amount))
        deposit = SavingsDeposit(
            group_id=group_id,
            member_id=member_id,
            amount=amt,
            payment_method=SavingsPaymentMethod(payment_method),
            notes=notes,
            deposited_at=datetime.utcnow(),
        )
        member.total_deposited = Decimal(str(member.total_deposited or 0)) + amt
        db.add(deposit)
        db.commit()
        db.refresh(deposit)
        return deposit

    @staticmethod
    def create_loan(
        db: Session,
        group_id: int,
        member_id: int,
        amount: Decimal,
        due_date: date,
        interest_rate: Optional[Decimal] = None,
        company_id: int = 0,
    ) -> SavingsLoan:
        group = SavingsService.get_group(db, group_id, company_id)
        if not group:
            raise ValueError("Grupo de poupança não encontrado")
        if group.status == SavingsGroupStatus.CLOSED:
            raise ValueError("Grupo de poupança encerrado")

        member = db.query(SavingsMember).filter(
            SavingsMember.id == member_id,
            SavingsMember.group_id == group_id
        ).first()
        if not member:
            raise ValueError("Membro não encontrado neste grupo")

        rate = Decimal(str(interest_rate)) if interest_rate is not None else Decimal(str(group.interest_rate))
        amt = Decimal(str(amount))
        
        # Calculate months difference
        today = date.today()
        months_diff = max(1, (due_date.year - today.year) * 12 + (due_date.month - today.month))
        
        # Total with simple monthly interest: amount * (1 + (rate/100) * months)
        total_interest = amt * (rate / Decimal("100.00")) * Decimal(str(months_diff))
        total_repayable = amt + total_interest
        monthly_payment = total_repayable / Decimal(str(months_diff))

        loan = SavingsLoan(
            group_id=group_id,
            member_id=member_id,
            amount=amt,
            interest_rate=rate,
            monthly_payment=round(monthly_payment, 2),
            total_repayable=round(total_repayable, 2),
            amount_repaid=Decimal("0.00"),
            due_date=due_date,
            status=SavingsLoanStatus.ACTIVE,
            disbursed_at=datetime.utcnow(),
        )
        member.total_borrowed = Decimal(str(member.total_borrowed or 0)) + amt
        db.add(loan)
        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def register_repayment(
        db: Session,
        loan_id: int,
        amount: Decimal,
        payment_method: str = "CASH",
        company_id: int = 0,
    ) -> SavingsRepayment:
        loan = db.query(SavingsLoan).join(SavingsGroup).filter(
            SavingsLoan.id == loan_id,
            SavingsGroup.company_id == company_id
        ).first()
        if not loan:
            raise ValueError("Empréstimo não encontrado")
        if loan.status == SavingsLoanStatus.REPAID:
            raise ValueError("Empréstimo já liquidado")

        amt = Decimal(str(amount))
        # Determine principal vs interest portion based on proportion
        total_repayable = Decimal(str(loan.total_repayable))
        original_principal = Decimal(str(loan.amount))
        interest_total = total_repayable - original_principal
        
        if total_repayable > 0:
            principal_ratio = original_principal / total_repayable
            principal_portion = round(amt * principal_ratio, 2)
            interest_portion = amt - principal_portion
        else:
            principal_portion = amt
            interest_portion = Decimal("0.00")

        repayment = SavingsRepayment(
            loan_id=loan.id,
            amount=amt,
            principal_portion=principal_portion,
            interest_portion=interest_portion,
            payment_method=SavingsPaymentMethod(payment_method),
            repaid_at=datetime.utcnow(),
        )
        
        loan.amount_repaid = Decimal(str(loan.amount_repaid or 0)) + amt
        if loan.amount_repaid >= loan.total_repayable:
            loan.status = SavingsLoanStatus.REPAID

        # Update member total_repaid
        member = db.query(SavingsMember).filter(SavingsMember.id == loan.member_id).first()
        if member:
            member.total_repaid = Decimal(str(member.total_repaid or 0)) + amt

        db.add(repayment)
        db.commit()
        db.refresh(repayment)
        return repayment

    @staticmethod
    def get_group_report(db: Session, group_id: int, company_id: int) -> Dict[str, Any]:
        group = SavingsService.get_group(db, group_id, company_id)
        if not group:
            raise ValueError("Grupo de poupança não encontrado")

        members = db.query(SavingsMember).filter(SavingsMember.group_id == group_id).all()
        loans = db.query(SavingsLoan).filter(SavingsLoan.group_id == group_id).all()
        deposits = db.query(SavingsDeposit).filter(SavingsDeposit.group_id == group_id).all()

        total_deposited = sum(Decimal(str(m.total_deposited or 0)) for m in members)
        total_borrowed = sum(Decimal(str(l.amount or 0)) for l in loans)
        total_repaid = sum(Decimal(str(l.amount_repaid or 0)) for l in loans)
        
        # Calculate interest earned so far from repayments
        loan_ids = [l.id for l in loans]
        repayments = db.query(SavingsRepayment).filter(SavingsRepayment.loan_id.in_(loan_ids)).all() if loan_ids else []
        total_interest_collected = sum(Decimal(str(r.interest_portion or 0)) for r in repayments)
        
        # Outstanding loans
        total_receivable = sum(
            max(Decimal("0.00"), Decimal(str(l.total_repayable)) - Decimal(str(l.amount_repaid or 0)))
            for l in loans if l.status == SavingsLoanStatus.ACTIVE
        )

        # Current available cash in fund = total deposits + total repayments - total borrowed
        fund_balance = total_deposited + total_repaid - total_borrowed
        # Total equity / value of group = total_deposited + total_interest_collected (or + receivable interest)
        total_fund_value = total_deposited + total_interest_collected

        # Member share breakdown
        member_shares = []
        for m in members:
            dep = Decimal(str(m.total_deposited or 0))
            share_pct = (dep / total_deposited * Decimal("100.00")) if total_deposited > 0 else Decimal("0.00")
            share_value = (total_fund_value * (share_pct / Decimal("100.00"))) if total_deposited > 0 else Decimal("0.00")
            member_shares.append({
                "member_id": m.id,
                "name": m.name,
                "phone": m.phone,
                "total_deposited": float(dep),
                "total_borrowed": float(m.total_borrowed or 0),
                "total_repaid": float(m.total_repaid or 0),
                "share_pct": round(float(share_pct), 2),
                "share_value": round(float(share_value), 2),
                "status": m.status.value,
            })

        return {
            "group_id": group.id,
            "name": group.name,
            "status": group.status.value,
            "interest_rate": float(group.interest_rate),
            "cycle_months": group.cycle_months,
            "start_date": group.start_date.isoformat(),
            "end_date": group.end_date.isoformat() if group.end_date else None,
            "total_deposited": float(total_deposited),
            "total_borrowed": float(total_borrowed),
            "total_repaid": float(total_repaid),
            "total_interest_collected": float(total_interest_collected),
            "total_receivable": float(total_receivable),
            "fund_balance": float(fund_balance),
            "total_fund_value": float(total_fund_value),
            "member_shares": member_shares,
            "loans": [
                {
                    "id": l.id,
                    "member_id": l.member_id,
                    "member_name": l.member.name if l.member else "",
                    "amount": float(l.amount),
                    "interest_rate": float(l.interest_rate),
                    "monthly_payment": float(l.monthly_payment),
                    "total_repayable": float(l.total_repayable),
                    "amount_repaid": float(l.amount_repaid),
                    "remaining": float(max(Decimal("0.00"), Decimal(str(l.total_repayable)) - Decimal(str(l.amount_repaid or 0)))),
                    "due_date": l.due_date.isoformat(),
                    "status": l.status.value,
                    "disbursed_at": l.disbursed_at.isoformat(),
                }
                for l in loans
            ],
        }

    @staticmethod
    def close_cycle(db: Session, group_id: int, company_id: int) -> Dict[str, Any]:
        group = SavingsService.get_group(db, group_id, company_id)
        if not group:
            raise ValueError("Grupo de poupança não encontrado")
        if group.status == SavingsGroupStatus.CLOSED:
            raise ValueError("Grupo já se encontra encerrado")

        report = SavingsService.get_group_report(db, group_id, company_id)
        group.status = SavingsGroupStatus.CLOSED
        group.end_date = date.today()
        db.commit()
        return report
