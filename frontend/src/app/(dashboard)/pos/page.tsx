"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  Calculator,
  LayoutGrid,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import POSProductGrid from "@/components/modules/pos/POSProductGrid";
import POSCart from "@/components/modules/pos/POSCart";
import POSPayment from "@/components/modules/pos/POSPayment";
import POSReceipt from "@/components/modules/pos/POSReceipt";
import CashRegisterMachine from "@/components/modules/pos/CashRegisterMachine";
import { usePOS } from "@/hooks/usePOS";
import { Button } from "@/components/ui/button";
import { Product, PaymentMethod } from "@/types/pos";

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

  const [activeView, setActiveView] = useState<"machine" | "catalog" | "split">("split");
  const [saleError, setSaleError] = useState<string | null>(null);

  const handleFinishSale = async (method?: PaymentMethod) => {
    setSaleError(null);
    if (method) {
      setPaymentMethod(method);
    }
    try {
      await completeSale();
    } catch (err: any) {
      setSaleError(err.message || "Falha ao concluir a venda.");
    }
  };

  const handleAddItemByValue = (val: number, name = "Artigo Avulso") => {
    const customProduct: Product = {
      id: Date.now(),
      name: name,
      sku: `REG-${Math.floor(Math.random() * 9000 + 1000)}`,
      unit_price: val,
      cost_price: val * 0.7,
      quantity: 999,
      iva_rate: 16,
      category: "Caixa Rápido",
      active: true,
    };
    addItem(customProduct);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden select-none font-mono">
        {/* Hardware Register Machine Top Console */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b-2 border-[#0d1d33] bg-[#0c1728]/95 px-4 backdrop-blur shadow-lg shadow-black/40">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="retro"
                size="sm"
                className="h-8 w-8 p-0"
                title="Voltar ao Painel Geral"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-[#1b2d4f] border border-[#2dc4a0]/50 p-1 flex items-center justify-center shadow-inner">
                <img
                  src="/logo-ticonta.png"
                  alt="TiConta Logo"
                  className="h-full w-full object-contain filter drop-shadow"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-black text-white leading-none uppercase tracking-widest">
                    TICONTA POS
                  </h1>
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-500/20 text-[#2dc4a0] px-1 py-0.2 rounded border border-[#2dc4a0]/30 font-mono">
                    CAIXA V2
                  </span>
                </div>
                <p className="text-[9px] text-[#4a7a9b] leading-tight uppercase mt-0.5">
                  Consola de Registo & Faturamento Moçambique
                </p>
              </div>
            </div>
          </div>

          {/* Center Mode Selector (Máquina Registradora / Catálogo) */}
          <div className="flex items-center gap-1 bg-[#08121f] p-1 rounded-xl border border-[#162942]">
            <button
              onClick={() => setActiveView("split")}
              className={`key-mechanical h-7 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider hidden xl:flex items-center gap-1 ${
                activeView === "split" ? "key-enter" : "key-action"
              }`}
            >
              <span>VISÃO INTEGRADA</span>
            </button>
            <button
              onClick={() => setActiveView("machine")}
              className={`key-mechanical h-7 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                activeView === "machine" ? "key-enter" : "key-action"
              }`}
            >
              <Calculator className="h-3 w-3" />
              <span>MÁQUINA REGISTRADORA</span>
            </button>
            <button
              onClick={() => setActiveView("catalog")}
              className={`key-mechanical h-7 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                activeView === "catalog" ? "key-enter" : "key-action"
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>CATÁLOGO ARTIGOS</span>
            </button>
          </div>

          {/* Screws & Live Status LEDs */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 opacity-70">
              <div className="screw" />
              <div className="screw" />
            </div>

            {pendingSyncCount > 0 && (
              <button
                onClick={() => syncOfflineSales()}
                className="key-mechanical h-7 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border-b-2 border-amber-800"
              >
                <RefreshCw className="h-3 w-3 mr-1 inline animate-spin" />
                {pendingSyncCount} PENDENTE(S)
              </button>
            )}

            <div
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border ${
                isOnline
                  ? "bg-[#060e1a] text-[#2dc4a0] border-[#2dc4a0]/30 shadow-[0_0_8px_rgba(45,196,160,0.2)]"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              <div className={isOnline ? "status-led" : "w-2 h-2 rounded-full bg-amber-400"} />
              <span className="hidden sm:inline">{isOnline ? "ONLINE AT" : "OFFLINE LOCAL"}</span>
            </div>
          </div>
        </header>

        {/* Error banner if any */}
        {saleError && (
          <div className="bg-red-500/20 border-b border-red-500/40 px-4 py-2 text-xs text-red-300 font-bold flex items-center justify-between">
            <span>⚠️ {saleError}</span>
            <button onClick={() => setSaleError(null)} className="underline text-[11px] hover:text-white">
              FECHAR
            </button>
          </div>
        )}

        {/* Main POS Layout */}
        <main className="flex-1 p-3 overflow-hidden">
          {activeView === "machine" ? (
            /* Standalone Physical Cash Register Machine View */
            <div className="h-full flex items-center justify-center overflow-y-auto py-2">
              <CashRegisterMachine
                cart={cart}
                summary={summary}
                onAddItemByValue={handleAddItemByValue}
                onUpdateDiscount={setDiscountPercentage}
                onClear={clearCart}
                onCompleteSale={handleFinishSale}
                isProcessing={isProcessing}
              />
            </div>
          ) : activeView === "catalog" ? (
            /* Full Catalog & Tape Columns View */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
              <div className="h-full overflow-hidden lg:col-span-8 chassis-panel p-3.5">
                <POSProductGrid
                  products={products}
                  onSelectProduct={addItem}
                  isLoading={isLoadingProducts}
                />
              </div>
              <div className="h-full overflow-hidden lg:col-span-4">
                <POSCart
                  cart={cart}
                  summary={summary}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeItem}
                  onClearCart={clearCart}
                />
              </div>
            </div>
          ) : (
            /* Integrated Split View: Products on Left + Cash Register on Right */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
              <div className="h-full overflow-hidden lg:col-span-7 chassis-panel p-3.5">
                <POSProductGrid
                  products={products}
                  onSelectProduct={addItem}
                  isLoading={isLoadingProducts}
                />
              </div>
              <div className="h-full overflow-y-auto lg:col-span-5 flex items-center justify-center p-1">
                <CashRegisterMachine
                  cart={cart}
                  summary={summary}
                  onAddItemByValue={handleAddItemByValue}
                  onUpdateDiscount={setDiscountPercentage}
                  onClear={clearCart}
                  onCompleteSale={handleFinishSale}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          )}
        </main>

        {/* Sale Success / Thermal Receipt Modal */}
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


