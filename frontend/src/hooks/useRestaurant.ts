"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRestaurantStore, RestaurantView } from "@/store/restaurant.store";
import { restaurantService } from "@/services/restaurant";
import {
  Table,
  MenuItem,
  MenuCategory,
  TableLocation,
  TableStatus,
  PaymentMethod,
} from "@/types/restaurant";

export function useRestaurant() {
  const store = useRestaurantStore();
  const wsRef = useRef<{ socket: WebSocket | null; disconnect: () => void } | null>(null);

  // ==========================================
  // Fetching methods
  // ==========================================
  const fetchTables = useCallback(async (companyId = 1) => {
    store.setIsLoading(true);
    try {
      const data = await restaurantService.getTables({ company_id: companyId });
      store.setTables(data);
    } catch (err) {
      // Fallback mock tables for offline or server startup
      if (store.tables.length === 0) {
        store.setTables(defaultMockTables);
      }
    } finally {
      store.setIsLoading(false);
    }
  }, [store]);

  const fetchMenu = useCallback(async (companyId = 1) => {
    try {
      const data = await restaurantService.getMenu({ company_id: companyId });
      store.setMenuItems(data);
    } catch (err) {
      if (store.menuItems.length === 0) {
        store.setMenuItems(defaultMockMenu);
      }
    }
  }, [store]);

  const fetchOrders = useCallback(async (companyId = 1) => {
    try {
      const data = await restaurantService.getOrders({ company_id: companyId });
      store.setOrders(data);
    } catch (err) {
      // ignore
    }
  }, [store]);

  const fetchKDS = useCallback(async (companyId = 1) => {
    try {
      const res = await restaurantService.getKitchenDisplay(companyId);
      store.setKDSItems(res.items);
      store.setKDSStats({
        totalPending: res.total_pending,
        totalPreparing: res.total_preparing,
        totalReady: res.total_ready,
        averageWaitTime: res.average_wait_time_minutes,
      });
    } catch (err) {
      // ignore
    }
  }, [store]);

  const fetchBill = useCallback(async (orderId: number, companyId = 1) => {
    try {
      const bill = await restaurantService.getTableBill(orderId, companyId);
      store.setBillData(bill);
      return bill;
    } catch (err) {
      return null;
    }
  }, [store]);

  const fetchReports = useCallback(async (companyId = 1, startDate?: string, endDate?: string) => {
    try {
      const data = await restaurantService.getReports({ company_id: companyId, start_date: startDate, end_date: endDate });
      store.setReports(data);
      return data;
    } catch (err) {
      return null;
    }
  }, [store]);

  const fetchSettings = useCallback(async (companyId = 1) => {
    try {
      const data = await restaurantService.getSettings(companyId);
      store.setSettings(data);
      return data;
    } catch (err) {
      return null;
    }
  }, [store]);

  // ==========================================
  // Table Selection & Order Loading
  // ==========================================
  const selectTable = useCallback(async (table: Table | null) => {
    store.setSelectedTable(table);
    if (!table) {
      store.setCurrentOrder(null);
      return;
    }

    // Try to find open order for this table
    try {
      const orders = await restaurantService.getOrders({ table_id: table.id, status: "open" });
      if (orders && orders.length > 0) {
        const fullOrder = await restaurantService.getOrder(orders[0].id);
        store.setCurrentOrder(fullOrder);
      } else {
        store.setCurrentOrder(null);
      }
    } catch (e) {
      // local search fallback
      const found = store.orders.find((o) => o.table_id === table.id && o.status === "open");
      store.setCurrentOrder(found || null);
    }
  }, [store]);

  // ==========================================
  // Order Operations
  // ==========================================
  const createOrder = useCallback(async (tableId?: number | null, guestCount = 2, notes?: string) => {
    store.setIsLoading(true);
    try {
      const newOrder = await restaurantService.createOrder({
        table_id: tableId,
        guest_count: guestCount,
        notes,
      });
      store.setCurrentOrder(newOrder);
      if (tableId) {
        store.updateTableInState(tableId, { status: "occupied" });
      }
      await fetchTables();
      return newOrder;
    } finally {
      store.setIsLoading(false);
    }
  }, [store, fetchTables]);

  const addItemToOrder = useCallback(async (orderId: number, menuItemId: number, quantity = 1, specialRequests?: string | null) => {
    const item = await restaurantService.addItemToOrder(orderId, {
      menu_item_id: menuItemId,
      quantity,
      special_requests: specialRequests,
    });
    store.addOrderItemToState(item);
    // Refresh KDS and full order
    const fullOrder = await restaurantService.getOrder(orderId);
    store.setCurrentOrder(fullOrder);
    fetchKDS();
    return item;
  }, [store, fetchKDS]);

  const updateItemStatus = useCallback(async (orderItemId: number, newStatus: string) => {
    const updated = await restaurantService.updateItemStatus(orderItemId, newStatus);
    store.updateKDSItemInState(orderItemId, { preparation_status: newStatus as any });
    if (store.currentOrder) {
      const fullOrder = await restaurantService.getOrder(store.currentOrder.id);
      store.setCurrentOrder(fullOrder);
    }
    fetchKDS();
    return updated;
  }, [store, fetchKDS]);

  const closeTable = useCallback(async (orderId: number, paymentMethod: PaymentMethod | string, amountPaid?: number, notes?: string, autoClean?: boolean) => {
    store.setIsLoading(true);
    try {
      const res = await restaurantService.closeTable(orderId, {
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        notes,
        auto_clean: autoClean,
      });
      if (store.selectedTable) {
        store.updateTableInState(store.selectedTable.id, {
          status: (res.table_status as any) || "dirty",
        });
      }
      store.setCurrentOrder(null);
      store.setIsBillModalOpen(false);
      await fetchTables();
      await fetchKDS();
      return res;
    } finally {
      store.setIsLoading(false);
    }
  }, [store, fetchTables, fetchKDS]);

  const splitBill = useCallback(async (orderId: number, numBills?: number, customSplits?: any[]) => {
    const res = await restaurantService.splitBill(orderId, {
      num_bills: numBills,
      custom_splits: customSplits,
    });
    store.setSplitData(res);
    return res;
  }, [store]);

  const reserveTable = useCallback(async (tableId: number, data: { guest_count: number; reservation_time: string; customer_name: string; customer_phone?: string }) => {
    const res = await restaurantService.reserveTable(tableId, data);
    store.updateTableInState(tableId, {
      status: "reserved",
      reserved_for: data.customer_name,
      reserved_contact: data.customer_phone,
      reservation_time: data.reservation_time,
    });
    store.setIsReservationModalOpen(false);
    return res;
  }, [store]);

  const updateTableStatus = useCallback(async (tableId: number, status: TableStatus) => {
    const res = await restaurantService.updateTableStatus(tableId, status);
    store.updateTableInState(tableId, { status });
    return res;
  }, [store]);

  const updateSettings = useCallback(async (data: Partial<import("@/types/restaurant").RestaurantSettings>, companyId = 1) => {
    const res = await restaurantService.updateSettings(data, companyId);
    store.setSettings(res);
    return res;
  }, [store]);

  // ==========================================
  // Real-time WebSocket Subscription
  // ==========================================
  useEffect(() => {
    const handleWSMessage = (payload: { event: string; data: any }) => {
      const { event, data } = payload;
      if (event === "table_status_changed" && data.table_id) {
        store.updateTableInState(data.table_id, { status: data.status });
      } else if (event === "new_order_item" || event === "item_status_changed") {
        fetchKDS();
        if (store.currentOrder && store.currentOrder.id === data.order_id) {
          restaurantService.getOrder(data.order_id).then((ord) => store.setCurrentOrder(ord));
        }
      } else if (event === "table_closed") {
        fetchTables();
        fetchKDS();
      }
    };

    const ws = restaurantService.connectKDSWebSocket(
      1,
      "floor",
      handleWSMessage,
      () => store.setWsConnected(false),
      () => store.setWsConnected(false)
    );

    wsRef.current = ws;
    if (ws.socket) {
      ws.socket.onopen = () => store.setWsConnected(true);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [fetchKDS, fetchTables, store]);

  // Initial load
  useEffect(() => {
    fetchTables();
    fetchMenu();
    fetchKDS();
    fetchSettings();
  }, [fetchTables, fetchMenu, fetchKDS, fetchSettings]);

  return {
    ...store,
    fetchTables,
    fetchMenu,
    fetchOrders,
    fetchKDS,
    fetchBill,
    fetchReports,
    fetchSettings,
    updateSettings,
    selectTable,
    createOrder,
    addItemToOrder,
    updateItemStatus,
    closeTable,
    splitBill,
    reserveTable,
    updateTableStatus,
  };
}

// Fallback initial demo datasets for immediate WOW aesthetic & offline capability
const defaultMockTables: Table[] = [
  { id: 1, company_id: 1, table_number: "01", capacity: 2, status: "available", location: "indoor", active: true, created_at: "", updated_at: "" },
  { id: 2, company_id: 1, table_number: "02", capacity: 4, status: "occupied", location: "indoor", active: true, created_at: "", updated_at: "" },
  { id: 3, company_id: 1, table_number: "03", capacity: 4, status: "reserved", location: "indoor", reserved_for: "Sr. Fernando Magaia", reservation_time: new Date().toISOString(), active: true, created_at: "", updated_at: "" },
  { id: 4, company_id: 1, table_number: "04", capacity: 6, status: "dirty", location: "indoor", active: true, created_at: "", updated_at: "" },
  { id: 5, company_id: 1, table_number: "05", capacity: 4, status: "available", location: "outdoor", active: true, created_at: "", updated_at: "" },
  { id: 6, company_id: 1, table_number: "06", capacity: 6, status: "occupied", location: "outdoor", active: true, created_at: "", updated_at: "" },
  { id: 7, company_id: 1, table_number: "07", capacity: 8, status: "available", location: "outdoor", active: true, created_at: "", updated_at: "" },
  { id: 8, company_id: 1, table_number: "08", capacity: 2, status: "available", location: "bar", active: true, created_at: "", updated_at: "" },
  { id: 9, company_id: 1, table_number: "09", capacity: 2, status: "occupied", location: "bar", active: true, created_at: "", updated_at: "" },
  { id: 10, company_id: 1, table_number: "10", capacity: 4, status: "available", location: "bar", active: true, created_at: "", updated_at: "" },
];

const defaultMockMenu: MenuItem[] = [
  { id: 1, company_id: 1, name: "Chamuças de Carne (3 un)", description: "Pastéis crocantes tradicionais recheados com carne picada e especiarias", category: "appetizers", price: 180, preparation_time: 10, dietary_info: "halal", available: true, active: true, created_at: "", updated_at: "" },
  { id: 2, company_id: 1, name: "Rissóis de Camarão (3 un)", description: "Massa tenra com recheio cremoso de camarão fresco da costa", category: "appetizers", price: 220, preparation_time: 12, dietary_info: "seafood", available: true, active: true, created_at: "", updated_at: "" },
  { id: 3, company_id: 1, name: "Matapa com Camarão e Arroz", description: "Folhas de mandioca piladas com amendoim, leite de coco e camarão", category: "mains", price: 650, preparation_time: 20, dietary_info: "gluten-free", available: true, active: true, created_at: "", updated_at: "" },
  { id: 4, company_id: 1, name: "Frango à Zambeziana com Peri-Peri", description: "Frango marinado no leite de coco e grelhado na brasa com piripíri", category: "mains", price: 550, preparation_time: 25, dietary_info: "spicy", available: true, active: true, created_at: "", updated_at: "" },
  { id: 5, company_id: 1, name: "Camarão Tigre Grelhado com Alho", description: "Camarão gigante de Moçambique grelhado com manteiga de alho e limão", category: "mains", price: 1100, preparation_time: 20, dietary_info: "seafood", available: true, active: true, created_at: "", updated_at: "" },
  { id: 6, company_id: 1, name: "Arroz de Coco e Castanha de Caju", description: "Arroz basmati aromatizado com leite de coco e castanhas tostadas", category: "sides", price: 160, preparation_time: 5, dietary_info: "vegetarian, vegan", available: true, active: true, created_at: "", updated_at: "" },
  { id: 7, company_id: 1, name: "Batata Doce Frita Crocante", description: "Palitos de batata doce polvilhados com sal marinho e ervas", category: "sides", price: 140, preparation_time: 8, dietary_info: "vegetarian", available: true, active: true, created_at: "", updated_at: "" },
  { id: 8, company_id: 1, name: "Cerveja Laurentina Preta 330ml", description: "Cerveja escura clássica de Moçambique", category: "drinks", price: 130, preparation_time: 2, available: true, active: true, created_at: "", updated_at: "" },
  { id: 9, company_id: 1, name: "Sumo Natural de Maracujá Fresco", description: "Sumo natural extraído na hora com maracujá doce de Manica", category: "drinks", price: 150, preparation_time: 4, dietary_info: "vegan", available: true, active: true, created_at: "", updated_at: "" },
  { id: 10, company_id: 1, name: "Bebinca Tradicional com Gelado", description: "Doce em camadas aromático servido com bola de gelado de baunilha", category: "desserts", price: 280, preparation_time: 5, dietary_info: "vegetarian", available: true, active: true, created_at: "", updated_at: "" },
];
