from typing import Any, Dict, Optional
import structlog
from sqlalchemy.orm import Session

from app.models.entities import AuditLog

logger = structlog.get_logger()


def log_audit(
    db: Session,
    company_id: int,
    action: str,
    entity: str,
    entity_id: Optional[int] = None,
    user_id: Optional[int] = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> AuditLog:
    """Registra uma ação de auditoria para compliance ISO 27001 e rastreabilidade."""
    audit_entry = AuditLog(
        company_id=company_id,
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(audit_entry)
    db.flush()
    logger.info(
        "audit_log_recorded",
        action=action,
        entity=entity,
        entity_id=entity_id,
        company_id=company_id,
        user_id=user_id,
    )
    return audit_entry
