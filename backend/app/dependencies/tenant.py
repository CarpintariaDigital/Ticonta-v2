from fastapi import Request, HTTPException, status
from typing import Optional


def get_tenant_id(request: Request) -> int:
    """
    Dependência FastAPI — extrai e valida tenant_id do request.state.
    Injeta automaticamente em qualquer endpoint que a declare.
    
    Uso nos endpoints:
        tenant_id: int = Depends(get_tenant_id)
    
    Substitui o padrão inseguro:
        company_id: int = Query(1)
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso não autorizado: tenant não identificado"
        )
    return int(tenant_id)


def get_optional_tenant_id(request: Request) -> Optional[int]:
    """
    Versão opcional — para endpoints que podem operar 
    sem tenant (ex: admin global, health checks).
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    return int(tenant_id) if tenant_id else None
