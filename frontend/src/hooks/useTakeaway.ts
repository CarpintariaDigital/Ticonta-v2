import { useCallback, useEffect } from "react";
import { useTakeawayStore } from "@/store/takeaway.store";
import { takeawayService } from "@/services/takeaway";
import {
  TakeawayOrderCreate,
  DeliveryAssignRequest,
  DeliveryStatusUpdateRequest,
  OrderStatusUpdateRequest,
  TakeawayStatus,
  DeliveryStatus,
} from "@/types/takeaway";

export function useTakeaway() {
  const store = useTakeawayStore();

  const fetchOrders = useCallback(
    async (statusFilter?: string, orderType?: string, search?: string, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const data = await takeawayService.getOrders(
          companyId,
          statusFilter === "all" ? undefined : statusFilter,
          orderType === "all" ? undefined : orderType,
          search
        );
        store.setOrders(data);
      } catch (err) {
        console.error("Erro ao buscar pedidos takeaway:", err);
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const fetchPendingDeliveries = useCallback(
    async (companyId = 1) => {
      try {
        const data = await takeawayService.getPendingDeliveries(companyId);
        store.setPendingDeliveries(data);
      } catch (err) {
        console.error("Erro ao buscar entregas pendentes:", err);
      }
    },
    [store]
  );

  const fetchStats = useCallback(
    async (companyId = 1) => {
      try {
        const data = await takeawayService.getStats(companyId);
        store.setStats(data);
      } catch (err) {
        console.error("Erro ao buscar estatísticas de takeaway:", err);
      }
    },
    [store]
  );

  const createTakeawayOrder = useCallback(
    async (data: TakeawayOrderCreate, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const order = await takeawayService.createOrder(data, companyId);
        store.addOrderToState(order);
        store.setIsNewOrderModalOpen(false);
        fetchStats(companyId);
        if (order.order_type === "delivery") {
          fetchPendingDeliveries(companyId);
        }
        return order;
      } catch (err) {
        console.error("Erro ao criar pedido takeaway:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchPendingDeliveries, fetchStats, store]
  );

  const updateOrderStatus = useCallback(
    async (orderId: number, nextStatus: TakeawayStatus, notes?: string, companyId = 1) => {
      store.advanceOrderStatusInState(orderId, nextStatus);
      try {
        const updated = await takeawayService.updateOrderStatus(
          orderId,
          { status: nextStatus, notes },
          companyId
        );
        store.updateOrderInState(orderId, updated);
        fetchStats(companyId);
        fetchPendingDeliveries(companyId);
        return updated;
      } catch (err) {
        console.error("Erro ao atualizar status do pedido:", err);
        throw err;
      }
    },
    [fetchPendingDeliveries, fetchStats, store]
  );

  const assignDelivery = useCallback(
    async (orderId: number, data: DeliveryAssignRequest, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const updated = await takeawayService.assignDelivery(orderId, data, companyId);
        store.updateOrderInState(orderId, updated);
        store.setIsAssignModalOpen(false);
        fetchPendingDeliveries(companyId);
        fetchStats(companyId);
        return updated;
      } catch (err) {
        console.error("Erro ao atribuir estafeta:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [fetchPendingDeliveries, fetchStats, store]
  );

  const updateDeliveryStatus = useCallback(
    async (orderId: number, deliveryStatus: DeliveryStatus, notes?: string, companyId = 1) => {
      try {
        const updated = await takeawayService.updateDeliveryStatus(
          orderId,
          { delivery_status: deliveryStatus, notes },
          companyId
        );
        store.updateOrderInState(orderId, updated);
        fetchPendingDeliveries(companyId);
        fetchStats(companyId);
        return updated;
      } catch (err) {
        console.error("Erro ao atualizar status de entrega:", err);
        throw err;
      }
    },
    [fetchPendingDeliveries, fetchStats, store]
  );

  const trackOrder = useCallback(
    async (orderIdOrCode: string, companyId = 1) => {
      store.setIsLoading(true);
      try {
        const data = await takeawayService.trackOrder(orderIdOrCode, companyId);
        store.setTrackingData(data);
        store.setIsTrackingModalOpen(true);
        return data;
      } catch (err) {
        console.error("Erro ao rastrear pedido:", err);
        throw err;
      } finally {
        store.setIsLoading(false);
      }
    },
    [store]
  );

  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchPendingDeliveries();
    fetchStats();
  }, [fetchOrders, fetchPendingDeliveries, fetchStats]);

  return {
    ...store,
    fetchOrders,
    fetchPendingDeliveries,
    fetchStats,
    createTakeawayOrder,
    updateOrderStatus,
    assignDelivery,
    updateDeliveryStatus,
    trackOrder,
  };
}
