from datetime import datetime, date
from decimal import Decimal
import random
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.xitique import (
    XitiqueGroup,
    XitiqueMember,
    XitiqueContribution,
    XitiqueDelivery,
    XitiqueType,
    XitiquePeriod,
    XitiqueOrderType,
    XitiqueStatus,
    MemberStatus,
    ContributionStatus,
    PaymentMethod,
    DeliveryStatus,
)


class XitiqueService:
    def __init__(self, db: Session):
        self.db = db

    def list_groups(self, company_id: int) -> List[XitiqueGroup]:
        return (
            self.db.query(XitiqueGroup)
            .filter(XitiqueGroup.company_id == company_id)
            .order_by(XitiqueGroup.created_at.desc())
            .all()
        )

    def get_group(self, group_id: int, company_id: int) -> XitiqueGroup:
        group = (
            self.db.query(XitiqueGroup)
            .filter(XitiqueGroup.id == group_id, XitiqueGroup.company_id == company_id)
            .first()
        )
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Grupo de Xitique ID {group_id} não encontrado.",
            )
        return group

    def create_group(self, data: Dict[str, Any], company_id: int) -> XitiqueGroup:
        total_members = int(data.get("total_members", 1))
        initial_members = data.get("members", [])
        if initial_members and len(initial_members) > 0:
            total_members = max(total_members, len(initial_members))

        order_type = XitiqueOrderType(data.get("order_type", "FIXED"))
        group_type = XitiqueType(data.get("type", "MONETARY"))
        period = XitiquePeriod(data.get("period", "MONTHLY"))

        group = XitiqueGroup(
            company_id=company_id,
            name=data["name"],
            type=group_type,
            product_description=data.get("product_description"),
            contribution_value=Decimal(str(data["contribution_value"])),
            currency=data.get("currency", "MZN"),
            period=period,
            total_members=total_members,
            current_round=1,
            total_rounds=total_members,
            order_type=order_type,
            status=XitiqueStatus.ACTIVE,
            start_date=data.get("start_date", date.today()),
            end_date=data.get("end_date"),
            admin_user_id=data.get("admin_user_id"),
        )
        self.db.add(group)
        self.db.flush()

        # Adicionar membros iniciais se fornecidos
        member_objs = []
        if initial_members:
            indices = list(range(1, len(initial_members) + 1))
            if order_type == XitiqueOrderType.LOTTERY:
                random.shuffle(indices)

            for i, m in enumerate(initial_members):
                order_num = indices[i] if order_type == XitiqueOrderType.LOTTERY else (m.get("receive_order") or (i + 1))
                mem = XitiqueMember(
                    group_id=group.id,
                    name=m["name"],
                    phone=m.get("phone", ""),
                    receive_order=order_num,
                    status=MemberStatus.ACTIVE,
                    total_paid=Decimal("0.00"),
                    total_received=Decimal("0.00"),
                )
                self.db.add(mem)
                member_objs.append(mem)
            self.db.flush()

            # Gerar contribuições para todas as rondas
            for round_n in range(1, total_members + 1):
                for mem in member_objs:
                    contrib = XitiqueContribution(
                        group_id=group.id,
                        member_id=mem.id,
                        round_number=round_n,
                        amount=group.contribution_value,
                        status=ContributionStatus.PENDING,
                    )
                    self.db.add(contrib)

        self.db.commit()
        self.db.refresh(group)
        return group

    def add_member(self, group_id: int, member_data: Dict[str, Any], company_id: int) -> XitiqueMember:
        group = self.get_group(group_id, company_id)
        current_members_count = self.db.query(XitiqueMember).filter(XitiqueMember.group_id == group.id).count()

        receive_order = member_data.get("receive_order") or (current_members_count + 1)
        member = XitiqueMember(
            group_id=group.id,
            name=member_data["name"],
            phone=member_data.get("phone", ""),
            receive_order=receive_order,
            status=MemberStatus.ACTIVE,
            total_paid=Decimal("0.00"),
            total_received=Decimal("0.00"),
        )
        self.db.add(member)
        self.db.flush()

        # Criar contribuições pendentes para este novo membro para todas as rondas do grupo
        for round_n in range(1, group.total_rounds + 1):
            existing_contrib = (
                self.db.query(XitiqueContribution)
                .filter(
                    XitiqueContribution.group_id == group.id,
                    XitiqueContribution.member_id == member.id,
                    XitiqueContribution.round_number == round_n,
                )
                .first()
            )
            if not existing_contrib:
                contrib = XitiqueContribution(
                    group_id=group.id,
                    member_id=member.id,
                    round_number=round_n,
                    amount=group.contribution_value,
                    status=ContributionStatus.PENDING,
                )
                self.db.add(contrib)

        # Atualizar contagem total do grupo
        new_count = current_members_count + 1
        if new_count > group.total_members:
            group.total_members = new_count
            group.total_rounds = new_count

        self.db.commit()
        self.db.refresh(member)
        return member

    def register_contribution(
        self,
        group_id: int,
        member_id: int,
        round_number: int,
        payment_method: str = "CASH",
        company_id: int = 1,
    ) -> XitiqueContribution:
        group = self.get_group(group_id, company_id)
        contrib = (
            self.db.query(XitiqueContribution)
            .filter(
                XitiqueContribution.group_id == group.id,
                XitiqueContribution.member_id == member_id,
                XitiqueContribution.round_number == round_number,
            )
            .first()
        )
        if not contrib:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Contribuição para ronda {round_number} não encontrada.",
            )

        method_enum = PaymentMethod(payment_method.upper()) if payment_method else PaymentMethod.CASH
        contrib.status = ContributionStatus.PAID
        contrib.paid_at = datetime.utcnow()
        contrib.payment_method = method_enum

        # Atualizar total pago do membro
        member = self.db.query(XitiqueMember).filter(XitiqueMember.id == member_id).first()
        if member:
            member.total_paid = (member.total_paid or Decimal("0.00")) + contrib.amount

        self.db.commit()
        self.db.refresh(contrib)
        return contrib

    def pay_contribution_by_id(self, contribution_id: int, payment_method: str = "CASH", company_id: int = 1) -> XitiqueContribution:
        contrib = self.db.query(XitiqueContribution).filter(XitiqueContribution.id == contribution_id).first()
        if not contrib:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contribuição não encontrada.")
        return self.register_contribution(
            group_id=contrib.group_id,
            member_id=contrib.member_id,
            round_number=contrib.round_number,
            payment_method=payment_method,
            company_id=company_id,
        )

    def process_delivery(self, group_id: int, round_number: int, notes: Optional[str] = None, company_id: int = 1) -> XitiqueDelivery:
        group = self.get_group(group_id, company_id)

        # Encontrar beneficiário desta ronda
        beneficiary = (
            self.db.query(XitiqueMember)
            .filter(XitiqueMember.group_id == group.id, XitiqueMember.receive_order == round_number)
            .first()
        )
        if not beneficiary:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Nenhum membro configurado para receber na ronda {round_number}.",
            )

        # Verificar se todos os membros pagaram a ronda atual
        pending_contributions = (
            self.db.query(XitiqueContribution)
            .filter(
                XitiqueContribution.group_id == group.id,
                XitiqueContribution.round_number == round_number,
                XitiqueContribution.status != ContributionStatus.PAID,
            )
            .count()
        )

        total_pot = group.contribution_value * Decimal(str(group.total_members))

        delivery = XitiqueDelivery(
            group_id=group.id,
            member_id=beneficiary.id,
            round_number=round_number,
            amount_delivered=total_pot,
            delivered_at=datetime.utcnow(),
            status=DeliveryStatus.DELIVERED,
            notes=notes or f"Bolo da ronda {round_number} entregue a {beneficiary.name}",
        )
        self.db.add(delivery)

        beneficiary.total_received = (beneficiary.total_received or Decimal("0.00")) + total_pot

        # Avançar ronda do grupo se aplicável
        if group.current_round == round_number:
            if group.current_round >= group.total_rounds:
                group.status = XitiqueStatus.COMPLETED
                group.end_date = date.today()
            else:
                group.current_round += 1

        self.db.commit()
        self.db.refresh(delivery)
        return delivery

    def get_group_summary(self, group_id: int, company_id: int) -> Dict[str, Any]:
        group = self.get_group(group_id, company_id)
        members = (
            self.db.query(XitiqueMember)
            .filter(XitiqueMember.group_id == group.id)
            .order_by(XitiqueMember.receive_order.asc())
            .all()
        )

        current_round_contributions = (
            self.db.query(XitiqueContribution)
            .filter(
                XitiqueContribution.group_id == group.id,
                XitiqueContribution.round_number == group.current_round,
            )
            .all()
        )

        deliveries = (
            self.db.query(XitiqueDelivery)
            .filter(XitiqueDelivery.group_id == group.id)
            .order_by(XitiqueDelivery.round_number.asc())
            .all()
        )

        next_beneficiary = next((m for m in members if m.receive_order == group.current_round), None)

        paid_count = sum(1 for c in current_round_contributions if c.status == ContributionStatus.PAID)
        total_pot = group.contribution_value * Decimal(str(group.total_members))
        collected_pot = group.contribution_value * Decimal(str(paid_count))

        return {
            "group": {
                "id": group.id,
                "name": group.name,
                "type": group.type.value,
                "product_description": group.product_description,
                "contribution_value": float(group.contribution_value),
                "currency": group.currency,
                "period": group.period.value,
                "total_members": group.total_members,
                "current_round": group.current_round,
                "total_rounds": group.total_rounds,
                "order_type": group.order_type.value,
                "status": group.status.value,
                "start_date": group.start_date.isoformat() if group.start_date else None,
                "end_date": group.end_date.isoformat() if group.end_date else None,
                "total_pot": float(total_pot),
                "collected_pot": float(collected_pot),
                "round_progress_pct": round((paid_count / max(1, len(members))) * 100, 1),
            },
            "next_beneficiary": {
                "id": next_beneficiary.id,
                "name": next_beneficiary.name,
                "phone": next_beneficiary.phone,
                "receive_order": next_beneficiary.receive_order,
            } if next_beneficiary else None,
            "members": [
                {
                    "id": m.id,
                    "name": m.name,
                    "phone": m.phone,
                    "receive_order": m.receive_order,
                    "status": m.status.value,
                    "total_paid": float(m.total_paid),
                    "total_received": float(m.total_received),
                }
                for m in members
            ],
            "current_contributions": [
                {
                    "id": c.id,
                    "member_id": c.member_id,
                    "member_name": next((m.name for m in members if m.id == c.member_id), ""),
                    "member_phone": next((m.phone for m in members if m.id == c.member_id), ""),
                    "round_number": c.round_number,
                    "amount": float(c.amount),
                    "paid_at": c.paid_at.isoformat() if c.paid_at else None,
                    "status": c.status.value,
                    "payment_method": c.payment_method.value if c.payment_method else None,
                }
                for c in current_round_contributions
            ],
            "deliveries": [
                {
                    "id": d.id,
                    "member_id": d.member_id,
                    "beneficiary_name": next((m.name for m in members if m.id == d.member_id), ""),
                    "round_number": d.round_number,
                    "amount_delivered": float(d.amount_delivered),
                    "delivered_at": d.delivered_at.isoformat() if d.delivered_at else None,
                    "status": d.status.value,
                    "notes": d.notes,
                }
                for d in deliveries
            ],
        }

    def generate_reminders(self, group_id: int, company_id: int) -> List[Dict[str, Any]]:
        summary = self.get_group_summary(group_id, company_id)
        group = summary["group"]
        contributions = summary["current_contributions"]
        next_ben = summary["next_beneficiary"]

        reminders = []
        for c in contributions:
            if c["status"] != "PAID":
                phone_clean = c["member_phone"].replace(" ", "").replace("-", "")
                ben_name = next_ben["name"] if next_ben else "o beneficiário da ronda"
                msg = (
                    f"Olá {c['member_name']}! 👋 Lembrete do Xitique *{group['name']}* (Ronda {group['current_round']}/{group['total_rounds']}).\n\n"
                    f"O valor da tua quota é de *{c['amount']:,.2f} MZN* para a entrega a *{ben_name}*.\n"
                    f"Por favor, efetua a tua contribuição (M-Pesa / Numerário) para garantir a rotação do grupo. Obrigado!"
                )
                reminders.append({
                    "member_id": c["member_id"],
                    "member_name": c["member_name"],
                    "member_phone": c["member_phone"],
                    "amount": c["amount"],
                    "message": msg,
                    "whatsapp_url": f"https://wa.me/{phone_clean.replace('+', '')}?text={msg}",
                })

        return reminders
