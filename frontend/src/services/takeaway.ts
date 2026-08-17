import { apiClient as api } from "@/services/auth";
import {
  TakeawayOrder,
  TakeawayOrderCreate,
  DeliveryAssignRequest,
  DeliveryStatusUpdateRequest,
  OrderStatusUpdateRequest,
  OrderTrackingResponse,
  TakeawayStatsResponse,
} from "@/types/takeaway";

const API_PREFIX = "/api/v1/takeaway";

// Mock Fallback dataset for offline / testing mode
const MOCK_TAKEAWAY_ORDERS: TakeawayOrder[] = [
  {
    id: 1,
    company_id: 1,
    order_number: "T-001",
    customer_name: "Armando Guebuza",
    customer_phone: "+258841112233",
    order_type: "takeaway",
    status: "ready",
    delivery_address: null,
    delivery_time: null,
    special_instructions: "Embalar molho à parte",
    subtotal: 1300,
    delivery_fee: 0,
    tax: 208,
    total: 1300,
    payment_method: "mpesa",
    payment_status: "paid",
    estimated_prep_minutes: 25,
    estimated_delivery_minutes: 0,
    estimated_ready_at: new Date(Date.now() - 5 * 60000).toISOString(),
    ready_at: new Date(Date.now() - 3 * 60000).toISOString(),
    pickup_at: null,
    created_at: new Date(Date.now() - 28 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 101,
        takeaway_order_id: 1,
        menu_item_id: 1,
        item_name: "Frango Zambeziano",
        quantity: 2,
        unit_price: 650,
        subtotal: 1300,
        special_requests: "Embalar molho à parte",
        preparation_status: "ready",
        created_at: new Date().toISOString(),
      },
    ],
    delivery: null,
  },
  {
    id: 2,
    company_id: 1,
    order_number: "T-002",
    customer_name: "Helena Mondlane",
    customer_phone: "+258823334455",
    order_type: "delivery",
    status: "in_transit",
    delivery_address: "Av. Julius Nyerere, Edifício Platinum, 4º Andar, Maputo",
    delivery_time: null,
    special_instructions: "Tocar interfone 4B",
    subtotal: 1500,
    delivery_fee: 150,
    tax: 240,
    total: 1650,
    payment_method: "emola",
    payment_status: "paid",
    estimated_prep_minutes: 25,
    estimated_delivery_minutes: 15,
    estimated_ready_at: new Date(Date.now() - 10 * 60000).toISOString(),
    ready_at: new Date(Date.now() - 8 * 60000).toISOString(),
    pickup_at: null,
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 102,
        takeaway_order_id: 2,
        menu_item_id: 2,
        item_name: "Matapa com Camarão",
        quantity: 2,
        unit_price: 750,
        subtotal: 1500,
        special_requests: "Com pouco sal",
        preparation_status: "ready",
        created_at: new Date().toISOString(),
      },
    ],
    delivery: {
      id: 201,
      company_id: 1,
      order_id: 2,
      delivery_person_id: 5,
      delivery_person_name: "Rider Carlos Sitoe",
      delivery_person_phone: "+258849998877",
      delivery_address: "Av. Julius Nyerere, Edifício Platinum, 4º Andar, Maputo",
      delivery_phone: "+258823334455",
      estimated_delivery_time: new Date(Date.now() + 7 * 60000).toISOString(),
      actual_delivery_time: null,
      delivery_fee: 150,
      delivery_status: "in_transit",
      tracking_code: "TC-8F2B1A",
      notes: "Tocar interfone 4B",
      created_at: new Date(Date.now() - 35 * 60000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 3,
    company_id: 1,
    order_number: "T-003",
    customer_name: "Dr. João Machava",
    customer_phone: "+258840007788",
    order_type: "delivery",
    status: "preparing",
    delivery_address: "Bairro Sommerschield, Rua do Rio Raraga",
    delivery_time: null,
    special_instructions: "Sem cebola",
    subtotal: 800,
    delivery_fee: 150,
    tax: 128,
    total: 950,
    payment_method: "mpesa",
    payment_status: "paid",
    estimated_prep_minutes: 20,
    estimated_delivery_minutes: 15,
    estimated_ready_at: new Date(Date.now() + 10 * 60000).toISOString(),
    ready_at: null,
    pickup_at: null,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 103,
        takeaway_order_id: 3,
        menu_item_id: 3,
        item_name: "Caril de Peixe da Costa",
        quantity: 1,
        unit_price: 800,
        subtotal: 800,
        special_requests: "Sem cebola",
        preparation_status: "preparing",
        created_at: new Date().toISOString(),
      },
    ],
    delivery: {
      id: 202,
      company_id: 1,
      order_id: 3,
      delivery_person_id: null,
      delivery_person_name: null,
      delivery_person_phone: null,
      delivery_address: "Bairro Sommerschield, Rua do Rio Raraga",
      delivery_phone: "+258840007788",
      estimated_delivery_time: new Date(Date.now() + 25 * 60000).toISOString(),
      actual_delivery_time: null,
      delivery_fee: 150,
      delivery_status: "pending",
      tracking_code: "TC-9A3C4D",
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

class TakeawayService {
  /**
   * Criar novo pedido de Takeaway ou Delivery
   */
  async createOrder(data: TakeawayOrderCreate, companyId = 1): Promise<TakeawayOrder> {
    try {
      const response = await api.post<TakeawayOrder>(`${API_PREFIX}/orders`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const subtotal = data.items.reduce((acc, it) => acc + it.quantity * it.unit_price, 0);
      const deliveryFee = data.order_type === "delivery" ? data.delivery_fee || 150 : 0;
      const orderId = Date.now();
      const orderNum = `T-${String(MOCK_TAKEAWAY_ORDERS.length + 1).padStart(3, "0")}`;

      const newOrder: TakeawayOrder = {
        id: orderId,
        company_id: companyId,
        order_number: orderNum,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        order_type: data.order_type,
        status: "pending",
        delivery_address: data.delivery_address || null,
        delivery_time: data.delivery_time || null,
        special_instructions: data.special_instructions || null,
        subtotal,
        delivery_fee: deliveryFee,
        tax: subtotal * 0.16,
        total: subtotal + deliveryFee,
        payment_method: data.payment_method || "mpesa",
        payment_status: data.payment_status || "pending",
        estimated_prep_minutes: 25,
        estimated_delivery_minutes: data.order_type === "delivery" ? 15 : 0,
        estimated_ready_at: new Date(Date.now() + 25 * 60000).toISOString(),
        ready_at: null,
        pickup_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: data.items.map((it, idx) => ({
          id: orderId + idx + 1,
          takeaway_order_id: orderId,
          menu_item_id: it.menu_item_id || null,
          item_name: it.item_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          subtotal: it.quantity * it.unit_price,
          special_requests: it.special_requests || null,
          preparation_status: "pending",
          created_at: new Date().toISOString(),
        })),
        delivery:
          data.order_type === "delivery"
            ? {
                id: orderId + 10,
                company_id: companyId,
                order_id: orderId,
                delivery_person_id: null,
                delivery_person_name: null,
                delivery_person_phone: null,
                delivery_address: data.delivery_address || "",
                delivery_phone: data.customer_phone,
                estimated_delivery_time: new Date(Date.now() + 40 * 60000).toISOString(),
                actual_delivery_time: null,
                delivery_fee: deliveryFee,
                delivery_status: "pending",
                tracking_code: `TC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                notes: data.special_instructions || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : null,
      };

      MOCK_TAKEAWAY_ORDERS.unshift(newOrder);
      return newOrder;
    }
  }

  /**
   * Listar todos os pedidos com filtros
   */
  async getOrders(
    companyId = 1,
    statusFilter?: string,
    orderType?: string,
    search?: string
  ): Promise<TakeawayOrder[]> {
    try {
      const response = await api.get<TakeawayOrder[]>(`${API_PREFIX}/orders`, {
        params: {
          company_id: companyId,
          status: statusFilter,
          order_type: orderType,
          search,
        },
      });
      return response.data;
    } catch {
      let list = [...MOCK_TAKEAWAY_ORDERS];
      if (statusFilter) list = list.filter((o) => o.status === statusFilter);
      if (orderType) list = list.filter((o) => o.order_type === orderType);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (o) =>
            o.order_number.toLowerCase().includes(q) ||
            o.customer_name.toLowerCase().includes(q) ||
            o.customer_phone.includes(q)
        );
      }
      return list;
    }
  }

  /**
   * Obter detalhes de um pedido
   */
  async getOrder(orderId: number, companyId = 1): Promise<TakeawayOrder> {
    try {
      const response = await api.get<TakeawayOrder>(`${API_PREFIX}/orders/${orderId}`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const found = MOCK_TAKEAWAY_ORDERS.find((o) => o.id === orderId);
      if (!found) throw new Error("Pedido não encontrado");
      return found;
    }
  }

  /**
   * Atualizar status do pedido (pending → preparing → ready → delivered/picked_up)
   */
  async updateOrderStatus(orderId: number, data: OrderStatusUpdateRequest, companyId = 1): Promise<TakeawayOrder> {
    try {
      const response = await api.put<TakeawayOrder>(`${API_PREFIX}/orders/${orderId}/status`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const order = MOCK_TAKEAWAY_ORDERS.find((o) => o.id === orderId);
      if (!order) throw new Error("Pedido não encontrado");
      order.status = data.status;
      if (data.status === "ready") order.ready_at = new Date().toISOString();
      if (data.status === "delivered" || data.status === "picked_up") order.pickup_at = new Date().toISOString();
      if (order.delivery) {
        if (data.status === "delivered") order.delivery.delivery_status = "delivered";
        if (data.status === "in_transit") order.delivery.delivery_status = "in_transit";
      }
      return order;
    }
  }

  /**
   * Atribuir estafeta à entrega
   */
  async assignDelivery(orderId: number, data: DeliveryAssignRequest, companyId = 1): Promise<TakeawayOrder> {
    try {
      const response = await api.post<TakeawayOrder>(`${API_PREFIX}/orders/${orderId}/delivery/assign`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const order = MOCK_TAKEAWAY_ORDERS.find((o) => o.id === orderId);
      if (!order || !order.delivery) throw new Error("Pedido de entrega não encontrado");
      order.delivery.delivery_person_name = data.delivery_person_name;
      order.delivery.delivery_person_phone = data.delivery_person_phone || null;
      order.delivery.delivery_status = "assigned";
      order.status = "in_transit";
      return order;
    }
  }

  /**
   * Atualizar status da entrega
   */
  async updateDeliveryStatus(orderId: number, data: DeliveryStatusUpdateRequest, companyId = 1): Promise<TakeawayOrder> {
    try {
      const response = await api.put<TakeawayOrder>(`${API_PREFIX}/orders/${orderId}/delivery/status`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const order = MOCK_TAKEAWAY_ORDERS.find((o) => o.id === orderId);
      if (!order || !order.delivery) throw new Error("Entrega não encontrada");
      order.delivery.delivery_status = data.delivery_status;
      if (data.delivery_status === "delivered") {
        order.status = "delivered";
        order.pickup_at = new Date().toISOString();
      }
      return order;
    }
  }

  /**
   * Rastreio público em tempo real
   */
  async trackOrder(orderIdOrCode: string, companyId = 1): Promise<OrderTrackingResponse> {
    try {
      const endpoint = orderIdOrCode.startsWith("TC-")
        ? `${API_PREFIX}/track/${orderIdOrCode}`
        : `${API_PREFIX}/orders/${orderIdOrCode}/track`;
      const response = await api.get<OrderTrackingResponse>(endpoint, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const order =
        MOCK_TAKEAWAY_ORDERS.find((o) => String(o.id) === orderIdOrCode) ||
        MOCK_TAKEAWAY_ORDERS.find((o) => o.delivery?.tracking_code === orderIdOrCode) ||
        MOCK_TAKEAWAY_ORDERS[1];

      return {
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        order_type: order.order_type,
        current_status: order.status,
        tracking_code: order.delivery?.tracking_code || null,
        estimated_ready_time: order.estimated_ready_at,
        estimated_delivery_time: order.delivery?.estimated_delivery_time || null,
        total_estimated_minutes: order.estimated_prep_minutes + order.estimated_delivery_minutes,
        delivery_person_name: order.delivery?.delivery_person_name || null,
        delivery_person_phone: order.delivery?.delivery_person_phone || null,
        delivery_address: order.delivery_address || null,
        steps: [
          { step_number: 1, label: "Pedido Confirmado", status: "completed", timestamp: order.created_at },
          {
            step_number: 2,
            label: "Em Preparo na Cozinha",
            status: order.status === "pending" ? "upcoming" : "completed",
            timestamp: order.created_at,
          },
          {
            step_number: 3,
            label: order.order_type === "delivery" ? "Saiu para Entrega (Estafeta)" : "Pronto para Levantamento",
            status: order.status === "in_transit" || order.status === "ready" ? "current" : order.status === "delivered" ? "completed" : "upcoming",
            timestamp: order.ready_at,
          },
          {
            step_number: 4,
            label: order.order_type === "delivery" ? "Entregue com Sucesso" : "Pedido Levantado",
            status: order.status === "delivered" || order.status === "picked_up" ? "completed" : "upcoming",
            timestamp: order.pickup_at,
          },
        ],
        items_summary: order.items.map((i) => `${i.quantity}x ${i.item_name}`),
        total_amount: order.total,
      };
    }
  }

  /**
   * Fila de entregas ativas e pendentes
   */
  async getPendingDeliveries(companyId = 1): Promise<TakeawayOrder[]> {
    try {
      const response = await api.get<TakeawayOrder[]>(`${API_PREFIX}/pending-deliveries`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      return MOCK_TAKEAWAY_ORDERS.filter((o) => o.order_type === "delivery" && o.status !== "delivered");
    }
  }

  /**
   * Estatísticas diárias
   */
  async getStats(companyId = 1): Promise<TakeawayStatsResponse> {
    try {
      const response = await api.get<TakeawayStatsResponse>(`${API_PREFIX}/stats`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      return {
        company_id: companyId,
        total_orders_today: MOCK_TAKEAWAY_ORDERS.length,
        takeaway_count: MOCK_TAKEAWAY_ORDERS.filter((o) => o.order_type === "takeaway").length,
        delivery_count: MOCK_TAKEAWAY_ORDERS.filter((o) => o.order_type === "delivery").length,
        pending_count: MOCK_TAKEAWAY_ORDERS.filter((o) => o.status === "pending").length,
        preparing_count: MOCK_TAKEAWAY_ORDERS.filter((o) => o.status === "preparing").length,
        ready_count: MOCK_TAKEAWAY_ORDERS.filter((o) => o.status === "ready").length,
        in_transit_count: MOCK_TAKEAWAY_ORDERS.filter((o) => o.status === "in_transit").length,
        completed_today: MOCK_TAKEAWAY_ORDERS.filter((o) => o.status === "delivered" || o.status === "picked_up").length,
        total_revenue_today: MOCK_TAKEAWAY_ORDERS.reduce((acc, o) => acc + o.total, 0),
        average_prep_time_minutes: 25,
      };
    }
  }
}

export const takeawayService = new TakeawayService();
