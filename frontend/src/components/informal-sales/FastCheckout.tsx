"use client";

import React, { useState } from "react";
import { InformalCustomer, SaleWithDebitCreate } from "@/types/informal_sales";
import { FastCartItem } from "@/store/informal_sales.store";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Wallet,
  Smartphone,
  Banknote,
  Receipt,
  FileText,
  Send,
  CheckCircle2,
} from "lucide-react";

interface FastCheckoutProps {
  selectedCustomer: InformalCustomer | null;
  cartItems: FastCartItem[];
  cartSubtotal: number;
  amountPaidNow: number;
  amountOwed: number;
  isCreditLimitExceeded: boolean;
  dueDate: string | null;
  paymentMethod: string;
  saleNotes: string;
  isLoading: boolean;
  onAddItem: (item: { name: string; unit_price: number; quantity?: number }) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSetAmountPaidNow: (amount: number) => void;
  onSetDueDate: (date: string | null) => void;
  onSetPaymentMethod: (method: string) => void;
  onSetSaleNotes: (notes: string) => void;
  onSubmitSale: (data: SaleWithDebitCreate) => Promise<any>;
}

const PRESET_PRODUCTS = [
  { name: "Saco Arroz 25kg", price: 1450 },
  { name: "Óleo 5L", price: 650 },
  { name: "Farinha Milho 25kg", price: 950 },
  { name: "Açúcar Nacional 1kg", price: 85 },
  { name: "Sabão Barra", price: 60 },
  { name: "Pão / Bolos (Pack)", price: 120 },
  { name: "Refresco 330ml", price: 45 },
  { name: "Recarga 100 MT", price: 100 },
];

export const FastCheckout: React.FC<FastCheckoutProps> = ({
  selectedCustomer,
  cartItems,
  cartSubtotal,
  amountPaidNow,
  amountOwed,
  isCreditLimitExceeded,
  dueDate,
  paymentMethod,
  saleNotes,
  isLoading,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSetAmountPaidNow,
  onSetDueDate,
  onSetPaymentMethod,
  onSetSaleNotes,
  onSubmitSale,
}) => {
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrice || parseFloat(customPrice) <= 0) return;
    onAddItem({
      name: customName.trim(),
      unit_price: parseFloat(customPrice),
      quantity: 1,
    });
    setCustomName("");
    setCustomPrice("");
  };

  const handleQuickPayOption = (option: "full" | "half" | "zero" | "500" | "1000") => {
    if (option === "full") onSetAmountPaidNow(cartSubtotal);
    else if (option === "half") onSetAmountPaidNow(Math.floor(cartSubtotal / 2));
    else if (option === "zero") onSetAmountPaidNow(0);
    else if (option === "500") onSetAmountPaidNow(Math.min(500, cartSubtotal));
    else if (option === "1000") onSetAmountPaidNow(Math.min(1000, cartSubtotal));
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      alert("Por favor selecione ou crie um cliente para prosseguir com a venda.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Adicione pelo menos um produto ao carrinho.");
      return;
    }

    const payload: SaleWithDebitCreate = {
      customer_id: selectedCustomer.id,
      items: cartItems.map((item) => ({
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      amount_paid_now: amountPaidNow,
      due_date: amountOwed > 0 ? (dueDate ? new Date(dueDate).toISOString() : null) : null,
      payment_method: paymentMethod,
      notes: saleNotes.trim() || undefined,
    };

    await onSubmitSale(payload);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-white">Registo de Venda Rápida</h2>
            <p className="text-xs text-slate-400">Checkout simplificado com opção de fiado imediato</p>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-4 flex-1">
        {/* Left Column: Product Presets & Custom Adder */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Itens Frequentes (1-Toque)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_PRODUCTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAddItem({ name: p.name, unit_price: p.price, quantity: 1 })}
                  className="p-2.5 bg-slate-800/80 hover:bg-indigo-950/60 active:scale-95 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl text-left transition-all group flex flex-col justify-between"
                >
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                    {p.name}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 mt-2 block">
                    {p.price.toLocaleString("pt-MZ")} MT
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Item Form */}
          <form onSubmit={handleAddCustom} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 block mb-2">Item Personalizado / Avulso</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nome do produto..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Preço (MT)"
                className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
          </form>

          {/* Cart Items Table */}
          <div className="flex-1 bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 overflow-y-auto max-h-52 md:max-h-60">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6">
                <ShoppingCart className="w-8 h-8 stroke-1 mb-2 opacity-50" />
                <p className="text-xs">Nenhum item adicionado ao carrinho</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-xs font-medium text-white truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.unit_price.toLocaleString("pt-MZ")} MT x {item.quantity} ={" "}
                        <span className="font-semibold text-emerald-400">
                          {(item.unit_price * item.quantity).toLocaleString("pt-MZ")} MT
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-90 rounded flex items-center justify-center text-slate-300 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 bg-slate-800 hover:bg-slate-700 active:scale-90 rounded flex items-center justify-center text-slate-300 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Breakdown & Fiado Payment Config */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 md:p-5">
          <div className="space-y-4">
            {/* Totals Box */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} itens)</span>
                <span className="font-semibold text-slate-200">{cartSubtotal.toLocaleString("pt-MZ")} MT</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                <span className="text-sm font-bold text-white">Total a Pagar</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {cartSubtotal.toLocaleString("pt-MZ")} MT
                </span>
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Valor Pago no Ato (Entrada)
              </label>

              <div className="relative mb-2">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">MZN</span>
                <input
                  type="number"
                  value={amountPaidNow || ""}
                  onChange={(e) => onSetAmountPaidNow(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Amount Pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => handleQuickPayOption("full")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    amountPaidNow === cartSubtotal && cartSubtotal > 0
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  Tudo ({cartSubtotal} MT)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayOption("half")}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayOption("500")}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                >
                  500 MT
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayOption("1000")}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                >
                  1.000 MT
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPayOption("zero")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    amountPaidNow === 0
                      ? "bg-rose-600 text-white border-rose-500 shadow-md"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  Fiado Total (0 MT)
                </button>
              </div>
            </div>

            {/* Dynamic Fiado Notice */}
            {amountOwed > 0 && (
              <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-3">
                <div className="flex items-start gap-2.5 text-amber-300 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span>Este cliente ficará a dever </span>
                    <strong className="text-amber-200 font-extrabold text-sm underline">
                      {amountOwed.toLocaleString("pt-MZ")} MT
                    </strong>
                    <span> (Fiado)</span>
                  </div>
                </div>

                {isCreditLimitExceeded && (
                  <div className="text-[11px] font-bold text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-500/40">
                    ⚠️ Atenção: O novo saldo devedor excederá o limite de fiado de{" "}
                    {selectedCustomer?.trusted_credit_limit.toLocaleString("pt-MZ")} MT!
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" /> Promete Pagar Até:
                    </label>
                    <input
                      type="date"
                      value={dueDate || ""}
                      onChange={(e) => onSetDueDate(e.target.value || null)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-500" /> Observações do Acordo:
                    </label>
                    <input
                      type="text"
                      value={saleNotes}
                      onChange={(e) => onSetSaleNotes(e.target.value)}
                      placeholder="Ex: Paga na sexta..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Forma de Entrada
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cash", label: "Dinheiro", icon: Banknote },
                  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
                  { id: "emola", label: "E-Mola", icon: Wallet },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onSetPaymentMethod(m.id)}
                      className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md font-bold"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              type="button"
              disabled={isLoading || cartItems.length === 0 || !selectedCustomer}
              onClick={handleSubmit}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] ${
                cartItems.length === 0 || !selectedCustomer
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : amountOwed === 0
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30"
                  : "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-amber-900/30"
              }`}
            >
              {isLoading ? (
                <span>A processar venda...</span>
              ) : amountOwed === 0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Concluir Venda à Vista ({cartSubtotal.toLocaleString("pt-MZ")} MT)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Registar Venda a Fiado (Deve {amountOwed.toLocaleString("pt-MZ")} MT)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
