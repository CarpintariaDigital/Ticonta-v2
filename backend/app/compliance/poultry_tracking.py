from datetime import datetime, date
from decimal import Decimal
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from app.models.poultry import Farm, Flock, HealthRecord, MortalityRecord, EggProduction


class PoultryTraceabilityCompliance:
    """
    Rastreabilidade zootécnica, sanitária e conformidade com a
    Direcção Nacional de Veterinária (DINAV) e Ministério da Agricultura de Moçambique.
    """

    def __init__(self, db: Session):
        self.db = db

    def log_flock_lifecycle_event(
        self,
        flock: Flock,
        event_type: str,
        details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Gera registro de auditoria e rastreabilidade para o lote de aves."""
        return {
            "flock_id": flock.id,
            "flock_number": flock.flock_number,
            "species": flock.species,
            "event_type": event_type,
            "farm_id": flock.farm_id,
            "details": details,
            "timestamp": datetime.utcnow().isoformat(),
            "regulatory_framework": "DINAV - Regulamento de Sanidade e Bem-Estar Avícola Moçambique",
        }

    def assess_biosecurity_and_mortality(
        self,
        flock: Flock,
        cumulative_deaths: int
    ) -> Dict[str, Any]:
        """Avalia taxas de mortalidade e gera alertas de biossegurança veterinária."""
        start_qty = flock.quantity_at_start
        mortality_rate = (cumulative_deaths / start_qty * 100) if start_qty > 0 else 0.0

        alert_level = "NORMAL"
        if mortality_rate > 10.0:
            alert_level = "CRITICAL"
        elif mortality_rate > 5.0:
            alert_level = "WARNING"

        return {
            "flock_id": flock.id,
            "flock_number": flock.flock_number,
            "cumulative_deaths": cumulative_deaths,
            "mortality_rate_percent": round(mortality_rate, 2),
            "alert_level": alert_level,
            "requires_veterinary_inspection": mortality_rate > 5.0,
            "standard_vaccinations_required": [
                "Newcastle (NDV)",
                "Gumboro (IBD)",
                "Bronquite Infecciosa (IB)",
                "Bouba Aviária (Pox)",
            ],
            "assessed_at": datetime.utcnow().isoformat(),
        }
