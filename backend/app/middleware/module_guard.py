from typing import Any, Dict, List, Optional
import jwt
import structlog
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.module_map import get_module_for_path

logger = structlog.get_logger()


class ModuleGuardMiddleware(BaseHTTPMiddleware):
    """
    Middleware FastAPI que valida se a rota acessada pertence aos módulos
    licenciados no token JWT do utilizador.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # 1. Identificar se a rota pertence a algum módulo licenciado
        target_module = get_module_for_path(path)
        if not target_module:
            # Rotas públicas, autenticação, licença, docs ou de sistema
            return await call_next(request)

        # 2. Ler o cabeçalho Authorization
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            # Sem token; deixa passar para as dependências de auth responderem 401
            return await call_next(request)

        token = auth_header.split(" ", 1)[1].strip()

        # 3. Decodificar o payload JWT
        try:
            payload: Dict[str, Any] = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
        except Exception:
            # Token inválido ou expirado; dependências FastAPI tratam 401
            return await call_next(request)

        # 4. Extrair lista de módulos activos
        user_modules: List[str] = payload.get("modules", [])
        roles: List[str] = payload.get("roles", [])

        # Administradores têm acesso irrestrito
        if "admin" in [r.lower() for r in roles] or "superuser" in [r.lower() for r in roles]:
            return await call_next(request)

        # 5. Validar licença do módulo
        if "*" not in user_modules and target_module not in user_modules:
            logger.warn(
                "module_access_blocked_unlicensed",
                path=path,
                target_module=target_module,
                user_modules=user_modules,
                user_id=payload.get("user_id"),
            )
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": "module_not_licensed",
                    "module": target_module,
                    "upgrade_url": "/pricing",
                },
            )

        return await call_next(request)
