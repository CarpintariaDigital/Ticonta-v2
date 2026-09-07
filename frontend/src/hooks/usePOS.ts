"use client";

import { useEffect, useState, useCallback } from "react";
import { usePOSStore } from "@/store/pos.store";
import { posService } from "@/services/pos";
import { localDb } from "@/lib/dexie";
import { PaymentMethod, Product } from "@/types/pos";

export function usePOS() {
  const store = usePOSStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitorar status de conexão online / offline
  useEffect(() => {
    const updateOnlineStatus = () => {
      store.setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        syncOfflineSales();
      }
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const checkPendingSync = useCallback(async () => {
    try {
      const count = await localDb.offlineSales.where("synced").equals(0).count();
      usePOSStore.getState().setPendingSyncCount(count);
    } catch (err) {
      // ignore
    }
  }, []);

  const syncOfflineSales = useCallback(async () => {
    const synced = await posService.syncPendingSales();
    if (synced > 0) {
      checkPendingSync();
    }
  }, [checkPendingSync]);

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setError(null);
    try {
      const data = await posService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setError("Erro ao carregar catálogo de produtos.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    checkPendingSync();
  }, []);

  const completeSale = async (methodOverride?: PaymentMethod) => {
    const summary = store.getSummary();
    if (store.cart.length === 0) {
      throw new Error("O carrinho está vazio.");
    }

    store.setIsProcessing(true);
    try {
      const payload = {
        company_id: 1,
        customer_id: store.selectedCustomerId || undefined,
        payment_method: methodOverride || store.paymentMethod,
        discount: summary.discountAmount,
        items: store.cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
        })),
      };

      const result = await posService.createSale(payload);
      store.setLastCompletedSale(result.data);
      store.clearCart();
      checkPendingSync();
      return result;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || err.message || "Erro ao processar venda.");
    } finally {
      store.setIsProcessing(false);
    }
  };

  return {
    cart: store.cart,
    products,
    isLoadingProducts,
    error,
    discountPercentage: store.discountPercentage,
    paymentMethod: store.paymentMethod,
    isProcessing: store.isProcessing,
    lastCompletedSale: store.lastCompletedSale,
    isOnline: store.isOnline,
    pendingSyncCount: store.pendingSyncCount,
    summary: store.getSummary(),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    setDiscountPercentage: store.setDiscountPercentage,
    setPaymentMethod: store.setPaymentMethod,
    clearCart: store.clearCart,
    setLastCompletedSale: store.setLastCompletedSale,
    completeSale,
    loadProducts,
    syncOfflineSales,
  };
}
