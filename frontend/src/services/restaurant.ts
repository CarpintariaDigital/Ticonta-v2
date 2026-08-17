import { apiClient } from "@/services/auth";
import {
  Table,
  MenuItem,
  RestaurantOrder,
  OrderItem,
  KitchenDisplayResponse,
  TableBillResponse,
  SplitBillResponse,
  CloseTableResponse,
  RestaurantReportsResponse,
  RestaurantSettings,
  TableStatus,
} from "@/types/restaurant";

const API_WS_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  .replace("http://", "ws://")
  .replace("https://", "wss://");

export const restaurantService = {
  // ==========================================
  // Tables
  // ==========================================
  async getTables(params?: { company_id?: number; status?: string; location?: string }): Promise<Table[]> {
    const response = await apiClient.get<Table[]>("/api/v1/restaurant/tables", { params });
    return response.data;
  },

  async getTable(id: number, company_id = 1): Promise<Table> {
    const response = await apiClient.get<Table>(`/api/v1/restaurant/tables/${id}`, {
      params: { company_id },
    });
    return response.data;
  },

  async createTable(data: { table_number: string; capacity: number; location: string; company_id?: number }): Promise<Table> {
    const response = await apiClient.post<Table>("/api/v1/restaurant/tables", data, {
      params: { company_id: data.company_id || 1 },
    });
    return response.data;
  },

  async updateTable(id: number, data: Partial<Table>, company_id = 1): Promise<Table> {
    const response = await apiClient.put<Table>(`/api/v1/restaurant/tables/${id}`, data, {
      params: { company_id },
    });
    return response.data;
  },

  async updateTableStatus(id: number, status: TableStatus, company_id = 1): Promise<Table> {
    const response = await apiClient.put<Table>(`/api/v1/restaurant/tables/${id}/status`, { status }, {
      params: { company_id },
    });
    return response.data;
  },

  async reserveTable(
    id: number,
    data: { guest_count: number; reservation_time: string; customer_name: string; customer_phone?: string },
    company_id = 1
  ): Promise<Table> {
    const response = await apiClient.post<Table>(`/api/v1/restaurant/tables/${id}/reserve`, data, {
      params: { company_id },
    });
    return response.data;
  },

  async releaseExpiredReservations(graceMinutes = 30, company_id = 1): Promise<{ released_tables_count: number; message: string }> {
    const response = await apiClient.post<{ released_tables_count: number; message: string }>(
      "/api/v1/restaurant/tables/release-expired-reservations",
      null,
      { params: { grace_minutes: graceMinutes, company_id } }
    );
    return response.data;
  },

  // ==========================================
  // Menu Items
  // ==========================================
  async getMenu(params?: { company_id?: number; category?: string; available_only?: boolean }): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>("/api/v1/restaurant/menu", { params });
    return response.data;
  },

  async getMenuItem(id: number, company_id = 1): Promise<MenuItem> {
    const response = await apiClient.get<MenuItem>(`/api/v1/restaurant/menu/${id}`, {
      params: { company_id },
    });
    return response.data;
  },

  async createMenuItem(data: Partial<MenuItem> & { name: string; price: number; category: string }): Promise<MenuItem> {
    const response = await apiClient.post<MenuItem>("/api/v1/restaurant/menu", data, {
      params: { company_id: data.company_id || 1 },
    });
    return response.data;
  },

  async updateMenuItem(id: number, data: Partial<MenuItem>, company_id = 1): Promise<MenuItem> {
    const response = await apiClient.put<MenuItem>(`/api/v1/restaurant/menu/${id}`, data, {
      params: { company_id },
    });
    return response.data;
  },

  // ==========================================
  // Orders
  // ==========================================
  async getOrders(params?: { company_id?: number; status?: string; table_id?: number }): Promise<RestaurantOrder[]> {
    const response = await apiClient.get<RestaurantOrder[]>("/api/v1/restaurant/orders", { params });
    return response.data;
  },

  async getOrder(id: number, company_id = 1): Promise<RestaurantOrder> {
    const response = await apiClient.get<RestaurantOrder>(`/api/v1/restaurant/orders/${id}`, {
      params: { company_id },
    });
    return response.data;
  },

  async createOrder(data: {
    table_id?: number | null;
    guest_count?: number;
    waiter_id?: number | null;
    notes?: string | null;
    company_id?: number;
  }): Promise<RestaurantOrder> {
    const response = await apiClient.post<RestaurantOrder>("/api/v1/restaurant/orders", data, {
      params: { company_id: data.company_id || 1 },
    });
    return response.data;
  },

  async addItemToOrder(
    orderId: number,
    data: { menu_item_id: number; quantity: number; special_requests?: string | null },
    company_id = 1
  ): Promise<OrderItem> {
    const response = await apiClient.post<OrderItem>(`/api/v1/restaurant/orders/${orderId}/items`, data, {
      params: { company_id },
    });
    return response.data;
  },

  async updateItemStatus(itemId: number, status: string, company_id = 1): Promise<OrderItem> {
    const response = await apiClient.put<OrderItem>(`/api/v1/restaurant/order-items/${itemId}/status`, { status }, {
      params: { company_id },
    });
    return response.data;
  },

  // ==========================================
  // Kitchen Display System (KDS)
  // ==========================================
  async getKitchenDisplay(company_id = 1): Promise<KitchenDisplayResponse> {
    const response = await apiClient.get<KitchenDisplayResponse>("/api/v1/restaurant/kitchen-display", {
      params: { company_id },
    });
    return response.data;
  },

  // ==========================================
  // Bill & Split Bill & Closure
  // ==========================================
  async getTableBill(orderId: number, company_id = 1): Promise<TableBillResponse> {
    const response = await apiClient.get<TableBillResponse>(`/api/v1/restaurant/orders/${orderId}/bill`, {
      params: { company_id },
    });
    return response.data;
  },

  async splitBill(
    orderId: number,
    data: { num_bills?: number; custom_splits?: Array<{ guest_name?: string; amount: number; payment_method?: string }> },
    company_id = 1
  ): Promise<SplitBillResponse> {
    const response = await apiClient.post<SplitBillResponse>(`/api/v1/restaurant/orders/${orderId}/split-bill`, data, {
      params: { company_id },
    });
    return response.data;
  },

  async closeTable(
    orderId: number,
    data: { payment_method: string; amount_paid?: number; notes?: string; auto_clean?: boolean },
    company_id = 1
  ): Promise<CloseTableResponse> {
    const response = await apiClient.post<CloseTableResponse>(`/api/v1/restaurant/orders/${orderId}/close`, data, {
      params: { company_id },
    });
    return response.data;
  },

  // ==========================================
  // Reports & Analytics
  // ==========================================
  async getReports(params?: { company_id?: number; start_date?: string; end_date?: string }): Promise<RestaurantReportsResponse> {
    const response = await apiClient.get<RestaurantReportsResponse>("/api/v1/restaurant/reports", { params });
    return response.data;
  },

  // ==========================================
  // Settings
  // ==========================================
  async getSettings(company_id = 1): Promise<RestaurantSettings> {
    const response = await apiClient.get<RestaurantSettings>("/api/v1/restaurant/settings", {
      params: { company_id },
    });
    return response.data;
  },

  async updateSettings(data: Partial<RestaurantSettings>, company_id = 1): Promise<RestaurantSettings> {
    const response = await apiClient.put<RestaurantSettings>("/api/v1/restaurant/settings", data, {
      params: { company_id },
    });
    return response.data;
  },

  // ==========================================
  // WebSocket Connection for Real-time KDS & Floor
  // ==========================================
  connectKDSWebSocket(
    company_id = 1,
    role = "kitchen",
    onMessage?: (eventData: { event: string; data: any }) => void,
    onError?: (err: Event) => void,
    onClose?: () => void
  ): { socket: WebSocket | null; disconnect: () => void } {
    if (typeof window === "undefined") {
      return { socket: null, disconnect: () => {} };
    }

    try {
      const wsUrl = `${API_WS_URL}/api/v1/restaurant/ws/kds?company_id=${company_id}&role=${role}`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        // Send initial heartbeat ping
        socket.send(JSON.stringify({ type: "ping" }));
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (onMessage) {
            onMessage(parsed);
          }
        } catch (e) {
          // non-json message
        }
      };

      socket.onerror = (err) => {
        if (onError) onError(err);
      };

      socket.onclose = () => {
        if (onClose) onClose();
      };

      return {
        socket,
        disconnect: () => {
          if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            socket.close();
          }
        },
      };
    } catch (e) {
      return { socket: null, disconnect: () => {} };
    }
  },
};
