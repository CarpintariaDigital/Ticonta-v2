from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.tenant import get_tenant_id
from app.models.xitique import XitiqueMember
from app.services.xitique import XitiqueService

router = APIRouter(tags=["Xitique - Poupança Rotativa"])


class MemberInput(BaseModel):
    name: str = Field(..., min_length=2)
    phone: Optional[str] = Field(default="")
    receive_order: Optional[int] = Field(default=None)


class CreateGroupRequest(BaseModel):
    name: str = Field(..., min_length=2)
    type: str = Field(default="MONETARY")
    product_description: Optional[str] = None
    contribution_value: float = Field(..., gt=0)
    currency: str = Field(default="MZN")
    period: str = Field(default="MONTHLY")
    total_members: Optional[int] = Field(default=1)
    order_type: str = Field(default="FIXED")
    start_date: Optional[str] = None
    members: Optional[List[MemberInput]] = None


class PayContributionRequest(BaseModel):
    payment_method: str = Field(default="CASH")


class DeliverRoundRequest(BaseModel):
    notes: Optional[str] = None


class UpdateMemberRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    receive_order: Optional[int] = None
    status: Optional[str] = None


@router.get("/groups", summary="Listar grupos de Xitique")
def list_groups(
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    groups = svc.list_groups(company_id=tenant_id)
    return [
        {
            "id": g.id,
            "name": g.name,
            "type": g.type.value,
            "product_description": g.product_description,
            "contribution_value": float(g.contribution_value),
            "currency": g.currency,
            "period": g.period.value,
            "total_members": g.total_members,
            "current_round": g.current_round,
            "total_rounds": g.total_rounds,
            "order_type": g.order_type.value,
            "status": g.status.value,
            "start_date": g.start_date.isoformat() if g.start_date else None,
            "end_date": g.end_date.isoformat() if g.end_date else None,
            "total_pot": float(g.contribution_value * g.total_members),
        }
        for g in groups
    ]


@router.post("/groups", status_code=status.HTTP_201_CREATED, summary="Criar novo grupo de Xitique")
def create_group(
    req: CreateGroupRequest,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    data = req.model_dump()
    group = svc.create_group(data=data, company_id=tenant_id)
    return {
        "id": group.id,
        "name": group.name,
        "type": group.type.value,
        "contribution_value": float(group.contribution_value),
        "total_members": group.total_members,
        "current_round": group.current_round,
        "status": group.status.value,
    }


@router.get("/groups/{id}", summary="Obter resumo e detalhes completos de um grupo")
def get_group_summary(
    id: int,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    return svc.get_group_summary(group_id=id, company_id=tenant_id)


@router.post("/groups/{id}/members", status_code=status.HTTP_201_CREATED, summary="Adicionar membro a um grupo")
def add_member(
    id: int,
    req: MemberInput,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    mem = svc.add_member(group_id=id, member_data=req.model_dump(), company_id=tenant_id)
    return {
        "id": mem.id,
        "name": mem.name,
        "phone": mem.phone,
        "receive_order": mem.receive_order,
        "status": mem.status.value,
    }


@router.patch("/groups/{id}/members/{mid}", summary="Editar membro de um grupo")
def update_member(
    id: int,
    mid: int,
    req: UpdateMemberRequest,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    group = svc.get_group(id, tenant_id)
    member = db.query(XitiqueMember).filter(XitiqueMember.id == mid, XitiqueMember.group_id == group.id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membro não encontrado.")

    if req.name is not None:
        member.name = req.name
    if req.phone is not None:
        member.phone = req.phone
    if req.receive_order is not None:
        member.receive_order = req.receive_order

    db.commit()
    db.refresh(member)
    return {
        "id": member.id,
        "name": member.name,
        "phone": member.phone,
        "receive_order": member.receive_order,
        "status": member.status.value,
    }


@router.post("/contributions/{id}/pay", summary="Registar pagamento de contribuição de Xitique")
def pay_contribution(
    id: int,
    req: PayContributionRequest,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    contrib = svc.pay_contribution_by_id(
        contribution_id=id,
        payment_method=req.payment_method,
        company_id=tenant_id,
    )
    return {
        "id": contrib.id,
        "group_id": contrib.group_id,
        "member_id": contrib.member_id,
        "round_number": contrib.round_number,
        "amount": float(contrib.amount),
        "status": contrib.status.value,
        "payment_method": contrib.payment_method.value if contrib.payment_method else None,
        "paid_at": contrib.paid_at.isoformat() if contrib.paid_at else None,
    }


@router.post("/groups/{id}/deliver/{round_number}", summary="Processar entrega do bolo da ronda")
def deliver_round(
    id: int,
    round_number: int,
    req: Optional[DeliverRoundRequest] = None,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    notes = req.notes if req else None
    delivery = svc.process_delivery(group_id=id, round_number=round_number, notes=notes, company_id=tenant_id)
    return {
        "id": delivery.id,
        "group_id": delivery.group_id,
        "member_id": delivery.member_id,
        "round_number": delivery.round_number,
        "amount_delivered": float(delivery.amount_delivered),
        "status": delivery.status.value,
        "delivered_at": delivery.delivered_at.isoformat() if delivery.delivered_at else None,
    }


@router.get("/groups/{id}/reminders", summary="Gerar lembretes WhatsApp para cobrança de quotas")
def get_reminders(
    id: int,
    tenant_id: int = Depends(get_tenant_id),
    db: Session = Depends(get_db),
):
    svc = XitiqueService(db)
    return svc.generate_reminders(group_id=id, company_id=tenant_id)
