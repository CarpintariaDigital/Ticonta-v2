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
  const isInitialLoadedRef = useRef(false);

  // ==========================================
  // Fetching methods (stable callbacks)
  // ==========================================
  const fetchTables = useCallback(async (companyId = 1) => {
    useRestaurantStore.getState().setIsLoading(true);
    try {
      const data = await restaurantService.getTables({ company_id: companyId });
      useRestaurantStore.getState().setTables(data);
    } catch (err) {
      if (useRestaurantStore.getState().tables.length === 0) {
        useRestaurantStore.getState().setTables(defaultMockTables);
      }
    } finally {
      useRestaurantStore.getState().setIsLoading(false);
    }
  }, []);

  const fetchMenu = useCallback(async (companyId = 1) => {
    try {
      const data = await restaurantService.getMenu({ company_id: companyId });
      useRestaurantStore.getState().setMenuItems(data);
    } catch (err) {
      if (useRestaurantStore.getState().menuItems.length === 0) {
        useRestaurantStore.getState().setMenuItems(defaultMockMenu);
      }
    }
  }, []);

  const fetchOrders = useCallback(async (companyId = 1) => {
    try {
      const data = await restaurantService.getOrders({ company_id: companyId });
      useRestaurantStore.getState().setOrders(data);
    } catch (err) {
      // ignore
    }
  }, []);

  const fetchKDS = useCallback(async (companyId = 1) => {
    try {
      const res = await restaurantService.getKitchenDisplay(companyId);
      useRestaurantStore.getState().setKDSItems(res.items);
      useRestaurantStore.getState().setKDSStats({
        totalPending: res.total_pending,
        totalPreparing: res.total_preparing,
        totalReady: res.total_ready,
        averageWaitTime: res.average_wait_time_minutes,
      });
    } catch (err) {
      // ignore
    }
  }, []);

  const fetchBill = useCallback(async (orderId: number, companyId = 1) => {
    try {
      const bill = await restaurantService.getTableBill(orderId, companyId);
      useRestaurantStore.getState().setBillData(bill);
      return bill;
    } catch (err) {
      return null;
    }
  }, []);

  const fetchReports = useCallback(async (companyId = 1, startDate?: string, endDate?: string) => {
    try {
      const data = await restaurantService.getReports({ company_id: companyId, start_date: startDate, end_date: endDate });
      useRestaurantStore.getState().setReports(data);
      return data;
    } catch (err) {
      return null;
    }
  }, []);

  const fetchSettings = useCallback(async (companyId = 1) => {
    try {
      const data = await restaurantService.getSettings(companyId);
      useRestaurantStore.getState().setSettings(data);
      return data;
    } catch (err) {
      return null;
    }
  }, []);

  // ==========================================
  // Table Selection & Order Loading
  // ==========================================
  const selectTable = useCallback(async (table: Table | null) => {
    useRestaurantStore.getState().setSelectedTable(table);
    if (!table) {
      useRestaurantStore.getState().setCurrentOrder(null);
      return;
    }

    try {
      const orderList = await restaurantService.getOrders({ table_id: table.id, status: "open" });
      if (orderList && orderList.length > 0) {
        const fullOrder = await restaurantService.getOrder(orderList[0].id);
        useRestaurantStore.getState().setCurrentOrder(fullOrder);
      } else {
        useRestaurantStore.getState().setCurrentOrder(null);
      }
    } catch (e) {
      const found = useRestaurantStore.getState().orders.find((o) => o.table_id === table.id && o.status === "open");
      useRestaurantStore.getState().setCurrentOrder(found || null);
    }
  }, []);

  // ==========================================
  // Order Operations
  // ==========================================
  const createOrder = useCallback(async (tableId?: number | null, guestCount = 2, notes?: string) => {
    useRestaurantStore.getState().setIsLoading(true);
    try {
      const newOrder = await restaurantService.createOrder({
        table_id: tableId,
        guest_count: guestCount,
        notes,
      });
      useRestaurantStore.getState().setCurrentOrder(newOrder);
      if (tableId) {
        useRestaurantStore.getState().updateTableInState(tableId, { status: "occupied" });
      }
      await fetchTables();
      return newOrder;
    } finally {
      useRestaurantStore.getState().setIsLoading(false);
    }
  }, [fetchTables]);

  const addItemToOrder = useCallback(async (orderId: number, menuItemId: number, quantity = 1, specialRequests?: string | null) => {
    const item = await restaurantService.addItemToOrder(orderId, {
      menu_item_id: menuItemId,
      quantity,
      special_requests: specialRequests,
    });
    useRestaurantStore.getState().addOrderItemToState(item);
    const fullOrder = await restaurantService.getOrder(orderId);
    useRestaurantStore.getState().setCurrentOrder(fullOrder);
    fetchKDS();
    return item;
  }, [fetchKDS]);

  const updateItemStatus = useCallback(async (orderItemId: number, newStatus: string) => {
    const updated = await restaurantService.updateItemStatus(orderItemId, newStatus);
    useRestaurantStore.getState().updateKDSItemInState(orderItemId, { preparation_status: newStatus as any });
    const curr = useRestaurantStore.getState().currentOrder;
    if (curr) {
      const fullOrder = await restaurantService.getOrder(curr.id);
      useRestaurantStore.getState().setCurrentOrder(fullOrder);
    }
    fetchKDS();
    return updated;
  }, [fetchKDS]);

  const closeTable = useCallback(async (orderId: number, paymentMethod: PaymentMethod | string, amountPaid?: number, notes?: string, autoClean?: boolean) => {
    useRestaurantStore.getState().setIsLoading(true);
    try {
      const res = await restaurantService.closeTable(orderId, {
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        notes,
        auto_clean: autoClean,
      });
      const selected = useRestaurantStore.getState().selectedTable;
      if (selected) {
        useRestaurantStore.getState().updateTableInState(selected.id, {
          status: (res.table_status as any) || "dirty",
        });
      }
      useRestaurantStore.getState().setCurrentOrder(null);
      useRestaurantStore.getState().setIsBillModalOpen(false);
      await fetchTables();
      await fetchKDS();
      return res;
    } finally {
      useRestaurantStore.getState().setIsLoading(false);
    }
  }, [fetchKDS, fetchTables]);

  const splitBill = useCallback(async (orderId: number, numBills?: number, customSplits?: any[]) => {
    const res = await restaurantService.splitBill(orderId, {
      num_bills: numBills,
      custom_splits: customSplits,
    });
    useRestaurantStore.getState().setSplitData(res);
    return res;
  }, []);

  const reserveTable = useCallback(async (tableId: number, data: { guest_count: number; reservation_time: string; customer_name: string; customer_phone?: string }) => {
    const res = await restaurantService.reserveTable(tableId, data);
    useRestaurantStore.getState().updateTableInState(tableId, {
      status: "reserved",
      reserved_for: data.customer_name,
      reserved_contact: data.customer_phone,
      reservation_time: data.reservation_time,
    });
    useRestaurantStore.getState().setIsReservationModalOpen(false);
    return res;
  }, []);

  const updateTableStatus = useCallback(async (tableId: number, status: TableStatus) => {
    const res = await restaurantService.updateTableStatus(tableId, status);
    useRestaurantStore.getState().updateTableInState(tableId, { status });
    return res;
  }, []);

  const updateSettings = useCallback(async (data: Partial<import("@/types/restaurant").RestaurantSettings>, companyId = 1) => {
    const res = await restaurantService.updateSettings(data, companyId);
    useRestaurantStore.getState().setSettings(res);
    return res;
  }, []);

  // Initial load only once on mount
  useEffect(() => {
    if (!isInitialLoadedRef.current) {
      isInitialLoadedRef.current = true;
      fetchTables();
      fetchMenu();
      fetchKDS();
      fetchSettings();
    }
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
  { id: 1, table_number: "T-01", capacity: 4, location: "outdoor", status: "available", company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 2, table_number: "T-02", capacity: 2, location: "outdoor", status: "occupied", company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 3, table_number: "T-03", capacity: 6, location: "indoor", status: "reserved", company_id: 1, reserved_for: "Dr. Alberto Matsinhe", reservation_time: "19:30", active: true, created_at: "", updated_at: "" },
  { id: 4, table_number: "T-04", capacity: 4, location: "indoor", status: "dirty", company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 5, table_number: "T-05", capacity: 1, location: "bar", status: "available", company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 6, table_number: "T-06", capacity: 1, location: "bar", status: "available", company_id: 1, active: true, created_at: "", updated_at: "" },
];

const defaultMockMenu: MenuItem[] = [
  { id: 1, name: "Frango Zambeziano na Brasa", description: "Frango marinado em leite de coco e piripíri, servido com xima ou batata", category: "mains", price: 650, available: true, preparation_time: 25, company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 2, name: "Caril de Camarão de Quelimane", description: "Camarão fresco com leite de coco fresco, caril madras e arroz de coco", category: "mains", price: 950, available: true, preparation_time: 20, company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 3, name: "Matapa com Caranguejo", description: "Folhas de mandioca piladas com amendoim, coco e caranguejo da baía", category: "mains", price: 550, available: true, preparation_time: 15, company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 4, name: "2M Draft Gelada 500ml", description: "Cerveja Laurentina / 2M em chope bem gelado", category: "drinks", price: 120, available: true, preparation_time: 3, company_id: 1, active: true, created_at: "", updated_at: "" },
  { id: 5, name: "Pastel de Nata Artesanal (2 un)", description: "Pastéis de nata quentinhos com canela de Moçambique", category: "desserts", price: 150, available: true, preparation_time: 5, company_id: 1, active: true, created_at: "", updated_at: "" },
];
