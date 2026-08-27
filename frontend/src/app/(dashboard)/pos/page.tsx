"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  Sparkles,
  Smartphone,
  CreditCard,
  Banknote,
  RotateCcw,
  Plus,
  Minus,
  Trash2,
  PackagePlus,
  RefreshCw,
  Search,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import POSProductGrid from "@/components/modules/pos/POSProductGrid";
import POSReceipt from "@/components/modules/pos/POSReceipt";
import { DualBarcodeScanner } from "@/components/DualBarcodeScanner";
import { usePOS } from "@/hooks/usePOS";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    loadProducts,
  } = usePOS();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerInitialMode, setScannerInitialMode] = useState<"venda" | "stock">("venda");
  const [saleError, setSaleError] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [cashReceived, setCashReceived] = useState<number | "">("");
  const [showQuickItemModal, setShowQuickItemModal] = useState(false);
  const [quickItemName, setQuickItemName] = useState("");
  const [quickItemPrice, setQuickItemPrice] = useState("");

  const handleFinishSale = async (overrideMethod?: PaymentMethod) => {
    setSaleError(null);
    const selectedMethod = overrideMethod || paymentMethod;
    if (overrideMethod) {
      setPaymentMethod(overrideMethod);
    }

    try {
      const result = await completeSale(selectedMethod);
      if (result && result.data) {
        const total = summary.netTotal;
        const paid = Number(cashReceived) || total;
        const change = selectedMethod === "cash" && paid > total ? paid - total : 0;

        setLastCompletedSale({
          ...result.data,
          customer_phone: customerPhone,
          cash_received: selectedMethod === "cash" ? paid : undefined,
          change_amount: change > 0 ? change : undefined,
        });
        setCashReceived("");
      }
    } catch (err: any) {
      setSaleError(err.message || "Falha ao processar a venda.");
    }
  };

  const handleAddQuickCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(quickItemPrice);
    if (!price || price <= 0) return;

    const customProduct: Product = {
      id: Date.now(),
      name: quickItemName.trim() || "Artigo Avulso",
      sku: `REG-${Math.floor(Math.random() * 9000 + 1000)}`,
      unit_price: price,
      cost_price: price * 0.7,
      quantity: 999,
      iva_rate: 16,
      category: "Geral",
      active: true,
    };

    addItem(customProduct);
    setQuickItemName("");
    setQuickItemPrice("");
    setShowQuickItemModal(false);
  };

  const handleOpenScanner = (mode: "venda" | "stock") => {
    setScannerInitialMode(mode);
    setIsScannerOpen(true);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden select-none bg-zinc-950 text-zinc-100 font-mono selection:bg-emerald-500 selection:text-black">
        {/* Streamlined Top Navigation Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
                title="Voltar ao Painel"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-slate-900 border border-emerald-500/40 p-1 flex items-center justify-center shadow-lg shadow-emerald-500/20">
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
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    DIGITAL & WHATSAPP
                  </span>
                </div>
                <p className="text-[9px] text-zinc-400 leading-tight uppercase mt-0.5">
                  Terminal de Venda Rápida • Sem Impressora
                </p>
              </div>
            </div>
          </div>

          {/* Quick Scanner & Action Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenScanner("venda")}
              className="h-8 px-3 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-1.5"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Ler Código / QR (Venda)</span>
            </Button>

            <Button
              onClick={() => handleOpenScanner("stock")}
              variant="outline"
              className="h-8 px-3 text-xs font-bold uppercase tracking-wider border-blue-500/40 bg-blue-950/30 hover:bg-blue-900/50 text-blue-300 rounded-xl hidden sm:flex items-center gap-1.5"
            >
              <PackagePlus className="h-3.5 w-3.5" />
              <span>Entrada de Stock</span>
            </Button>

            <Button
              onClick={() => setShowQuickItemModal(true)}
              variant="outline"
              className="h-8 px-2.5 text-xs font-bold border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl hidden md:flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-400" />
              <span>+ Artigo Rápido</span>
            </Button>

            {pendingSyncCount > 0 && (
              <button
                onClick={() => syncOfflineSales()}
                className="h-8 px-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>{pendingSyncCount}</span>
              </button>
            )}

            <div
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-bold border ${
                isOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="hidden sm:inline">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {saleError && (
          <div className="bg-red-500/20 border-b border-red-500/40 px-4 py-2 text-xs text-red-300 font-bold flex items-center justify-between">
            <span>⚠️ {saleError}</span>
            <button onClick={() => setSaleError(null)} className="underline text-[11px] hover:text-white">
              FECHAR
            </button>
          </div>
        )}

        {/* Main 2-Column POS Workspace */}
        <main className="flex-1 p-3 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Column: Product Catalog Grid */}
          <div className="h-full overflow-hidden lg:col-span-7 xl:col-span-8 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 backdrop-blur flex flex-col">
            <POSProductGrid
              products={products}
              onSelectProduct={addItem}
              isLoading={isLoadingProducts}
            />
          </div>

          {/* Right Column: Clean Cart, Customer WhatsApp & Checkout */}
          <div className="h-full overflow-hidden lg:col-span-5 xl:col-span-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xl backdrop-blur">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Venda Atual ({summary.itemCount} un.)
                  </h3>
                  <p className="text-[10px] text-zinc-400">Checkout Rápido</p>
                </div>
              </div>

              {cart.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="h-7 px-2 text-[10px] border-red-500/30 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto my-2.5 space-y-2 pr-1 min-h-[140px]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-44 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl p-4">
                  <QrCode className="h-8 w-8 mb-2 stroke-1 text-zinc-600" />
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">CARRINHO VAZIO</p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Toque nos artigos ao lado ou use o Leitor Barcode/QR para adicionar.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-bold text-zinc-100 truncate text-xs uppercase">{item.product.name}</h4>
                      <p className="text-[10px] text-emerald-400 font-semibold">
                        {item.unit_price.toFixed(2)} MT{" "}
                        <span className="text-zinc-500 font-normal">/ un</span>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="h-6 w-6 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center font-black text-xs text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="h-6 w-6 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-black text-white text-xs pl-2">
                      {(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer WhatsApp Field */}
            <div className="border-t border-zinc-800 pt-2.5 space-y-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Smartphone className="w-3 h-3" />
                  WhatsApp do Cliente (Para envio imediato da Fatura)
                </label>
                <Input
                  type="tel"
                  placeholder="Ex: 841234567 ou 861234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-8 text-xs bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-emerald-500 font-bold"
                />
              </div>

              {/* Payment Methods (4 essential pills) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("cash");
                      if (!cashReceived) setCashReceived(summary.netTotal);
                    }}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "cash"
                        ? "bg-emerald-600 text-white border-emerald-400 font-black shadow-md shadow-emerald-950"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs"
                    }`}
                  >
                    <Banknote className="h-3.5 w-3.5 mx-auto mb-0.5" />
                    <span className="text-[9px] block">Dinheiro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "mpesa"
                        ? "bg-red-600 text-white border-red-400 font-black shadow-md shadow-red-950"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5 mx-auto mb-0.5" />
                    <span className="text-[9px] block">M-Pesa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("emola")}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "emola"
                        ? "bg-amber-600 text-white border-amber-400 font-black shadow-md shadow-amber-950"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs"
                    }`}
                  >
                    <Smartphone className="h-3.5 w-3.5 mx-auto mb-0.5" />
                    <span className="text-[9px] block">e-Mola</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-1.5 rounded-xl border text-center transition-all ${
                      paymentMethod === "card"
                        ? "bg-blue-600 text-white border-blue-400 font-black shadow-md shadow-blue-950"
                        : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5 mx-auto mb-0.5" />
                    <span className="text-[9px] block">Cartão</span>
                  </button>
                </div>
              </div>

              {/* Cash Change Calculator Panel (Active when Dinheiro is selected) */}
              {paymentMethod === "cash" && summary.netTotal > 0 && (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Banknote className="w-3 h-3" />
                      Valor Entregue pelo Cliente (MT)
                    </label>
                    {Number(cashReceived || 0) >= summary.netTotal && (
                      <span className="text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Troco: {(Number(cashReceived || 0) - summary.netTotal).toFixed(2)} MT
                      </span>
                    )}
                  </div>

                  <Input
                    type="number"
                    step="any"
                    placeholder={`Ex: ${summary.netTotal.toFixed(2)}`}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value === "" ? "" : Number(e.target.value))}
                    className="h-8 text-xs bg-zinc-900 border-zinc-700 text-white font-mono font-bold focus:border-emerald-500"
                  />

                  {/* Quick Cash Buttons (Mozambique Meticais Bills) */}
                  <div className="flex gap-1 overflow-x-auto pb-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCashReceived(summary.netTotal)}
                      className="px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold whitespace-nowrap"
                    >
                      Exato
                    </button>
                    {[50, 100, 200, 500, 1000, 2000].map((bill) => {
                      if (bill < summary.netTotal && bill * 2 < summary.netTotal) return null;
                      return (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => setCashReceived(bill)}
                          className={`px-2 py-1 rounded-md font-mono font-bold whitespace-nowrap transition-colors ${
                            cashReceived === bill
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          {bill} MT
                        </button>
                      );
                    })}
                  </div>

                  {Number(cashReceived || 0) < summary.netTotal && cashReceived !== "" && (
                    <p className="text-[10px] text-amber-400 font-medium">
                      ⚠️ Valor insuficiente: faltam {(summary.netTotal - Number(cashReceived)).toFixed(2)} MT
                    </p>
                  )}
                </div>
              )}

              {/* Totals & Primary Action */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Subtotal:</span>
                  <span>{summary.subtotal.toFixed(2)} MT</span>
                </div>
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>IVA 16% (incluído):</span>
                  <span className="text-emerald-400">{summary.taxAmount.toFixed(2)} MT</span>
                </div>
                {summary.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400 text-[11px]">
                    <span>Desconto ({summary.discountPercentage}%):</span>
                    <span>-{summary.discountAmount.toFixed(2)} MT</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline border-t border-zinc-800 pt-1.5 text-white">
                  <span className="text-xs font-bold text-zinc-300">TOTAL A PAGAR:</span>
                  <span className="text-lg font-black text-emerald-400">
                    {summary.netTotal.toFixed(2)} <span className="text-xs font-normal text-zinc-400">MT</span>
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <Button
                type="button"
                disabled={cart.length === 0 || isProcessing}
                onClick={() => handleFinishSale()}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-emerald-950 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  "A PROCESSAR VENDA..."
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>FINALIZAR VENDA & ENVIAR WHATSAPP ↵</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>

        {/* Dual Barcode & QR Code Scanner Modal */}
        <DualBarcodeScanner
          isOpen={isScannerOpen}
          initialMode={scannerInitialMode}
          onClose={() => setIsScannerOpen(false)}
          onProductSold={(product) => {
            addItem(product, 1);
          }}
          onStockUpdated={(product) => {
            loadProducts();
          }}
        />

        {/* Quick Item Modal */}
        {showQuickItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Adicionar Artigo Rápido / Avulso
              </h3>
              <form onSubmit={handleAddQuickCustomItem} className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Descrição do Artigo</label>
                  <Input
                    placeholder="Ex: Serviço de Frete / Artigo Avulso"
                    value={quickItemName}
                    onChange={(e) => setQuickItemName(e.target.value)}
                    className="h-9 text-xs bg-zinc-950 border-zinc-700 text-white mt-1"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Preço Total (MT)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={quickItemPrice}
                    onChange={(e) => setQuickItemPrice(e.target.value)}
                    className="h-9 text-xs bg-zinc-950 border-zinc-700 text-emerald-400 font-bold mt-1"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowQuickItemModal(false)}
                    className="flex-1 h-9 text-xs border-zinc-700 text-zinc-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sale Success / Digital WhatsApp Receipt Modal */}
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



