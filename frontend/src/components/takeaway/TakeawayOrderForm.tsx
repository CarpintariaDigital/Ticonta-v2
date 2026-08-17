"use client";

import React, { useState } from "react";
import { TakeawayOrderCreate, TakeawayOrderItemInput, TakeawayType } from "@/types/takeaway";
import {
  ShoppingBag,
  Bike,
  Plus,
  Minus,
  Trash2,
  Phone,
  User,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Smartphone,
  Wallet,
  Banknote,
  CheckCircle2,
  X,
} from "lucide-react";

interface TakeawayOrderFormProps {
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: TakeawayOrderCreate) => Promise<any>;
}

const MENU_PRESETS = [
  { name: "Frango Zambeziano", price: 650 },
  { name: "Matapa com Camarão", price: 750 },
  { name: "Caril de Peixe da Costa", price: 800 },
  { name: "Prego no Prato Especial", price: 450 },
  { name: "Dose de Batata Frita", price: 200 },
  { name: "Salada Mista", price: 180 },
  { name: "Refresco Lata 330ml", price: 60 },
  { name: "Água Mineral 500ml", price: 40 },
];

export const TakeawayOrderForm: React.FC<TakeawayOrderFormProps> = ({
  isLoading,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<TakeawayType>("takeaway");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [deliveryFee, setDeliveryFee] = useState(150);

  const [items, setItems] = useState<TakeawayOrderItemInput[]>([
    { item_name: "Frango Zambeziano", quantity: 1, unit_price: 650 },
  ]);

  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  const handleAddPreset = (p: { name: string; price: number }) => {
    const existing = items.find((i) => i.item_name === p.name);
    if (existing) {
      setItems(
        items.map((i) => (i.item_name === p.name ? { ...i, quantity: i.quantity + 1 } : i))
      );
    } else {
      setItems([...items, { item_name: p.name, quantity: 1, unit_price: p.price }]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim() || !customItemPrice || parseFloat(customItemPrice) <= 0) return;
    setItems([
      ...items,
      { item_name: customItemName.trim(), quantity: 1, unit_price: parseFloat(customItemPrice) },
    ]);
    setCustomItemName("");
    setCustomItemPrice("");
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    setItems(
      items
        .map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unit_price, 0);
  const calculatedDeliveryFee = orderType === "delivery" ? deliveryFee : 0;
  const total = subtotal + calculatedDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Por favor informe o nome e telefone do cliente.");
      return;
    }
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      alert("O endereço de entrega é obrigatório para pedidos do tipo Delivery.");
      return;
    }
    if (items.length === 0) {
      alert("Adicione pelo menos um item ao pedido.");
      return;
    }

    const payload: TakeawayOrderCreate = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      order_type: orderType,
      delivery_address: orderType === "delivery" ? deliveryAddress.trim() : undefined,
      delivery_time: deliveryTime ? new Date(deliveryTime).toISOString() : null,
      special_instructions: specialInstructions.trim() || undefined,
      payment_method: paymentMethod,
      payment_status: "paid",
      items,
      delivery_fee: calculatedDeliveryFee,
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">Novo Pedido Takeaway & Entrega</h3>
              <p className="text-xs text-slate-400">Balcão para viagem ou envio com estafeta</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Order Type Toggle (Takeaway vs Delivery) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Tipo de Encomenda *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  orderType === "takeaway"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/40"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Takeaway (Levantamento no Balcão)
              </button>

              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  orderType === "delivery"
                    ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/40"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Bike className="w-4 h-4" /> Delivery (Entrega ao Domicílio)
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Nome do Cliente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Dra. Teresa Silva"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Telefone (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+258 84 000 0000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Specific Fields */}
          {orderType === "delivery" && (
            <div className="p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl space-y-3">
              <div>
                <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-1">
                  Endereço Completo de Entrega *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-purple-400" />
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Bairro, Rua, Prédio/Casa, Ponto de Referência..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Taxa de Entrega (MT)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Horário Desejado</label>
                  <input
                    type="datetime-local"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Menu Presets (1-Toque) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Adicionar do Menu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MENU_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(p)}
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-all group flex flex-col justify-between"
                >
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-1">
                    {p.name}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 mt-1 block">
                    {p.price.toLocaleString("pt-MZ")} MT
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Item Form */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              placeholder="Outro item personalizado..."
              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              value={customItemPrice}
              onChange={(e) => setCustomItemPrice(e.target.value)}
              placeholder="Preço"
              className="w-20 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>

          {/* Items in Cart Table */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 max-h-44 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3">Nenhum item no pedido.</p>
            ) : (
              items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-1.5 bg-slate-900 rounded-lg">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-white block truncate">{it.item_name}</span>
                    <span className="text-slate-400 text-[11px]">
                      {it.unit_price} MT x {it.quantity} ={" "}
                      <strong className="text-emerald-400">{it.unit_price * it.quantity} MT</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(idx, -1)}
                      className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-white">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(idx, 1)}
                      className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Meio de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "mpesa", label: "M-Pesa", icon: Smartphone },
                { id: "emola", label: "E-Mola", icon: Wallet },
                { id: "cash", label: "Dinheiro", icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-500 font-bold shadow-md"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal Itens:</span>
              <span>{subtotal.toLocaleString("pt-MZ")} MT</span>
            </div>
            {orderType === "delivery" && (
              <div className="flex justify-between text-slate-400">
                <span>Taxa de Entrega:</span>
                <span>{calculatedDeliveryFee.toLocaleString("pt-MZ")} MT</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-bold text-white">
              <span>Total da Encomenda:</span>
              <span className="text-base font-extrabold text-emerald-400">
                {total.toLocaleString("pt-MZ")} MT
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A registar pedido..." : "Confirmar e Enviar para Cozinha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
