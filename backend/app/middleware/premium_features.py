from functools import wraps
from typing import Callable
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.premium_features import PremiumFeatureService


def require_feature(feature_name: str):
    """
    Dependency / Decorator para proteção de rotas com base em funcionalidades premium ativas.
    Retorna 403 Forbidden se a empresa não tiver o módulo contratado.
    """
    def dependency(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ):
        svc = PremiumFeatureService(db)
        if not svc.has_feature(company_id=1, feature_name=feature_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "PREMIUM_FEATURE_LOCKED",
                    "feature_required": feature_name,
                    "message": f"O recurso premium '{feature_name}' não está ativo para a sua empresa. Ative-o no painel de subscrição.",
                    "upgrade_url": "/settings/license",
                },
            )
        return True

    return dependency
