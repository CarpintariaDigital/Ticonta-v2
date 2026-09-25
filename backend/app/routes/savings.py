from datetime import date
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.tenant import get_tenant_id
from app.services.savings import SavingsService

router = APIRouter()


class CreateGroupSchema(BaseModel):
    name: str
    interest_rate: Decimal = Decimal("10.00")
    cycle_months: int = 12
    start_date: Optional[date] = None


class AddMemberSchema(BaseModel):
    name: str
    phone: str


class DepositSchema(BaseModel):
    group_id: int
    member_id: int
    amount: Decimal
    payment_method: str = "CASH"
    notes: Optional[str] = None


class LoanSchema(BaseModel):
    group_id: int
    member_id: int
    amount: Decimal
    due_date: date
    interest_rate: Optional[Decimal] = None


class RepaySchema(BaseModel):
    amount: Decimal
    payment_method: str = "CASH"


@router.get("/groups")
def list_groups(
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    groups = SavingsService.list_groups(db, company_id=tenant_id)
    return [
        {
            "id": g.id,
            "name": g.name,
            "interest_rate": float(g.interest_rate),
            "cycle_months": g.cycle_months,
            "status": g.status.value,
            "start_date": g.start_date.isoformat(),
            "end_date": g.end_date.isoformat() if g.end_date else None,
            "total_members": len(g.members),
            "created_at": g.created_at.isoformat(),
        }
        for g in groups
    ]


@router.post("/groups", status_code=status.HTTP_201_CREATED)
def create_group(
    payload: CreateGroupSchema,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    try:
        group = SavingsService.create_group(
            db=db,
            company_id=tenant_id,
            name=payload.name,
            interest_rate=payload.interest_rate,
            cycle_months=payload.cycle_months,
            start_date=payload.start_date,
        )
        return {
            "id": group.id,
            "name": group.name,
            "interest_rate": float(group.interest_rate),
            "cycle_months": group.cycle_months,
            "status": group.status.value,
            "start_date": group.start_date.isoformat(),
            "created_at": group.created_at.isoformat(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/groups/{group_id}")
def get_group_detail(
    group_id: int,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    group = SavingsService.get_group(db, group_id=group_id, company_id=tenant_id)
    if not group:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    return {
        "id": group.id,
        "name": group.name,
        "interest_rate": float(group.interest_rate),
        "cycle_months": group.cycle_months,
        "status": group.status.value,
        "start_date": group.start_date.isoformat(),
        "end_date": group.end_date.isoformat() if group.end_date else None,
        "created_at": group.created_at.isoformat(),
        "members": [
            {
                "id": m.id,
                "name": m.name,
                "phone": m.phone,
                "total_deposited": float(m.total_deposited),
                "total_borrowed": float(m.total_borrowed),
                "total_repaid": float(m.total_repaid),
                "status": m.status.value,
                "joined_at": m.joined_at.isoformat(),
            }
            for m in group.members
        ],
    }


@router.get("/groups/{group_id}/report")
def get_group_report(
    group_id: int,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    try:
        return SavingsService.get_group_report(db, group_id=group_id, company_id=tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/groups/{group_id}/members", status_code=status.HTTP_201_CREATED)
def add_member(
    group_id: int,
    payload: AddMemberSchema,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    try:
        member = SavingsService.add_member(
            db=db,
            group_id=group_id,
            company_id=tenant_id,
            name=payload.name,
            phone=payload.phone,
        )
        return {
            "id": member.id,
            "group_id": member.group_id,
            "name": member.name,
            "phone": member.phone,
            "status": member.status.value,
            "total_deposited": float(member.total_deposited),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/deposits", status_code=status.HTTP_201_CREATED)
def register_deposit(
    payload: DepositSchema,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    try:
        deposit = SavingsService.register_deposit(
            db=db,
            group_id=payload.group_id,
            member_id=payload.member_id,
            amount=payload.amount,
            payment_method=payload.payment_method,
            notes=payload.notes,
            company_id=tenant_id,
        )
        return {
            "id": deposit.id,
            "group_id": deposit.group_id,
            "member_id": deposit.member_id,
            "amount": float(deposit.amount),
            "payment_method": deposit.payment_method.value,
            "deposited_at": deposit.deposited_at.isoformat(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/loans", status_code=status.HTTP_201_CREATED)
def create_loan(
    payload: LoanSchema,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    try:
        loan = SavingsService.create_loan(
            db=db,
            group_id=payload.group_id,
            member_id=payload.member_id,
            amount=payload.amount,
            due_date=payload.due_date,
            interest_rate=payload.interest_rate,
            company_id=tenant_id,
        )
        return {
            "id": loan.id,
            "group_id": loan.group_id,
            "member_id": loan.member_id,
            "amount": float(loan.amount),
            "interest_rate": float(loan.interest_rate),
            "monthly_payment": float(loan.monthly_payment),
            "total_repayable": float(loan.total_repayable),
            "due_date": loan.due_date.isoformat(),
            "status": loan.status.value,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/loans/{loan_id}/repay")
def register_repayment(
    loan_id: int,
    payload: RepaySchema,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    try:
        repayment = SavingsService.register_repayment(
            db=db,
            loan_id=loan_id,
            amount=payload.amount,
            payment_method=payload.payment_method,
            company_id=tenant_id,
        )
        return {
            "id": repayment.id,
            "loan_id": repayment.loan_id,
            "amount": float(repayment.amount),
            "principal_portion": float(repayment.principal_portion),
            "interest_portion": float(repayment.interest_portion),
            "repaid_at": repayment.repaid_at.isoformat(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/groups/{group_id}/close")
def close_cycle(
    group_id: int,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    try:
        return SavingsService.close_cycle(db, group_id=group_id, company_id=tenant_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
