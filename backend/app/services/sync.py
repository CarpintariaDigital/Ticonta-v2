from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
import structlog

from app.audit.service import log_audit
from app.models.entities import Customer, Product
from app.models.sale import Sale
from app.models.sync_log import SyncLog
from app.schemas.sale import SaleCreate
from app.schemas.sync import (
    EntityChange,
    SyncOperation,
    SyncOperationResult,
    SyncPushRequest,
    SyncPushResponse,
)
from app.services.sales import SalesService

logger = structlog.get_logger()


class SyncService:
    def __init__(self, db: Session):
        self.db = db

    def sync_from_client(
        self,
        user_id: int,
        push_request: SyncPushRequest,
    ) -> SyncPushResponse:
        """
        Processa mutações originadas do cliente em lote:
        - Verifica idempotência via client_mutation_id
        - Resolve conflitos (Last-Write-Wins / Server Validation)
        - Executa operações e grava no histórico do SyncLog
        """
        company_id = push_request.company_id
        device_id = push_request.device_id
        results: List[SyncOperationResult] = []
        now = datetime.now(timezone.utc)

        for op in push_request.operations:
            # 1. Idempotência: Se mutação já foi aplicada, retorna o resultado salvo
            existing_log = (
                self.db.query(SyncLog)
                .filter(SyncLog.client_mutation_id == op.client_mutation_id)
                .first()
            )
            if existing_log:
                results.append(
                    SyncOperationResult(
                        client_mutation_id=op.client_mutation_id,
                        entity=existing_log.entity,
                        server_entity_id=existing_log.entity_id,
                        status="DUPLICATE_SKIPPED",
                        message="Mutação já processada anteriormente.",
                        server_timestamp=existing_log.server_timestamp,
                    )
                )
                continue

            try:
                # 2. Executar por tipo de Entidade
                server_id = None
                status_op = "APPLIED"
                conflict_details = None

                if op.entity.lower() == "sale" and op.operation.upper() == "CREATE":
                    # Criar venda através do SalesService
                    sales_service = SalesService(self.db)
                    payload = op.payload
                    sale_data = SaleCreate(
                        company_id=company_id,
                        customer_id=payload.get("customer_id"),
                        items=payload.get("items", []),
                        payment_method=payload.get("payment_method", "cash"),
                        payment_status=payload.get("payment_status", "completed"),
                        discount=Decimal(str(payload.get("discount", "0.00"))),
                    )
                    created_sale = sales_service.create_sale(
                        sale_data=sale_data,
                        user_id=user_id,
                        client_ip=device_id,
                        user_agent="OfflineSyncEngine/2.0",
                    )
                    server_id = created_sale.id

                elif op.entity.lower() == "customer":
                    server_id = self._sync_customer(company_id, op)

                elif op.entity.lower() == "product":
                    server_id = self._sync_product(company_id, op)

                else:
                    status_op = "REJECTED"
                    conflict_details = {"reason": f"Entidade '{op.entity}' não suportada para sync direto."}

                # 3. Gravar SyncLog
                sync_log = SyncLog(
                    company_id=company_id,
                    user_id=user_id,
                    device_id=device_id,
                    client_mutation_id=op.client_mutation_id,
                    entity=op.entity,
                    entity_id=server_id,
                    operation=op.operation,
                    client_timestamp=op.client_timestamp,
                    server_timestamp=now,
                    payload=op.payload,
                    status=status_op,
                    conflict_details=conflict_details,
                )
                self.db.add(sync_log)
                self.db.commit()

                results.append(
                    SyncOperationResult(
                        client_mutation_id=op.client_mutation_id,
                        entity=op.entity,
                        server_entity_id=server_id,
                        status=status_op,
                        message="Operação aplicada com sucesso." if status_op == "APPLIED" else conflict_details.get("reason"),
                        server_timestamp=now,
                    )
                )

            except Exception as e:
                self.db.rollback()
                logger.exception("sync_operation_failed", mutation_id=op.client_mutation_id, error=str(e))
                # Registrar rejeição
                failed_log = SyncLog(
                    company_id=company_id,
                    user_id=user_id,
                    device_id=device_id,
                    client_mutation_id=op.client_mutation_id,
                    entity=op.entity,
                    entity_id=op.entity_id,
                    operation=op.operation,
                    client_timestamp=op.client_timestamp,
                    server_timestamp=now,
                    payload=op.payload,
                    status="REJECTED",
                    conflict_details={"error": str(e)},
                )
                self.db.add(failed_log)
                self.db.commit()

                results.append(
                    SyncOperationResult(
                        client_mutation_id=op.client_mutation_id,
                        entity=op.entity,
                        server_entity_id=None,
                        status="REJECTED",
                        message=str(e),
                        server_timestamp=now,
                    )
                )

        return SyncPushResponse(
            company_id=company_id,
            processed_count=len(results),
            results=results,
            server_sync_timestamp=now,
        )

    def _sync_customer(self, company_id: int, op: SyncOperation) -> int:
        p = op.payload
        if op.operation.upper() == "CREATE":
            customer = Customer(
                company_id=company_id,
                name=p.get("name", "Cliente"),
                nuit=p.get("nuit"),
                email=p.get("email"),
                phone=p.get("phone"),
                address=p.get("address"),
                city=p.get("city"),
            )
            self.db.add(customer)
            self.db.flush()
            return customer.id
        elif op.operation.upper() == "UPDATE" and op.entity_id:
            cust = self.db.query(Customer).filter(Customer.id == op.entity_id, Customer.company_id == company_id).first()
            if cust:
                # Last write wins
                if "name" in p: cust.name = p["name"]
                if "phone" in p: cust.phone = p["phone"]
                if "email" in p: cust.email = p["email"]
                self.db.flush()
                return cust.id
        return op.entity_id or 0

    def _sync_product(self, company_id: int, op: SyncOperation) -> int:
        p = op.payload
        if op.operation.upper() == "UPDATE" and op.entity_id:
            prod = self.db.query(Product).filter(Product.id == op.entity_id, Product.company_id == company_id).first()
            if prod:
                if "quantity" in p:
                    prod.quantity = Decimal(str(p["quantity"]))
                if "unit_price" in p:
                    prod.unit_price = Decimal(str(p["unit_price"]))
                self.db.flush()
                return prod.id
        return op.entity_id or 0

    def get_server_changes(
        self,
        company_id: int = 1,
        since_timestamp: Optional[datetime] = None,
    ) -> List[EntityChange]:
        """
        Retorna todas as alterações ocorridas no servidor desde o timestamp fornecido.
        Sincronização incremental (Pull).
        """
        changes: List[EntityChange] = []

        # 1. Produtos atualizados
        prod_query = self.db.query(Product).filter(Product.company_id == company_id)
        if since_timestamp:
            prod_query = prod_query.filter(Product.updated_at >= since_timestamp)
        
        for prod in prod_query.all():
            changes.append(
                EntityChange(
                    entity="Product",
                    entity_id=prod.id,
                    operation="UPDATE",
                    data={
                        "id": prod.id,
                        "name": prod.name,
                        "sku": prod.sku,
                        "unit_price": float(prod.unit_price),
                        "quantity": float(prod.quantity),
                        "iva_rate": float(prod.iva_rate),
                        "active": prod.active,
                        "category": prod.category,
                    },
                    updated_at=prod.updated_at,
                )
            )

        # 2. Clientes atualizados
        cust_query = self.db.query(Customer).filter(Customer.company_id == company_id)
        if since_timestamp:
            cust_query = cust_query.filter(Customer.updated_at >= since_timestamp)

        for cust in cust_query.all():
            changes.append(
                EntityChange(
                    entity="Customer",
                    entity_id=cust.id,
                    operation="UPDATE",
                    data={
                        "id": cust.id,
                        "name": cust.name,
                        "nuit": cust.nuit,
                        "debt_amount": float(cust.debt_amount),
                        "total_spent": float(cust.total_spent),
                    },
                    updated_at=cust.updated_at,
                )
            )

        return changes
