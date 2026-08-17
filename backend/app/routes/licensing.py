from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import Company
from app.models.license import License
from app.models.user import User
from app.schemas.licensing import (
    ActivateLicenseRequest,
    ActivateLicenseResponse,
    GenerateLicenseRequest,
    GenerateLicenseResponse,
    LicenseListItem,
    LicenseStatusResponse,
    LicensingStatsResponse,
    RenewLicenseRequest,
    RenewLicenseResponse,
    ValidateLicenseRequest,
    ValidateLicenseResponse,
)
from app.services.licensing import LicensingService

router = APIRouter(prefix="/api/v1/licensing", tags=["Licensing"])
licensing_service = LicensingService()


# 1. POST /api/v1/licensing/generate-key (ADMIN ONLY)
@router.post(
    "/generate-key",
    response_model=GenerateLicenseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Gerar nova licença assinada criptograficamente (Admin)",
)
def generate_license(
    req: GenerateLicenseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem emitir chaves de licença.",
        )

    try:
        gen_data = licensing_service.generate_license_key(
            customer_name=req.customer_name,
            plan=req.plan,
            days=req.days,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Guardar registo em banco de dados
    license_record = License(
        license_key=gen_data["license_key"],
        customer_name=gen_data["customer_name"],
        customer_id=gen_data["customer_id"],
        plan=gen_data["plan"],
        issued_at=gen_data["issued_at"],
        expires_at=gen_data["expires_at"],
        issued_by_id=current_user.id,
        status="active",
    )
    db.add(license_record)
    db.commit()
    db.refresh(license_record)

    return GenerateLicenseResponse(
        license_key=gen_data["license_key"],
        customer_id=gen_data["customer_id"],
        customer_name=gen_data["customer_name"],
        plan=gen_data["plan"],
        modules=gen_data["modules"],
        issued_at=gen_data["issued_at"],
        expires_at=gen_data["expires_at"],
        price_mzn=gen_data["price_mzn"],
    )


# 2. POST /api/v1/licensing/validate-key (PUBLIC)
@router.post(
    "/validate-key",
    response_model=ValidateLicenseResponse,
    summary="Validar chave de licença publicamente sem autenticação",
)
def validate_license(req: ValidateLicenseRequest):
    val_res = licensing_service.validate_license_key(req.license_key)
    return ValidateLicenseResponse(
        valid=val_res["valid"],
        customer_id=val_res.get("customer_id"),
        plan=val_res.get("plan"),
        modules=val_res.get("modules", []),
        expires_at=val_res.get("expires_at"),
        days_remaining=val_res.get("days_remaining", 0),
        error=val_res.get("error"),
    )


# 3. POST /api/v1/licensing/activate-license (AUTHENTICATED)
@router.post(
    "/activate-license",
    response_model=ActivateLicenseResponse,
    summary="Ativar licença para a empresa no ERP",
)
def activate_license(
    req: ActivateLicenseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    val_res = licensing_service.validate_license_key(req.license_key)
    if not val_res["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=val_res.get("error") or "Chave de licença inválida.",
        )

    company = db.query(Company).filter(Company.id == req.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada.",
        )

    # Converter data de expiração ISO em datetime
    exp_dt = datetime.fromisoformat(val_res["expires_at"])

    company.license_key = req.license_key
    company.plan = val_res["plan"]
    company.active_modules = val_res["modules"]
    company.license_expires_at = exp_dt

    db.commit()
    db.refresh(company)

    return ActivateLicenseResponse(
        message="Licença TiConta v2 ativada com sucesso!",
        company_id=company.id,
        plan=company.plan,
        modules=company.active_modules or [],
        expires_at=company.license_expires_at,
    )


# 4. GET /api/v1/licensing/status (AUTHENTICATED)
@router.get(
    "/status",
    response_model=LicenseStatusResponse,
    summary="Obter estado atual do licenciamento da empresa",
)
def get_license_status(
    company_id: int = Query(default=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company or not company.license_key:
        return LicenseStatusResponse(
            status="unlicensed",
            plan=None,
            modules=[],
            license_key=None,
            expires_at=None,
            days_remaining=0,
        )

    val_res = licensing_service.validate_license_key(company.license_key)
    now = datetime.utcnow()
    exp = company.license_expires_at
    days_left = max(0, (exp - now).days) if exp else 0

    status_str = "licensed" if (val_res["valid"] and exp and now <= exp) else "expired"

    return LicenseStatusResponse(
        status=status_str,
        plan=company.plan,
        modules=company.active_modules or [],
        license_key=company.license_key,
        expires_at=company.license_expires_at,
        days_remaining=days_left,
    )


# 5. GET /api/v1/licensing/admin/licenses (ADMIN ONLY)
@router.get(
    "/admin/licenses",
    response_model=List[LicenseListItem],
    summary="Listar todas as licenças emitidas (Admin)",
)
def list_licenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito.")

    licenses = db.query(License).order_by(License.created_at.desc()).all()
    now = datetime.utcnow()
    result = []
    for lic in licenses:
        days = max(0, (lic.expires_at - now).days)
        st = lic.status
        if st == "active" and lic.expires_at < now:
            st = "expired"
        result.append(
            LicenseListItem(
                id=lic.id,
                customer_name=lic.customer_name,
                customer_id=lic.customer_id,
                plan=lic.plan,
                license_key=lic.license_key,
                issued_at=lic.issued_at,
                expires_at=lic.expires_at,
                status=st,
                days_remaining=days,
            )
        )
    return result


# 6. PUT /api/v1/licensing/admin/licenses/{id}/renew (ADMIN ONLY)
@router.put(
    "/admin/licenses/{id}/renew",
    response_model=RenewLicenseResponse,
    summary="Renovar e estender prazo de validade de uma licença (Admin)",
)
def renew_license(
    id: int,
    req: RenewLicenseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito.")

    lic = db.query(License).filter(License.id == id).first()
    if not lic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Licença não encontrada.")

    # Gerar nova chave estendida
    new_gen = licensing_service.generate_license_key(
        customer_name=lic.customer_name,
        plan=lic.plan,
        days=req.days,
        customer_id=lic.customer_id,
    )

    lic.license_key = new_gen["license_key"]
    lic.expires_at = new_gen["expires_at"]
    lic.status = "active"

    db.commit()
    db.refresh(lic)

    now = datetime.utcnow()
    days_rem = max(0, (lic.expires_at - now).days)

    return RenewLicenseResponse(
        message="Licença renovada com sucesso!",
        license_id=lic.id,
        new_expiry=lic.expires_at,
        days_remaining=days_rem,
    )


# 7. GET /api/v1/licensing/admin/stats (ADMIN ONLY)
@router.get(
    "/admin/stats",
    response_model=LicensingStatsResponse,
    summary="Estatísticas globais e faturação de licenças (Admin)",
)
def get_licensing_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_admin():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito.")

    licenses = db.query(License).all()
    now = datetime.utcnow()

    total = len(licenses)
    active = 0
    expired = 0
    revoked = 0
    by_plan: Dict[str, int] = {}
    revenue = Decimal("0.00")

    for lic in licenses:
        by_plan[lic.plan] = by_plan.get(lic.plan, 0) + 1
        if lic.status == "revoked":
            revoked += 1
        elif lic.expires_at < now:
            expired += 1
        else:
            active += 1

        plan_info = licensing_service.PRICING.get(lic.plan.lower(), {})
        monthly = plan_info.get("price_monthly", Decimal("500.00"))
        revenue += monthly * Decimal("12")  # Base anual

    return LicensingStatsResponse(
        total_licenses=total,
        active_licenses=active,
        expired_licenses=expired,
        revoked_licenses=revoked,
        by_plan=by_plan,
        estimated_revenue_mzn=revenue,
    )
