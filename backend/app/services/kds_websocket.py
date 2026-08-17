import asyncio
import json
import logging
from typing import Dict, List, Set, Any, Optional
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class KDSConnectionManager:
    """
    Real-time WebSocket Manager for Restaurant KDS (Kitchen Display System),
    POS terminals, Waiter tablets, and Table Floor management.
    """

    def __init__(self):
        # Maps company_id to set of active WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Client metadata mapping (e.g. role: 'kitchen', 'floor', 'cashier')
        self.connection_roles: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, company_id: int = 1, role: str = "kitchen"):
        await websocket.accept()
        if company_id not in self.active_connections:
            self.active_connections[company_id] = set()
        self.active_connections[company_id].add(websocket)
        self.connection_roles[websocket] = role
        logger.info(f"WebSocket client connected to company {company_id} with role '{role}'. Total: {len(self.active_connections[company_id])}")

    def disconnect(self, websocket: WebSocket, company_id: int = 1):
        if company_id in self.active_connections:
            self.active_connections[company_id].discard(websocket)
            if not self.active_connections[company_id]:
                del self.active_connections[company_id]
        if websocket in self.connection_roles:
            del self.connection_roles[websocket]
        logger.info(f"WebSocket client disconnected from company {company_id}.")

    async def broadcast_to_company(self, company_id: int, message: Dict[str, Any]):
        """Broadcast message to all connected clients of a company."""
        if company_id not in self.active_connections:
            return

        dead_connections = set()
        payload = json.dumps(message, default=str)

        for connection in list(self.active_connections[company_id]):
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Failed to send WS message: {e}")
                dead_connections.add(connection)

        for dead in dead_connections:
            self.disconnect(dead, company_id)

    async def notify_new_order_item(self, company_id: int, item_data: Dict[str, Any]):
        """Triggered when a new item is sent to the kitchen."""
        await self.broadcast_to_company(
            company_id,
            {
                "event": "new_order_item",
                "data": item_data
            }
        )

    async def notify_item_status_changed(self, company_id: int, item_data: Dict[str, Any]):
        """Triggered when kitchen updates item status (e.g. pending -> preparing -> ready -> served)."""
        await self.broadcast_to_company(
            company_id,
            {
                "event": "item_status_changed",
                "data": item_data
            }
        )

    async def notify_table_status_changed(self, company_id: int, table_data: Dict[str, Any]):
        """Triggered when table status updates (available, occupied, dirty, reserved)."""
        await self.broadcast_to_company(
            company_id,
            {
                "event": "table_status_changed",
                "data": table_data
            }
        )

    async def notify_table_closed(self, company_id: int, order_data: Dict[str, Any]):
        """Triggered when an order is paid and table needs cleaning."""
        await self.broadcast_to_company(
            company_id,
            {
                "event": "table_closed",
                "data": order_data
            }
        )


# Global singleton instance
kds_manager = KDSConnectionManager()
