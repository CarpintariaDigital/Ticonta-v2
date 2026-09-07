import { describe, it, expect, beforeEach } from "vitest";
import { useRestaurantStore } from "@/store/restaurant.store";
import { Table, MenuItem, RestaurantOrder, OrderItem } from "@/types/restaurant";

describe("useRestaurantStore", () => {
  beforeEach(() => {
    useRestaurantStore.setState({
      tables: [],
      selectedTable: null,
      menuItems: [],
      activeCategory: "all",
      currentOrder: null,
      orders: [],
      kdsItems: [],
      kdsStats: { totalPending: 0, totalPreparing: 0, totalReady: 0, averageWaitTime: 0 },
      billData: null,
      splitData: null,
      reports: null,
      settings: null,
      activeView: "map",
      filterLocation: "all",
      searchQuery: "",
      isLoading: false,
    });
  });

  it("initializes with default state", () => {
    const state = useRestaurantStore.getState();
    expect(state.tables).toHaveLength(0);
    expect(state.selectedTable).toBeNull();
    expect(state.activeView).toBe("map");
    expect(state.filterLocation).toBe("all");
  });

  it("manages tables and updates selected table state", () => {
    const mockTables: Table[] = [
      { id: 1, company_id: 1, table_number: "01", capacity: 4, status: "available", location: "indoor", active: true, created_at: "", updated_at: "" },
      { id: 2, company_id: 1, table_number: "02", capacity: 2, status: "occupied", location: "outdoor", active: true, created_at: "", updated_at: "" },
    ];

    useRestaurantStore.getState().setTables(mockTables);
    useRestaurantStore.getState().setSelectedTable(mockTables[0]);

    let state = useRestaurantStore.getState();
    expect(state.tables).toHaveLength(2);
    expect(state.selectedTable?.table_number).toBe("01");

    // Update table status in state
    useRestaurantStore.getState().updateTableInState(1, { status: "occupied" });
    state = useRestaurantStore.getState();
    expect(state.tables[0].status).toBe("occupied");
    expect(state.selectedTable?.status).toBe("occupied");
  });

  it("adds order items and recalculates order financial totals", () => {
    const initialOrder: RestaurantOrder = {
      id: 10,
      company_id: 1,
      order_number: "R-001",
      table_id: 1,
      guest_count: 2,
      status: "open",
      opened_at: new Date().toISOString(),
      subtotal: 0,
      tax: 0,
      service_charge: 0,
      total: 0,
      amount_paid: 0,
      items: [],
      splits: [],
    };

    useRestaurantStore.getState().setCurrentOrder(initialOrder);

    const newItem: OrderItem = {
      id: 101,
      order_id: 10,
      menu_item_id: 5,
      menu_item_name: "Matapa com Camarão",
      quantity: 2,
      unit_price: 650,
      subtotal: 1300,
      special_requests: "Extra spicy",
      preparation_status: "pending",
      created_at: new Date().toISOString(),
    };

    useRestaurantStore.getState().addOrderItemToState(newItem);

    const order = useRestaurantStore.getState().currentOrder;
    expect(order).not.toBeNull();
    expect(order?.items).toHaveLength(1);
    expect(order?.subtotal).toBe(1300);
    expect(order?.tax).toBe(208); // 16% IVA of 1300
    expect(order?.service_charge).toBe(130); // 10% of 1300
    expect(order?.total).toBe(1638);
  });

  it("manages KDS ticket status transitions", () => {
    useRestaurantStore.getState().setKDSItems([
      {
        order_item_id: 201,
        order_id: 10,
        order_number: "R-001",
        menu_item_id: 1,
        menu_item_name: "Frango Peri-Peri",
        category: "mains",
        quantity: 1,
        preparation_status: "pending",
        elapsed_minutes: 3,
        urgency_color: "green",
        created_at: new Date().toISOString(),
      },
    ]);

    expect(useRestaurantStore.getState().kdsItems[0].preparation_status).toBe("pending");

    useRestaurantStore.getState().updateKDSItemInState(201, {
      preparation_status: "ready",
      urgency_color: "yellow",
    });

    const updated = useRestaurantStore.getState().kdsItems[0];
    expect(updated.preparation_status).toBe("ready");
    expect(updated.urgency_color).toBe("yellow");
  });
});
