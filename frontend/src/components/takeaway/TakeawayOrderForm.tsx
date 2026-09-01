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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-emerald-900/10 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-emerald-950 font-mono">Novo Pedido Takeaway & Entrega</h3>
              <p className="text-xs text-zinc-500">Balcão para viagem ou envio com estafeta</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Order Type Toggle (Takeaway vs Delivery) */}
          <div>
            <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-1.5 font-mono">
              Tipo de Encomenda *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  orderType === "takeaway"
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-xs font-mono"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Takeaway (Balcão)
              </button>

              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  orderType === "delivery"
                    ? "bg-sky-600 text-white border-sky-600 shadow-xs font-mono"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <Bike className="w-4 h-4" /> Delivery (Entrega ao Domicílio)
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Nome do Cliente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Dra. Teresa Silva"
                  className="pl-9 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-1">
                Telefone (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <Input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+258 84 000 0000"
                  className="pl-9 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Delivery Specific Fields */}
          {orderType === "delivery" && (
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl space-y-3">
              <div>
                <label className="text-xs font-bold text-sky-900 uppercase tracking-wider block mb-1 font-mono">
                  Endereço Completo de Entrega *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-sky-600" />
                  <Input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Bairro, Rua, Prédio/Casa, Ponto de Referência..."
                    className="pl-9 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-600 font-semibold block mb-1">Taxa de Entrega (MT)</label>
                  <Input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-600 font-semibold block mb-1">Horário Desejado</label>
                  <Input
                    type="datetime-local"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Menu Presets (1-Toque) */}
          <div>
            <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-1.5 font-mono">
              Adicionar do Menu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MENU_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(p)}
                  className="p-2.5 bg-zinc-50 border border-zinc-200 hover:border-emerald-500 hover:bg-white rounded-2xl text-left transition-all group flex flex-col justify-between shadow-2xs"
                >
                  <span className="text-xs font-semibold text-zinc-800 group-hover:text-emerald-800 line-clamp-1">
                    {p.name}
                  </span>
                  <span className="text-xs font-black text-emerald-800 mt-1 block font-mono">
                    {p.price.toLocaleString("pt-MZ")} MT
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Item Form */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              placeholder="Outro item personalizado..."
              className="flex-1 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs placeholder:text-zinc-500"
            />
            <Input
              type="number"
              value={customItemPrice}
              onChange={(e) => setCustomItemPrice(e.target.value)}
              placeholder="Preço"
              className="w-24 bg-white border-zinc-300 rounded-xl text-zinc-900 text-xs font-mono"
            />
            <Button
              type="button"
              onClick={handleAddCustom}
              className="bg-zinc-800 hover:bg-zinc-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          </div>

          {/* Items in Cart Table */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 max-h-44 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-3">Nenhum item no pedido.</p>
            ) : (
              items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white rounded-xl border border-zinc-200">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-zinc-900 block truncate">{it.item_name}</span>
                    <span className="text-zinc-500 text-[11px] font-mono">
                      {it.unit_price} MT x {it.quantity} ={" "}
                      <strong className="text-emerald-800">{it.unit_price * it.quantity} MT</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(idx, -1)}
                      className="w-6 h-6 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded flex items-center justify-center text-zinc-700 font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-black text-zinc-900 font-mono">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(idx, 1)}
                      className="w-6 h-6 bg-emerald-700 hover:bg-emerald-800 rounded flex items-center justify-center text-white font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-zinc-500 hover:text-rose-600 ml-1"
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
            <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block mb-1.5 font-mono">
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
                    className={`p-2.5 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all font-mono ${
                      isSelected
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                        : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
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
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal Itens:</span>
              <span className="font-mono font-medium">{subtotal.toLocaleString("pt-MZ")} MT</span>
            </div>
            {orderType === "delivery" && (
              <div className="flex justify-between text-zinc-500">
                <span>Taxa de Entrega:</span>
                <span className="font-mono font-medium">{calculatedDeliveryFee.toLocaleString("pt-MZ")} MT</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200 text-sm font-bold text-zinc-900">
              <span>Total da Encomenda:</span>
              <span className="text-base font-black text-emerald-800 font-mono">
                {total.toLocaleString("pt-MZ")} MT
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-300 text-zinc-700 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 font-mono"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isLoading ? "A registar pedido..." : "Confirmar e Enviar para Cozinha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
