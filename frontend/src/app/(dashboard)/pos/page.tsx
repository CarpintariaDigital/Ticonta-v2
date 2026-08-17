"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import POSProductGrid from "@/components/modules/pos/POSProductGrid";
import POSCart from "@/components/modules/pos/POSCart";
import POSPayment from "@/components/modules/pos/POSPayment";
import POSReceipt from "@/components/modules/pos/POSReceipt";
import { usePOS } from "@/hooks/usePOS";
import { Button } from "@/components/ui/button";

export default function POSPage() {
  const {
    products,
    isLoadingProducts,
    cart,
    summary,
    discountPercentage,
    paymentMethod,
    isProcessing,
    lastCompletedSale,
    isOnline,
    pendingSyncCount,
    addItem,
    removeItem,
    updateQuantity,
    setDiscountPercentage,
    setPaymentMethod,
    clearCart,
    setLastCompletedSale,
    completeSale,
    syncOfflineSales,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<"catalog" | "cart" | "payment">("catalog");
  const [saleError, setSaleError] = useState<string | null>(null);

  const handleFinishSale = async () => {
    setSaleError(null);
    try {
      await completeSale();
    } catch (err: any) {
      setSaleError(err.message || "Falha ao concluir a venda.");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden select-none font-sans">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/80 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                POS
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">Ponto de Venda (POS)</h1>
                <p className="text-[10px] text-zinc-400 leading-tight">Caixa Rápido • TiConta v2</p>
              </div>
            </div>
          </div>

          {/* Sync & Connection Status Indicator */}
          <div className="flex items-center gap-3">
            {pendingSyncCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncOfflineSales()}
                className="h-7 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs px-2.5"
              >
                <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                {pendingSyncCount} venda(s) pendente(s)
              </Button>
            )}

            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${
                isOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                  <span>Offline (IndexedDB)</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Error banner if any */}
        {saleError && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-xs text-red-400 font-medium flex items-center justify-between">
            <span>{saleError}</span>
            <button onClick={() => setSaleError(null)} className="underline text-[11px]">
              Fechar
            </button>
          </div>
        )}

        {/* Mobile Tab Navigation */}
        <div className="flex lg:hidden border-b border-zinc-800 bg-zinc-900/60 p-1">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "catalog" ? "bg-zinc-800 text-white" : "text-zinc-400"
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab("cart")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors relative ${
              activeTab === "cart" ? "bg-zinc-800 text-white" : "text-zinc-400"
            }`}
          >
            Carrinho ({summary.itemCount})
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "payment" ? "bg-zinc-800 text-white" : "text-zinc-400"
            }`}
          >
            Pagamento ({summary.netTotal.toFixed(0)} MZN)
          </button>
        </div>

        {/* Main POS 3-Column Grid Layout */}
        <main className="flex-1 p-3.5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full">
            {/* Column 1: Products Grid (6 cols) */}
            <div
              className={`h-full overflow-hidden lg:col-span-6 ${
                activeTab === "catalog" ? "block" : "hidden lg:block"
              }`}
            >
              <POSProductGrid
                products={products}
                onSelectProduct={addItem}
                isLoading={isLoadingProducts}
              />
            </div>

            {/* Column 2: Cart (3 cols) */}
            <div
              className={`h-full overflow-hidden lg:col-span-3 ${
                activeTab === "cart" ? "block" : "hidden lg:block"
              }`}
            >
              <POSCart
                cart={cart}
                summary={summary}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
              />
            </div>

            {/* Column 3: Payment & Totals (3 cols) */}
            <div
              className={`h-full overflow-hidden lg:col-span-3 ${
                activeTab === "payment" ? "block" : "hidden lg:block"
              }`}
            >
              <POSPayment
                summary={summary}
                selectedMethod={paymentMethod}
                discountPercentage={discountPercentage}
                isProcessing={isProcessing}
                onSelectMethod={setPaymentMethod}
                onSetDiscount={setDiscountPercentage}
                onCompleteSale={handleFinishSale}
                disabled={cart.length === 0}
              />
            </div>
          </div>
        </main>

        {/* Sale Success / Receipt Modal */}
        {lastCompletedSale && (
          <POSReceipt
            sale={lastCompletedSale}
            onClose={() => setLastCompletedSale(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
