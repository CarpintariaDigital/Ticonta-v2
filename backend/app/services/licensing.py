import hashlib
import hmac
import random
import string
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings


class LicensingService:
    """
    Serviço Criptográfico de Licenciamento (HMAC-SHA256) do TiConta v2.
    Gera e valida chaves no formato: TIC-XXXXX-PLAN-YYMMDD-SIGNATURE
    """

    PRICING: Dict[str, Dict[str, Any]] = {
        "basic": {
            "price_monthly": Decimal("500.00"),
            "modules": ["pos", "customers", "inventory"],
            "description": "Básico para micro-comércio",
        },
        "professional": {
            "price_monthly": Decimal("1500.00"),
            "modules": ["pos", "customers", "inventory", "crm", "financial", "reports"],
            "description": "Profissional para PMEs",
        },
        "complete": {
            "price_monthly": Decimal("3500.00"),
            "modules": [
                "pos",
                "customers",
                "inventory",
                "crm",
                "financial",
                "reports",
                "accounting",
                "projects",
                "hr",
                "manufacturing",
            ],
            "description": "Completo para indústria, marcenaria e contabilidade",
        },
        "enterprise": {
            "price_monthly": Decimal("7500.00"),
            "modules": ["*"],
            "description": "Enterprise ilimitado com todos os módulos",
        },
    }

    def __init__(self, master_key: Optional[str] = None):
        self.master_key = (master_key or settings.LICENSE_MASTER_KEY).encode("utf-8")

    def _generate_signature(self, payload_str: str) -> str:
        """Gera assinatura HMAC-SHA256 truncada em 8 caracteres maiúsculos hexadecimais."""
        signature = hmac.new(
            self.master_key,
            payload_str.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return signature[:8].upper()

    def generate_license_key(
        self,
        customer_name: str,
        plan: str,
        days: int = 365,
        customer_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Gera uma chave criptografada com assinatura digital HMAC-SHA256.
        Formato: TIC-XXXXX-PLAN-YYMMDD-SIGNATURE
        """
        plan_lower = plan.lower().strip()
        if plan_lower not in self.PRICING:
            raise ValueError(f"Plano inválido: {plan}. Opções: {list(self.PRICING.keys())}")

        # ID único aleatório de cliente caso não fornecido (5 caracteres alfanuméricos)
        cust_id = customer_id or "".join(random.choices(string.ascii_uppercase + string.digits, k=5))

        issued_at = datetime.utcnow()
        expires_at = issued_at + timedelta(days=days)
        yymmdd = expires_at.strftime("%y%m%d")
        plan_code = plan_lower.upper()

        # Payload base para assinatura
        payload_base = f"TIC-{cust_id}-{plan_code}-{yymmdd}"
        signature = self._generate_signature(payload_base)

        license_key = f"{payload_base}-{signature}"

        # Cálculo de preço estimado proporcional aos meses
        monthly_rate = self.PRICING[plan_lower]["price_monthly"]
        months = Decimal(str(max(1, round(days / 30.0))))
        total_price = monthly_rate * months

        return {
            "license_key": license_key,
            "customer_id": cust_id,
            "customer_name": customer_name,
            "plan": plan_lower,
            "modules": self.PRICING[plan_lower]["modules"],
            "issued_at": issued_at,
            "expires_at": expires_at,
            "price_mzn": total_price,
        }

    def validate_license_key(self, license_key: str) -> Dict[str, Any]:
        """
        Valida o formato, a assinatura HMAC-SHA256 e a data de expiração da chave.
        """
        if not license_key or not isinstance(license_key, str):
            return {"valid": False, "error": "Chave de licença inválida ou ausente"}

        parts = license_key.strip().split("-")
        if len(parts) != 5:
            return {
                "valid": False,
                "error": "Formato de chave inválido. Esperado: TIC-XXXXX-PLAN-YYMMDD-SIGNATURE",
            }

        prefix, cust_id, plan_code, yymmdd, provided_sig = parts

        if prefix != "TIC":
            return {"valid": False, "error": "Prefixo de licença inválido (deve iniciar com TIC)"}

        plan_lower = plan_code.lower()
        if plan_lower not in self.PRICING:
            return {"valid": False, "error": f"Plano desconhecido: {plan_code}"}

        # 1. Verificar Assinatura Criptográfica HMAC
        payload_base = f"TIC-{cust_id}-{plan_code}-{yymmdd}"
        expected_sig = self._generate_signature(payload_base)

        if not hmac.compare_digest(provided_sig.upper(), expected_sig):
            return {
                "valid": False,
                "error": "Assinatura digital da licença inválida ou adulterada.",
            }

        # 2. Verificar Data de Expiração
        try:
            exp_date = datetime.strptime(yymmdd, "%y%m%d")
            # Ajustar para fim do dia
            exp_date = exp_date.replace(hour=23, minute=59, second=59)
        except ValueError:
            return {"valid": False, "error": "Data de expiração da licença mal formatada."}

        now = datetime.utcnow()
        days_remaining = (exp_date - now).days

        if now > exp_date:
            return {
                "valid": False,
                "customer_id": cust_id,
                "plan": plan_lower,
                "modules": self.PRICING[plan_lower]["modules"],
                "expires_at": exp_date.isoformat(),
                "days_remaining": 0,
                "error": "A licença expirou. Contacte o suporte TiConta para renovação.",
            }

        return {
            "valid": True,
            "customer_id": cust_id,
            "plan": plan_lower,
            "modules": self.PRICING[plan_lower]["modules"],
            "expires_at": exp_date.isoformat(),
            "days_remaining": max(0, days_remaining),
            "error": None,
        }
