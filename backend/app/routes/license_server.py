from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.license_record import LicenseRecord
from app.services.license_server import issue_license, revoke_license, validate_license

router = APIRouter(prefix="/api/v1/admin/licenses", tags=["Central License Server"])


class IssueLicenseInput(BaseModel):
    nuit: str = Field(..., description="NUIT fiscal da empresa")
    machine_id: str = Field(..., description="Identificador único da máquina/dispositivo")
    plan: str = Field("pro", description="Plano: base, pro, enterprise")
    duration_days: int = Field(365, ge=1, le=3650, description="Duração da licença em dias")
    client_name: Optional[str] = Field(None, description="Nome do cliente ou empresa")
    client_email: Optional[str] = Field(None, description="Email de contacto do cliente")


class RevokeLicenseInput(BaseModel):
    license_key: str = Field(..., description="Chave de licença a revogar")


class ValidateLicenseInput(BaseModel):
    license_key: str
    machine_id: str


@router.post("/issue", summary="Emitir Nova Licença Digital")
def route_issue_license(
    payload: IssueLicenseInput,
    db: Session = Depends(get_db),
    _token_data: Dict[str, Any] = Depends(require_role("admin")),
):
    """Emite uma nova chave criptográfica vinculada ao NUIT e Machine ID do cliente."""
    result = issue_license(
        nuit=payload.nuit,
        machine_id=payload.machine_id,
        plan=payload.plan,
        duration_days=payload.duration_days,
        client_name=payload.client_name,
        client_email=payload.client_email,
        db=db,
    )
    return result


@router.post("/revoke", summary="Revogar Licença Existente")
def route_revoke_license(
    payload: RevokeLicenseInput,
    db: Session = Depends(get_db),
    _token_data: Dict[str, Any] = Depends(require_role("admin")),
):
    """Revoga uma chave de licença activa."""
    result = revoke_license(license_key=payload.license_key, db=db)
    return result


@router.get("/by-nuit/{nuit}", summary="Consultar Licenças por NUIT")
@router.get("/nuit/{nuit}", summary="Consultar Licenças por NUIT (Alias)")
def route_get_licenses_by_nuit(
    nuit: str,
    db: Session = Depends(get_db),
    _token_data: Dict[str, Any] = Depends(require_role("admin")),
):
    """Pesquisa todas as licenças atribuídas a um NUIT específico."""
    records = (
        db.query(LicenseRecord)
        .filter(LicenseRecord.nuit == nuit.strip())
        .order_by(LicenseRecord.issued_at.desc())
        .all()
    )
    if not records:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Nenhuma licença encontrada para o NUIT {nuit}",
        )
    return [
        {
            "id": r.id,
            "license_key": r.license_key,
            "nuit": r.nuit,
            "machine_id": r.machine_id,
            "plan": r.plan,
            "client_name": r.client_name,
            "client_email": r.client_email,
            "issued_at": r.issued_at.isoformat(),
            "expires_at": r.expires_at.isoformat(),
            "is_active": r.is_active,
            "revoked_at": r.revoked_at.isoformat() if r.revoked_at else None,
        }
        for r in records
    ]
