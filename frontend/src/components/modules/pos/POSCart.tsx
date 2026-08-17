"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import { CartItem, SaleSummary } from "@/types/pos";
import CartItemRow from "./CartItem";
import { Button } from "@/components/ui/button";

interface POSCartProps {
  cart: CartItem[];
  summary: SaleSummary;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export default function POSCart({
  cart,
  summary,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: POSCartProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-4 space-y-4">
      {/* Cart Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Carrinho de Compras</h3>
            <p className="text-xs text-zinc-400">{summary.itemCount} artigo(s)</p>
          </div>
        </div>

        {cart.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 h-7 px-2"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-500">
            <ShoppingBag className="h-10 w-10 mb-2 stroke-1 text-zinc-600" />
            <p className="text-sm font-medium">Carrinho vazio</p>
            <p className="text-xs text-zinc-600">Clique nos produtos para adicionar à venda.</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
            />
          ))
        )}
      </div>

      {/* Summary Box */}
      <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal (sem IVA):</span>
          <span className="font-semibold text-zinc-200">{summary.subtotal.toFixed(2)} MZN</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>IVA Estimado:</span>
          <span className="font-semibold text-emerald-400">{summary.taxAmount.toFixed(2)} MZN</span>
        </div>
        {summary.discountAmount > 0 && (
          <div className="flex justify-between text-amber-400">
            <span>Desconto ({summary.discountPercentage}%):</span>
            <span className="font-semibold">-{summary.discountAmount.toFixed(2)} MZN</span>
          </div>
        )}
        <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-extrabold text-white">
          <span>TOTAL A PAGAR:</span>
          <span className="text-base text-emerald-400">{summary.netTotal.toFixed(2)} MZN</span>
        </div>
      </div>
    </div>
  );
}
