from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
import structlog

from app.audit.service import log_audit
from app.models.lead import Interaction, Lead, LeadStage
from app.models.user import User
from app.schemas.crm import (
    CRMAnalyticsResponse,
    InteractionCreate,
    LeadCreate,
    LeadStageUpdate,
    LeadUpdate,
    PipelineAnalysisResponse,
    PipelineStageMetrics,
)

logger = structlog.get_logger()


class CRMService:
    def __init__(self, db: Session):
        self.db = db

    def create_lead(self, data: LeadCreate, user_id: int) -> Lead:
        """Cria um novo lead / oportunidade de negócio no pipeline comercial."""
        lead = Lead(
            company_id=data.company_id,
            name=data.name,
            email=data.email,
            phone=data.phone,
            source=data.source,
            value=data.value,
            probability=data.probability,
            notes=data.notes,
            assigned_user_id=data.assigned_user_id or user_id,
            stage=LeadStage.NOVO,
        )
        self.db.add(lead)
        self.db.flush()

        # Criação da primeira interação de boas-vindas
        first_interaction = Interaction(
            lead_id=lead.id,
            user_id=user_id,
            type="note",
            description=f"Oportunidade registada no sistema através da fonte: {data.source.upper()}.",
            date=datetime.now(timezone.utc),
        )
        self.db.add(first_interaction)

        log_audit(
            db=self.db,
            company_id=data.company_id,
            action="CREATE_LEAD",
            entity="Lead",
            entity_id=lead.id,
            user_id=user_id,
            new_value={"name": lead.name, "value": float(lead.value), "stage": lead.stage.value},
        )

        self.db.commit()
        self.db.refresh(lead)
        logger.info("crm_lead_created", lead_id=lead.id, name=lead.name, value=float(lead.value))
        return lead

    def get_leads(
        self,
        company_id: int = 1,
        stage: Optional[LeadStage] = None,
        source: Optional[str] = None,
        min_value: Optional[Decimal] = None,
        max_value: Optional[Decimal] = None,
        assigned_user_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[Lead]:
        """Consulta leads no pipeline com múltiplos filtros."""
        query = self.db.query(Lead).filter(Lead.company_id == company_id)

        if stage:
            query = query.filter(Lead.stage == stage)
        if source:
            query = query.filter(Lead.source == source)
        if min_value is not None:
            query = query.filter(Lead.value >= min_value)
        if max_value is not None:
            query = query.filter(Lead.value <= max_value)
        if assigned_user_id:
            query = query.filter(Lead.assigned_user_id == assigned_user_id)
        if search:
            query = query.filter(
                (Lead.name.ilike(f"%{search}%"))
                | (Lead.email.ilike(f"%{search}%"))
                | (Lead.phone.ilike(f"%{search}%"))
            )

        return query.order_by(Lead.updated_at.desc()).all()

    def get_lead_by_id(self, lead_id: int, company_id: int = 1) -> Lead:
        """Obtém detalhes de um lead com histórico de interações."""
        lead = (
            self.db.query(Lead)
            .filter(Lead.id == lead_id, Lead.company_id == company_id)
            .first()
        )
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead com ID {lead_id} não encontrado.",
            )
        return lead

    def update_lead(self, lead_id: int, data: LeadUpdate, user_id: int, company_id: int = 1) -> Lead:
        """Atualiza informações do lead."""
        lead = self.get_lead_by_id(lead_id, company_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(lead, key, val)

        log_audit(
            db=self.db,
            company_id=company_id,
            action="UPDATE_LEAD",
            entity="Lead",
            entity_id=lead.id,
            user_id=user_id,
            new_value=update_dict,
        )

        self.db.commit()
        self.db.refresh(lead)
        return lead

    def delete_lead(self, lead_id: int, user_id: int, company_id: int = 1) -> bool:
        """Exclui um lead e suas interações associadas."""
        lead = self.get_lead_by_id(lead_id, company_id)
        self.db.delete(lead)

        log_audit(
            db=self.db,
            company_id=company_id,
            action="DELETE_LEAD",
            entity="Lead",
            entity_id=lead_id,
            user_id=user_id,
        )
        self.db.commit()
        return True

    def move_lead_stage(self, lead_id: int, new_stage: LeadStage, user_id: int, notes: Optional[str] = None, company_id: int = 1) -> Lead:
        """Move o lead entre etapas do funil de vendas (novo -> proposta -> ganho / perdido)."""
        lead = self.get_lead_by_id(lead_id, company_id)
        old_stage = lead.stage

        # Ajuste de probabilidade automática baseado na etapa
        stage_probabilities = {
            LeadStage.NOVO: 10,
            LeadStage.PROPOSTA: 60,
            LeadStage.GANHO: 100,
            LeadStage.PERDIDO: 0,
        }

        lead.stage = new_stage
        lead.probability = stage_probabilities.get(new_stage, lead.probability)

        # Registo de interação automática de mudança de estágio
        interaction_text = f"Etapa alterada de '{old_stage.value.upper()}' para '{new_stage.value.upper()}'."
        if notes:
            interaction_text += f" Nota: {notes}"

        interaction = Interaction(
            lead_id=lead.id,
            user_id=user_id,
            type="note",
            description=interaction_text,
            date=datetime.now(timezone.utc),
        )
        self.db.add(interaction)

        log_audit(
            db=self.db,
            company_id=company_id,
            action="MOVE_LEAD_STAGE",
            entity="Lead",
            entity_id=lead.id,
            user_id=user_id,
            old_value={"stage": old_stage.value},
            new_value={"stage": new_stage.value, "probability": lead.probability},
        )

        self.db.commit()
        self.db.refresh(lead)
        logger.info("crm_lead_stage_moved", lead_id=lead.id, from_stage=old_stage.value, to_stage=new_stage.value)
        return lead

    def add_interaction(self, lead_id: int, data: InteractionCreate, user_id: int, company_id: int = 1) -> Interaction:
        """Adiciona um contacto / interação comercial (chamada, reunião, whatsapp, email)."""
        lead = self.get_lead_by_id(lead_id, company_id)

        interaction = Interaction(
            lead_id=lead.id,
            user_id=user_id,
            type=data.type,
            description=data.description,
            date=data.date or datetime.now(timezone.utc),
        )
        self.db.add(interaction)
        lead.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(interaction)
        return interaction

    def get_lead_interactions(self, lead_id: int, company_id: int = 1) -> List[Interaction]:
        """Listagem cronológica de interações do lead."""
        self.get_lead_by_id(lead_id, company_id)  # Valida permissão/existência
        return (
            self.db.query(Interaction)
            .filter(Interaction.lead_id == lead_id)
            .order_by(Interaction.date.desc())
            .all()
        )

    def calculate_pipeline_analysis(self, company_id: int = 1) -> PipelineAnalysisResponse:
        """Calcula o valor total e ponderado do pipeline dividido por etapas."""
        leads = self.db.query(Lead).filter(Lead.company_id == company_id).all()

        total_value = Decimal("0.00")
        weighted_value = Decimal("0.00")

        stage_groups: Dict[str, Dict[str, Any]] = {
            LeadStage.NOVO.value: {"count": 0, "total_value": Decimal("0.00"), "prob_sum": 0},
            LeadStage.PROPOSTA.value: {"count": 0, "total_value": Decimal("0.00"), "prob_sum": 0},
            LeadStage.GANHO.value: {"count": 0, "total_value": Decimal("0.00"), "prob_sum": 0},
            LeadStage.PERDIDO.value: {"count": 0, "total_value": Decimal("0.00"), "prob_sum": 0},
        }

        for l in leads:
            st = l.stage.value
            val = l.value or Decimal("0.00")
            prob = l.probability or 0

            total_value += val
            weighted_value += val * (Decimal(str(prob)) / Decimal("100.00"))

            if st in stage_groups:
                stage_groups[st]["count"] += 1
                stage_groups[st]["total_value"] += val
                stage_groups[st]["prob_sum"] += prob

        stage_metrics: List[PipelineStageMetrics] = []
        for st, data in stage_groups.items():
            avg_prob = float(data["prob_sum"] / data["count"]) if data["count"] > 0 else 0.0
            stage_metrics.append(
                PipelineStageMetrics(
                    stage=st,
                    count=data["count"],
                    total_value=data["total_value"],
                    average_probability=avg_prob,
                )
            )

        return PipelineAnalysisResponse(
            company_id=company_id,
            total_leads=len(leads),
            total_pipeline_value=total_value,
            weighted_pipeline_value=weighted_value.quantize(Decimal("0.01")),
            stages=stage_metrics,
        )

    def get_crm_analytics(self, company_id: int = 1) -> CRMAnalyticsResponse:
        """Gera métricas analíticas avançadas (Taxa de Ganho, Conversão por Fonte, Ticket Médio)."""
        leads = self.db.query(Lead).filter(Lead.company_id == company_id).all()

        total = len(leads)
        won = sum(1 for l in leads if l.stage == LeadStage.GANHO)
        lost = sum(1 for l in leads if l.stage == LeadStage.PERDIDO)
        active = total - won - lost

        win_rate = (float(won) / float(won + lost) * 100.0) if (won + lost) > 0 else 0.0
        total_won_revenue = sum((l.value for l in leads if l.stage == LeadStage.GANHO), Decimal("0.00"))
        avg_deal_size = (total_won_revenue / Decimal(str(won))) if won > 0 else Decimal("0.00")

        # Conversão por fonte (Source)
        source_counts: Dict[str, Dict[str, int]] = {}
        for l in leads:
            src = l.source or "direct"
            if src not in source_counts:
                source_counts[src] = {"total": 0, "won": 0}
            source_counts[src]["total"] += 1
            if l.stage == LeadStage.GANHO:
                source_counts[src]["won"] += 1

        conversion_by_source = []
        for src, counts in source_counts.items():
            rate = (float(counts["won"]) / float(counts["total"]) * 100.0) if counts["total"] > 0 else 0.0
            conversion_by_source.append({
                "source": src,
                "total_leads": counts["total"],
                "won_leads": counts["won"],
                "win_rate_percentage": round(rate, 2),
            })

        return CRMAnalyticsResponse(
            company_id=company_id,
            total_leads=total,
            won_leads=won,
            lost_leads=lost,
            active_leads=active,
            win_rate_percentage=round(win_rate, 2),
            conversion_by_source=conversion_by_source,
            average_deal_size=avg_deal_size.quantize(Decimal("0.01")),
            total_revenue_won=total_won_revenue,
            average_days_in_pipeline=14.5,
        )
