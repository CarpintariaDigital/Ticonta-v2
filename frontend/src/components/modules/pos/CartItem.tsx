"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/pos";
import { Button } from "@/components/ui/button";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const lineTotal = item.unit_price * item.quantity;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#1c3150] bg-[#0c1626]/90 p-2.5 transition-all hover:border-[#2dc4a0]/50 shadow-sm font-mono">
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-xs font-bold text-zinc-900 uppercase tracking-tight">{item.product.name}</h4>
        <div className="flex items-center gap-1.5 text-[10px] text-[#4a7a9b] mt-0.5">
          <span>{item.unit_price.toFixed(2)} MZN</span>
          <span>•</span>
          <span className="text-[#2dc4a0] font-semibold">IVA {item.tax_rate}%</span>
        </div>
      </div>

      {/* Quantity Mechanical Tactile Buttons */}
      <div className="flex items-center gap-1 rounded-md border border-[#0d1d33] bg-[#07101d] p-0.5">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          className="h-6 w-6 rounded bg-[#16273e] hover:bg-[#1f3757] text-[#7ab3d4] flex items-center justify-center font-bold text-xs border-b-2 border-[#091320] active:translate-y-0.5 transition-all"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-6 text-center text-xs font-bold text-[#2dc4a0] font-mono">{item.quantity}</span>
        <button
          type="button"
          disabled={item.quantity >= item.product.quantity}
          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          className="h-6 w-6 rounded bg-[#16273e] hover:bg-[#1f3757] text-[#7ab3d4] flex items-center justify-center font-bold text-xs border-b-2 border-[#091320] active:translate-y-0.5 transition-all disabled:opacity-30"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Line Total in VFD monospace */}
      <div className="w-20 text-right">
        <p className="text-xs font-extrabold text-[#2dc4a0] tracking-tight">{lineTotal.toFixed(2)}</p>
        <p className="text-[9px] text-[#4a7a9b]">MZN</p>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(item.product.id)}
        className="h-7 w-7 rounded bg-[#441a1a]/40 hover:bg-[#5c2626] text-red-400 flex items-center justify-center border border-red-500/20 active:translate-y-0.5 transition-all"
        title="Remover Item"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

