from datetime import datetime
from typing import Callable, List, Optional
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.database import SessionLocal
from app.models.entities import Company
from app.services.licensing import LicensingService


class LicensingMiddleware(BaseHTTPMiddleware):
    """
    Middleware que verifica o estado da licença e a permissão modular por rota.
    Rotas públicas de auth, health, docs e validação de licença são isentas.
    """

    EXEMPT_PATHS = [
        "/docs",
        "/redoc",
        "/openapi.json",
        "/health",
        "/api/v1/auth/login",
        "/api/v1/auth/refresh",
        "/api/v1/licensing/validate-key",
    ]

    MODULE_ROUTE_MAPPING = {
        "/api/v1/sales": "pos",
        "/api/v1/crm": "crm",
        "/api/v1/accounting": "accounting",
        "/api/v1/projects": "projects",
        "/api/v1/hr": "hr",
        "/api/v1/manufacturing": "manufacturing",
        "/api/v1/reports": "reports",
    }

    def __init__(self, app):
        super().__init__(app)
        self.licensing_service = LicensingService()

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path

        # 1. Ignorar rotas isentas e OPTIONS
        if request.method == "OPTIONS" or any(path.startswith(exempt) for exempt in self.EXEMPT_PATHS):
            return await call_next(request)

        # 2. Ignorar rotas administrativas de licença para permitir ativação
        if path.startswith("/api/v1/licensing"):
            return await call_next(request)

        # 3. Validar licença da empresa ativa
        # Buscar company_id da query ou default 1
        company_id_param = request.query_params.get("company_id")
        company_id = int(company_id_param) if company_id_param and company_id_param.isdigit() else 1

        db = SessionLocal()
        try:
            company = db.query(Company).filter(Company.id == company_id).first()
            if company and company.license_key:
                val_res = self.licensing_service.validate_license_key(company.license_key)
                if not val_res["valid"]:
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={
                            "detail": "Licença expirada ou inválida. Contacte o administrador.",
                            "error_code": "LICENSE_INVALID",
                            "error": val_res.get("error"),
                        },
                    )

                # 4. Verificar autorização granular de módulo
                active_modules: List[str] = company.active_modules or []
                if "*" not in active_modules:
                    for route_prefix, required_mod in self.MODULE_ROUTE_MAPPING.items():
                        if path.startswith(route_prefix) and required_mod not in active_modules:
                            return JSONResponse(
                                status_code=status.HTTP_403_FORBIDDEN,
                                content={
                                    "detail": f"O módulo '{required_mod}' não está incluído no plano contratado ({company.plan}).",
                                    "error_code": "MODULE_NOT_LICENSED",
                                    "required_module": required_mod,
                                    "active_modules": active_modules,
                                },
                            )
        finally:
            db.close()

        return await call_next(request)
