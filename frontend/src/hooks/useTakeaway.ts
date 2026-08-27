import { useCallback, useEffect, useRef } from "react";
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
  const isInitialLoadedRef = useRef(false);

  const fetchOrders = useCallback(
    async (sFilter?: string, oType?: string, search?: string, companyId = 1) => {
      useTakeawayStore.getState().setIsLoading(true);
      try {
        const data = await takeawayService.getOrders(
          companyId,
          sFilter === "all" ? undefined : sFilter,
          oType === "all" ? undefined : oType,
          search
        );
        useTakeawayStore.getState().setOrders(data);
      } catch (err) {
        console.error("Erro ao buscar pedidos takeaway:", err);
      } finally {
        useTakeawayStore.getState().setIsLoading(false);
      }
    },
    []
  );

  const fetchPendingDeliveries = useCallback(
    async (companyId = 1) => {
      try {
        const data = await takeawayService.getPendingDeliveries(companyId);
        useTakeawayStore.getState().setPendingDeliveries(data);
      } catch (err) {
        console.error("Erro ao buscar entregas pendentes:", err);
      }
    },
    []
  );

  const fetchStats = useCallback(
    async (companyId = 1) => {
      try {
        const data = await takeawayService.getStats(companyId);
        useTakeawayStore.getState().setStats(data);
      } catch (err) {
        console.error("Erro ao buscar estatísticas de takeaway:", err);
      }
    },
    []
  );

  const createTakeawayOrder = useCallback(
    async (data: TakeawayOrderCreate, companyId = 1) => {
      useTakeawayStore.getState().setIsLoading(true);
      try {
        const order = await takeawayService.createOrder(data, companyId);
        useTakeawayStore.getState().addOrderToState(order);
        useTakeawayStore.getState().setIsNewOrderModalOpen(false);
        fetchStats(companyId);
        if (order.order_type === "delivery") {
          fetchPendingDeliveries(companyId);
        }
        return order;
      } catch (err) {
        console.error("Erro ao criar pedido takeaway:", err);
        throw err;
      } finally {
        useTakeawayStore.getState().setIsLoading(false);
      }
    },
    [fetchPendingDeliveries, fetchStats]
  );

  const updateOrderStatus = useCallback(
    async (orderId: number, nextStatus: TakeawayStatus, notes?: string, companyId = 1) => {
      useTakeawayStore.getState().advanceOrderStatusInState(orderId, nextStatus);
      try {
        const updated = await takeawayService.updateOrderStatus(
          orderId,
          { status: nextStatus, notes },
          companyId
        );
        useTakeawayStore.getState().updateOrderInState(orderId, updated);
        fetchStats(companyId);
        fetchPendingDeliveries(companyId);
        return updated;
      } catch (err) {
        console.error("Erro ao atualizar status do pedido:", err);
        throw err;
      }
    },
    [fetchPendingDeliveries, fetchStats]
  );

  const assignDelivery = useCallback(
    async (orderId: number, data: DeliveryAssignRequest, companyId = 1) => {
      useTakeawayStore.getState().setIsLoading(true);
      try {
        const updated = await takeawayService.assignDelivery(orderId, data, companyId);
        useTakeawayStore.getState().updateOrderInState(orderId, updated);
        useTakeawayStore.getState().setIsAssignModalOpen(false);
        fetchPendingDeliveries(companyId);
        fetchStats(companyId);
        return updated;
      } catch (err) {
        console.error("Erro ao atribuir estafeta:", err);
        throw err;
      } finally {
        useTakeawayStore.getState().setIsLoading(false);
      }
    },
    [fetchPendingDeliveries, fetchStats]
  );

  const updateDeliveryStatus = useCallback(
    async (orderId: number, deliveryStatus: DeliveryStatus, notes?: string, companyId = 1) => {
      try {
        const updated = await takeawayService.updateDeliveryStatus(
          orderId,
          { delivery_status: deliveryStatus, notes },
          companyId
        );
        useTakeawayStore.getState().updateOrderInState(orderId, updated);
        fetchPendingDeliveries(companyId);
        fetchStats(companyId);
        return updated;
      } catch (err) {
        console.error("Erro ao atualizar status de entrega:", err);
        throw err;
      }
    },
    [fetchPendingDeliveries, fetchStats]
  );

  const trackOrder = useCallback(
    async (orderIdOrCode: string, companyId = 1) => {
      useTakeawayStore.getState().setIsLoading(true);
      try {
        const data = await takeawayService.trackOrder(orderIdOrCode, companyId);
        useTakeawayStore.getState().setTrackingData(data);
        useTakeawayStore.getState().setIsTrackingModalOpen(true);
        return data;
      } catch (err) {
        console.error("Erro ao rastrear pedido:", err);
        throw err;
      } finally {
        useTakeawayStore.getState().setIsLoading(false);
      }
    },
    []
  );

  // Initial load only once on mount
  useEffect(() => {
    if (!isInitialLoadedRef.current) {
      isInitialLoadedRef.current = true;
      fetchOrders();
      fetchPendingDeliveries();
      fetchStats();
    }
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
