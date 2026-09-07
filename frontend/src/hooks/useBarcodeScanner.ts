import { useCallback, useEffect } from "react";
import { useMobileCartStore } from "@/store/mobile_cart.store";

export function useBarcodeScanner() {
  const {
    items,
    cartTotal,
    tax,
    discounts,
    itemCount,
    lastScannedProduct,
    isLoading,
    error,
    addItem,
    scanAndAdd,
    removeItem,
    updateQuantity,
    clearCart,
    clearError,
  } = useMobileCartStore();

  const playFeedback = useCallback(() => {
    // 1. Feedback háptico em smartphones
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(80);
      } catch {}
    }

    // 2. Feedback sonoro tipo "BEEP" de leitor profissional usando Web Audio API
    if (typeof window !== "undefined") {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1760, ctx.currentTime); // ~1760Hz (A6)
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        }
      } catch {}
    }
  }, []);

  const handleScan = useCallback(
    async (barcode: string) => {
      if (!barcode || !barcode.trim()) return null;
      try {
        const product = await scanAndAdd(barcode.trim());
        playFeedback();
        return product;
      } catch (err) {
        throw err;
      }
    },
    [scanAndAdd, playFeedback]
  );

  return {
    items,
    cartTotal,
    tax,
    discounts,
    itemCount,
    lastScannedProduct,
    isLoading,
    error,
    handleScan,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearError,
  };
}
