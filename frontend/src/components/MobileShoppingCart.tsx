"use client";

import React, { useState } from "react";
import { Camera, ShoppingBag, Trash2, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CartItemMobile } from "@/components/CartItemMobile";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { DocumentDeliveryModal } from "@/components/DocumentDelivery";

export const MobileShoppingCart: React.FC = () => {
  const {
    items,
    cartTotal,
    tax,
    itemCount,
    lastScannedProduct,
    isLoading,
    error,
    handleScan,
    updateQuantity,
    removeItem,
    clearCart,
    clearError,
  } = useBarcodeScanner();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [createdSaleId, setCreatedSaleId] = useState<number | null>(null);

  const onBarcodeDetected = async (code: string) => {
    try {
      await handleScan(code);
    } catch {
      // Erro gerenciado no hook
    }
  };

  const handleCheckout = () => {
    if (!items.length) return;
    // Emular conclusão e abrir entrega de documento
    setCreatedSaleId(Date.now() % 100000);
    setIsDeliveryOpen(true);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white text-white min-h-screen">
      {/* 1. Barcode Activation Zone (Large Centered) */}
      <div className="p-4">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-full h-32 rounded-2xl border-2 border-dashed border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/40 flex flex-col items-center justify-center gap-2 p-4 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] group"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Camera className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-emerald-400 block">TOQUE PARA LER CÓDIGO</span>
            <span className="text-[11px] text-zinc-500">Suporta EAN-13, Code-128 e QR-Code</span>
          </div>
        </button>
      </div>

      {/* 2. Error / Last Scanned Alert */}
      {error && (
        <div className="mx-4 mb-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="text-zinc-500 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {lastScannedProduct && !error && (
        <div className="mx-4 mb-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Adicionado: <b>{lastScannedProduct.name}</b> (+1)</span>
        </div>
      )}

      {/* 3. Cart Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-36">
        <div className="flex items-center justify-between py-1 text-xs text-zinc-500">
          <span>Artigos no Carrinho ({itemCount})</span>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-red-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>

        {items.length > 0 ? (
          items.map((item) => (
            <CartItemMobile
              key={item.product_id}
              item={item}
              onIncrement={(id) => updateQuantity(id, item.quantity + 1)}
              onDecrement={(id) => updateQuantity(id, item.quantity - 1)}
              onRemove={removeItem}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
            <ShoppingBag className="h-10 w-10 mb-2 opacity-40" />
            <p className="text-sm">O carrinho está vazio.</p>
            <p className="text-xs text-zinc-600 mt-1">Faça a leitura do código de barras de um produto.</p>
          </div>
        )}
      </div>

      {/* 4. Cart Summary (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-zinc-50 border-t border-zinc-200 p-4 space-y-3 z-40">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Subtotal:</span>
            <span>{cartTotal.toLocaleString("pt-MZ")} MZN</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>IVA Estimado (16%):</span>
            <span>{tax.toLocaleString("pt-MZ")} MZN</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-zinc-200">
            <span>TOTAL:</span>
            <span className="text-emerald-400 font-mono text-lg">
              {cartTotal.toLocaleString("pt-MZ")} MZN
            </span>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={items.length === 0}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
        >
          FINALIZAR VENDA
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Barcode Camera Modal */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={onBarcodeDetected}
      />

      {/* Document Delivery Modal (WhatsApp/SMS) */}
      {createdSaleId && (
        <DocumentDeliveryModal
          isOpen={isDeliveryOpen}
          onClose={() => {
            setIsDeliveryOpen(false);
            clearCart();
          }}
          documentId={createdSaleId}
          documentType="receipt"
        />
      )}
    </div>
  );
};
