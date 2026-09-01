"use client";

import React from "react";
import { Plus, Minus, Trash2, QrCode } from "lucide-react";
import { CartItem } from "@/types/barcode";

interface CartItemMobileProps {
  item: CartItem;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
  onRemove: (id: number) => void;
}

export const CartItemMobile: React.FC<CartItemMobileProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-3.5 bg-white/90 border border-zinc-200 rounded-xl hover:border-zinc-200 transition-all">
      {/* Thumbnail & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-10 w-10 shrink-0 bg-white border border-zinc-200 rounded-lg flex items-center justify-center text-zinc-500">
          <QrCode className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="min-w-0 pr-2">
          <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
          <p className="text-[11px] font-mono text-zinc-500">
            {item.barcode || item.sku} • {item.unit_price.toLocaleString("pt-MZ")} MZN
          </p>
        </div>
      </div>

      {/* Quantity & Subtotal */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5">
          <button
            onClick={() => onDecrement(item.product_id)}
            className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center font-mono">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrement(item.product_id)}
            className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="text-right min-w-[70px]">
          <span className="text-xs font-bold text-emerald-400 block font-mono">
            {item.total_price.toLocaleString("pt-MZ")} MZN
          </span>
        </div>

        <button
          onClick={() => onRemove(item.product_id)}
          className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
          title="Remover"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
