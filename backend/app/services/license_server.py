import hashlib
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import structlog
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.module_map import PLAN_MODULES, get_modules_for_plan
from app.models.license_record import LicenseRecord

logger = structlog.get_logger()


def issue_license(
    nuit: str,
    machine_id: str,
    plan: str = "pro",
    duration_days: int = 365,
    client_name: Optional[str] = None,
    client_email: Optional[str] = None,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Gera uma chave de licença no formato: TC-{NUIT}-{HASH}-{EXPIRY}
    onde HASH = SHA256(nuit + machine_id + secret_key)[:12].upper()
    e EXPIRY = YYYYMMDD
    """
    clean_nuit = nuit.strip().replace(" ", "")
    clean_machine = machine_id.strip()
    plan_clean = plan.lower().strip()
    if plan_clean not in PLAN_MODULES:
        plan_clean = "base"

    issued_at = datetime.utcnow()
    expires_at = issued_at + timedelta(days=duration_days)
    expiry_str = expires_at.strftime("%Y%m%d")

    raw_payload = f"{clean_nuit}{clean_machine}{settings.SECRET_KEY}".encode("utf-8")
    hash_str = hashlib.sha256(raw_payload).hexdigest()[:12].upper()

    license_key = f"TC-{clean_nuit}-{hash_str}-{expiry_str}"

    record = None
    if db is not None:
        record = LicenseRecord(
            license_key=license_key,
            nuit=clean_nuit,
            machine_id=clean_machine,
            plan=plan_clean,
            client_name=client_name,
            client_email=client_email,
            issued_at=issued_at,
            expires_at=expires_at,
            is_active=True,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        logger.info(
            "license_issued",
            license_key=license_key,
            nuit=clean_nuit,
            plan=plan_clean,
            expires_at=expires_at.isoformat(),
        )

    return {
        "license_key": license_key,
        "nuit": clean_nuit,
        "machine_id": clean_machine,
        "plan": plan_clean,
        "modules": get_modules_for_plan(plan_clean),
        "issued_at": issued_at.strftime("%Y-%m-%d"),
        "expires_at": expires_at.strftime("%Y-%m-%d"),
        "client_name": client_name,
        "client_email": client_email,
    }


def validate_license(
    license_key: str,
    machine_id: str,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Valida formato, NUIT, assinatura hash contra machine_id, expiração e status de revogação.
    Retorna: {"valid": True, "plan": "pro", "modules": [...], "expires": "2027-08-18"}
    """
    if not license_key or not isinstance(license_key, str):
        return {"valid": False, "reason": "empty_license_key"}

    parts = license_key.strip().split("-")
    if len(parts) != 4 or parts[0] != "TC":
        return {"valid": False, "reason": "invalid_license_format"}

    _, nuit, provided_hash, expiry_str = parts
    clean_machine = machine_id.strip()

    # 1. Verificar Expiração
    try:
        expires_date = datetime.strptime(expiry_str, "%Y%m%d").replace(
            hour=23, minute=59, second=59
        )
    except ValueError:
        return {"valid": False, "reason": "invalid_expiry_date"}

    now = datetime.utcnow()
    if now > expires_date:
        return {
            "valid": False,
            "reason": "license_expired",
            "expires": expires_date.strftime("%Y-%m-%d"),
        }

    # 2. Verificar Hash vs Machine ID
    expected_payload = f"{nuit}{clean_machine}{settings.SECRET_KEY}".encode("utf-8")
    expected_hash = hashlib.sha256(expected_payload).hexdigest()[:12].upper()

    if provided_hash.upper() != expected_hash:
        return {"valid": False, "reason": "machine_id_or_nuit_mismatch"}

    # 3. Verificar Revogação no Banco de Dados
    plan = "pro"
    if db is not None:
        record = db.query(LicenseRecord).filter(LicenseRecord.license_key == license_key).first()
        if record:
            if not record.is_active or record.revoked_at is not None:
                return {"valid": False, "reason": "license_revoked"}
            plan = record.plan

    return {
        "valid": True,
        "plan": plan,
        "modules": get_modules_for_plan(plan),
        "expires": expires_date.strftime("%Y-%m-%d"),
        "nuit": nuit,
    }


def revoke_license(
    license_key: str,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Revoga uma chave de licença activa.
    """
    if db is not None:
        record = db.query(LicenseRecord).filter(LicenseRecord.license_key == license_key).first()
        if record:
            record.is_active = False
            record.revoked_at = datetime.utcnow()
            db.commit()
            logger.warn("license_revoked", license_key=license_key)
            return {"revoked": True, "license_key": license_key, "status": "revoked"}

    return {"revoked": True, "license_key": license_key, "status": "blacklisted"}
