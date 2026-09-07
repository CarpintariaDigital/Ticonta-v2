from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.entities import Company
from app.models.premium_features import PremiumFeature, CompanyPremiumFeature
from app.services.licensing import LicensingService


class PremiumFeatureService:
    """Serviço de gestão de subscrições, ativação granular e cálculo de custos de módulos premium."""

    DEFAULT_FEATURES = [
        {
            "name": "whatsapp_delivery",
            "description": "Envio automático de faturas e recibos em PDF via WhatsApp (+258)",
            "monthly_cost_mzn": Decimal("350.00"),
            "category": "communication",
        },
        {
            "name": "sms_delivery",
            "description": "Envio de links curtos de download de documentos por SMS",
            "monthly_cost_mzn": Decimal("200.00"),
            "category": "communication",
        },
        {
            "name": "email_delivery",
            "description": "Disparo profissional de faturas eletrónicas por Email",
            "monthly_cost_mzn": Decimal("150.00"),
            "category": "communication",
        },
        {
            "name": "barcode_scanner",
            "description": "Leitor mobile de códigos de barras (EAN-13, QR) e checkout ultra-rápido",
            "monthly_cost_mzn": Decimal("400.00"),
            "category": "pos",
        },
    ]

    def __init__(self, db: Session):
        self.db = db
        self.licensing_service = LicensingService()
        self._seed_features_if_empty()

    def _seed_features_if_empty(self):
        """Inicializa a tabela de funcionalidades premium se estiver vazia."""
        for feat in self.DEFAULT_FEATURES:
            exists = self.db.query(PremiumFeature).filter(PremiumFeature.name == feat["name"]).first()
            if not exists:
                pf = PremiumFeature(
                    name=feat["name"],
                    description=feat["description"],
                    monthly_cost_mzn=feat["monthly_cost_mzn"],
                    category=feat["category"],
                )
                self.db.add(pf)
        self.db.commit()

    def get_available_features(self, company_id: int = 1) -> List[Dict[str, Any]]:
        """Retorna todas as funcionalidades premium com status (habilitado/desabilitado) e custo."""
        features = self.db.query(PremiumFeature).all()
        enabled_records = (
            self.db.query(CompanyPremiumFeature)
            .filter(
                CompanyPremiumFeature.company_id == company_id,
                CompanyPremiumFeature.enabled == True,
            )
            .all()
        )
        enabled_feature_ids = {rec.feature_id: rec for rec in enabled_records}

        results = []
        for f in features:
            is_enabled = f.id in enabled_feature_ids
            record = enabled_feature_ids.get(f.id)
            results.append({
                "id": f.id,
                "name": f.name,
                "description": f.description,
                "monthly_cost_mzn": float(f.monthly_cost_mzn),
                "category": f.category,
                "enabled": is_enabled,
                "activated_at": record.activated_at if record else None,
            })
        return results

    def enable_feature(
        self,
        company_id: int,
        feature_name: str,
        user_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Ativa uma funcionalidade premium para a empresa."""
        feature = self.db.query(PremiumFeature).filter(PremiumFeature.name == feature_name.lower()).first()
        if not feature:
            raise ValueError(f"Funcionalidade premium '{feature_name}' não encontrada.")

        record = (
            self.db.query(CompanyPremiumFeature)
            .filter(
                CompanyPremiumFeature.company_id == company_id,
                CompanyPremiumFeature.feature_id == feature.id,
            )
            .first()
        )

        if record:
            record.enabled = True
            record.activated_at = datetime.utcnow()
            record.deactivated_at = None
            record.activated_by_id = user_id
        else:
            record = CompanyPremiumFeature(
                company_id=company_id,
                feature_id=feature.id,
                enabled=True,
                activated_at=datetime.utcnow(),
                activated_by_id=user_id,
            )
            self.db.add(record)

        self.db.commit()
        self.db.refresh(record)

        cost_breakdown = self.calculate_total_premium_cost(company_id)
        return {
            "message": f"Funcionalidade '{feature.name}' ativada com sucesso!",
            "feature": feature.name,
            "enabled": True,
            "cost_breakdown": cost_breakdown,
        }

    def disable_feature(self, company_id: int, feature_name: str) -> Dict[str, Any]:
        """Desativa uma funcionalidade premium."""
        feature = self.db.query(PremiumFeature).filter(PremiumFeature.name == feature_name.lower()).first()
        if not feature:
            raise ValueError(f"Funcionalidade premium '{feature_name}' não encontrada.")

        record = (
            self.db.query(CompanyPremiumFeature)
            .filter(
                CompanyPremiumFeature.company_id == company_id,
                CompanyPremiumFeature.feature_id == feature.id,
            )
            .first()
        )

        if record:
            record.enabled = False
            record.deactivated_at = datetime.utcnow()
            self.db.commit()

        cost_breakdown = self.calculate_total_premium_cost(company_id)
        return {
            "message": f"Funcionalidade '{feature.name}' desativada.",
            "feature": feature.name,
            "enabled": False,
            "cost_breakdown": cost_breakdown,
        }

    def calculate_total_premium_cost(self, company_id: int = 1) -> Dict[str, Any]:
        """Calcula o somatório do plano base + módulos premium ativos."""
        company = self.db.query(Company).filter(Company.id == company_id).first()
        plan_name = (company.plan or "professional").lower() if company else "professional"
        base_rate = self.licensing_service.PRICING.get(plan_name, {}).get("price_monthly", Decimal("1500.00"))

        enabled_records = (
            self.db.query(CompanyPremiumFeature)
            .filter(
                CompanyPremiumFeature.company_id == company_id,
                CompanyPremiumFeature.enabled == True,
            )
            .all()
        )

        features_breakdown = []
        premium_total = Decimal("0.00")

        for rec in enabled_records:
            features_breakdown.append({
                "name": rec.feature.name,
                "cost_mzn": float(rec.feature.monthly_cost_mzn),
            })
            premium_total += rec.feature.monthly_cost_mzn

        grand_total = base_rate + premium_total

        return {
            "base_plan": plan_name.upper(),
            "base_plan_cost_mzn": float(base_rate),
            "enabled_features": features_breakdown,
            "premium_addons_total_mzn": float(premium_total),
            "grand_total_monthly_mzn": float(grand_total),
            "next_billing_date": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d"),
        }

    def has_feature(self, company_id: int, feature_name: str) -> bool:
        """Verifica se uma funcionalidade está ativa para a empresa (Route Guards)."""
        feature = self.db.query(PremiumFeature).filter(PremiumFeature.name == feature_name.lower()).first()
        if not feature:
            return False

        record = (
            self.db.query(CompanyPremiumFeature)
            .filter(
                CompanyPremiumFeature.company_id == company_id,
                CompanyPremiumFeature.feature_id == feature.id,
                CompanyPremiumFeature.enabled == True,
            )
            .first()
        )
        return record is not None
