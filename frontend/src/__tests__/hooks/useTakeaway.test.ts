import { describe, it, expect, beforeEach } from "vitest";
import { useTakeawayStore } from "@/store/takeaway.store";
import { TakeawayOrder } from "@/types/takeaway";

describe("useTakeawayStore", () => {
  beforeEach(() => {
    useTakeawayStore.setState({
      orders: [],
      selectedOrder: null,
      pendingDeliveries: [],
      trackingData: null,
      stats: null,
      activeTab: "queue",
      statusFilter: "all",
      typeFilter: "all",
      searchQuery: "",
      isNewOrderModalOpen: false,
      isAssignModalOpen: false,
      isTrackingModalOpen: false,
      orderForAction: null,
      isLoading: false,
    });
  });

  it("initializes with default state", () => {
    const state = useTakeawayStore.getState();
    expect(state.orders).toHaveLength(0);
    expect(state.selectedOrder).toBeNull();
    expect(state.activeTab).toBe("queue");
    expect(state.statusFilter).toBe("all");
    expect(state.typeFilter).toBe("all");
  });

  it("adds and selects takeaway orders", () => {
    const mockOrder: TakeawayOrder = {
      id: 1,
      company_id: 1,
      order_number: "T-001",
      customer_name: "Armando Guebuza",
      customer_phone: "+258841112233",
      order_type: "takeaway",
      status: "pending",
      subtotal: 1300,
      delivery_fee: 0,
      tax: 208,
      total: 1300,
      payment_method: "mpesa",
      payment_status: "paid",
      estimated_prep_minutes: 25,
      estimated_delivery_minutes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [],
      delivery: null,
    };

    useTakeawayStore.getState().addOrderToState(mockOrder);
    useTakeawayStore.getState().setSelectedOrder(mockOrder);

    const state = useTakeawayStore.getState();
    expect(state.orders).toHaveLength(1);
    expect(state.selectedOrder?.order_number).toBe("T-001");
  });

  it("advances order status and records timestamps", () => {
    const mockOrder: TakeawayOrder = {
      id: 2,
      company_id: 1,
      order_number: "T-002",
      customer_name: "Helena Mondlane",
      customer_phone: "+258823334455",
      order_type: "delivery",
      status: "pending",
      subtotal: 1500,
      delivery_fee: 150,
      tax: 240,
      total: 1650,
      payment_method: "emola",
      payment_status: "paid",
      estimated_prep_minutes: 25,
      estimated_delivery_minutes: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [],
      delivery: null,
    };

    useTakeawayStore.getState().addOrderToState(mockOrder);

    // Transition to ready
    useTakeawayStore.getState().advanceOrderStatusInState(2, "ready");
    let state = useTakeawayStore.getState();
    expect(state.orders[0].status).toBe("ready");
    expect(state.orders[0].ready_at).not.toBeNull();

    // Transition to delivered
    useTakeawayStore.getState().advanceOrderStatusInState(2, "delivered");
    state = useTakeawayStore.getState();
    expect(state.orders[0].status).toBe("delivered");
    expect(state.orders[0].pickup_at).not.toBeNull();
  });

  it("filters orders by type and status", () => {
    useTakeawayStore.getState().setTypeFilter("delivery");
    useTakeawayStore.getState().setStatusFilter("in_transit");

    const state = useTakeawayStore.getState();
    expect(state.typeFilter).toBe("delivery");
    expect(state.statusFilter).toBe("in_transit");
  });
});
