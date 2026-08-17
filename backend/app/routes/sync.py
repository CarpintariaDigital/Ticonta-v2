from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_token_data
from app.schemas.sync import (
    SyncPullResponse,
    SyncPushRequest,
    SyncPushResponse,
)
from app.services.sync import SyncService

router = APIRouter(prefix="/api/v1/sync", tags=["Offline / Online Synchronization"])


@router.post("/push", response_model=SyncPushResponse, status_code=status.HTTP_200_OK)
def push_client_mutations(
    data: SyncPushRequest,
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """
    Recebe um lote de operações realizadas offline no cliente (Dexie/IndexedDB).
    Garante idempotência, resolução de conflitos e persistência no banco central.
    """
    user_id = int(token_data.get("user_id") or token_data.get("sub"))
    sync_service = SyncService(db)
    return sync_service.sync_from_client(user_id=user_id, push_request=data)


@router.get("/pull", response_model=SyncPullResponse)
def pull_server_changes(
    company_id: int = Query(1),
    last_sync_timestamp: Optional[datetime] = Query(None, description="Timestamp ISO da última sincronização bem sucedida"),
    token_data: Dict[str, Any] = Depends(get_current_user_token_data),
    db: Session = Depends(get_db),
):
    """
    Retorna alterações incrementais do servidor (Produtos, Clientes, Preços) desde a última sincronização.
    """
    sync_service = SyncService(db)
    changes = sync_service.get_server_changes(
        company_id=company_id,
        since_timestamp=last_sync_timestamp,
    )
    now = datetime.now(timezone.utc)

    return SyncPullResponse(
        company_id=company_id,
        last_sync_timestamp=last_sync_timestamp or datetime.fromtimestamp(0, tz=timezone.utc),
        server_sync_timestamp=now,
        changes_count=len(changes),
        changes=changes,
    )
