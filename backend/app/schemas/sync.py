from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SyncOperation(BaseModel):
    client_mutation_id: str = Field(..., description="UUID gerado no client para idempotência")
    entity: str = Field(..., description="Product, Sale, Customer, Account, etc.")
    entity_id: Optional[int] = None
    operation: str = Field(..., description="CREATE, UPDATE, DELETE")
    client_timestamp: datetime
    payload: Dict[str, Any]


class SyncPushRequest(BaseModel):
    company_id: int = Field(default=1)
    device_id: Optional[str] = None
    operations: List[SyncOperation]


class SyncOperationResult(BaseModel):
    client_mutation_id: str
    entity: str
    server_entity_id: Optional[int] = None
    status: str  # APPLIED, CONFLICT_RESOLVED, REJECTED, DUPLICATE_SKIPPED
    message: Optional[str] = None
    server_timestamp: datetime


class SyncPushResponse(BaseModel):
    company_id: int
    processed_count: int
    results: List[SyncOperationResult]
    server_sync_timestamp: datetime


class EntityChange(BaseModel):
    entity: str
    entity_id: int
    operation: str
    data: Dict[str, Any]
    updated_at: datetime


class SyncPullResponse(BaseModel):
    company_id: int
    last_sync_timestamp: datetime
    server_sync_timestamp: datetime
    changes_count: int
    changes: List[EntityChange]
