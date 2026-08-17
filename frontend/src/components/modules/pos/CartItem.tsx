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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 transition-colors hover:border-zinc-700">
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-white">{item.product.name}</h4>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{item.unit_price.toFixed(2)} MZN</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">IVA {item.tax_rate}%</span>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
          className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-7 text-center text-xs font-bold text-white">{item.quantity}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={item.quantity >= item.product.quantity}
          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
          className="h-6 w-6 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Line Total */}
      <div className="w-20 text-right">
        <p className="text-sm font-bold text-white">{lineTotal.toFixed(2)}</p>
        <p className="text-[10px] text-zinc-500">MZN</p>
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.product.id)}
        className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
