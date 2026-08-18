"use client";

import { ShoppingBag, Trash2, Calculator } from "lucide-react";
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
    <div className="flex flex-col h-full chassis-panel p-4 space-y-3.5">
      {/* Cart Hardware Top Bar */}
      <div className="chassis-header">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b2d4f] text-[#2dc4a0] border border-[#2dc4a0]/40 shadow-inner">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
              Fita de Registo (POS)
            </h3>
            <p className="text-[10px] text-[#4a7a9b] font-mono">
              {summary.itemCount} artigo(s) na bobina
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="screws-cluster hidden sm:flex">
            <div className="screw" />
            <div className="screw" />
          </div>

          {cart.length > 0 && (
            <Button
              type="button"
              variant="retro-destructive"
              size="sm"
              onClick={onClearCart}
              className="text-[10px] h-7 px-2.5 uppercase tracking-wider font-mono"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              C LIMPAR
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items List with Tape Receipt Texture */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#4a7a9b] font-mono border-2 border-dashed border-[#1c3150] rounded-xl p-4">
            <ShoppingBag className="h-10 w-10 mb-2 stroke-1 text-[#2a466c]" />
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">BOBINA VAZIA</p>
            <p className="text-[11px] text-[#4a7a9b] mt-1">Toque nos produtos ou use o teclado para registar.</p>
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

      {/* Summary Box in Luminous VFD Display Style */}
      <div className="vfd-display p-3.5 space-y-2 text-xs font-mono">
        <div className="vfd-scanlines absolute inset-0 opacity-30" />
        
        <div className="flex justify-between text-[#4a7a9b] relative z-10">
          <span className="tracking-wider uppercase text-[10px]">SUBTOTAL (SEM IVA):</span>
          <span className="font-bold text-zinc-200">{summary.subtotal.toFixed(2)} MZN</span>
        </div>
        
        <div className="flex justify-between text-[#4a7a9b] relative z-10">
          <span className="tracking-wider uppercase text-[10px]">IVA ESTIMADO:</span>
          <span className="font-bold text-[#2dc4a0]">{summary.taxAmount.toFixed(2)} MZN</span>
        </div>
        
        {summary.discountAmount > 0 && (
          <div className="flex justify-between text-amber-400 relative z-10">
            <span className="tracking-wider uppercase text-[10px]">DESCONTO ({summary.discountPercentage}%):</span>
            <span className="font-bold">-{summary.discountAmount.toFixed(2)} MZN</span>
          </div>
        )}
        
        <div className="flex justify-between items-baseline border-t border-[#162942] pt-2 relative z-10">
          <span className="text-[11px] font-black text-zinc-300 uppercase tracking-widest">
            TOTAL A LIQUIDAR:
          </span>
          <span className="text-xl font-black vfd-text tracking-wider">
            {summary.netTotal.toFixed(2)}{" "}
            <span className="text-xs text-[#4a7a9b] font-normal">MZN</span>
          </span>
        </div>
      </div>
    </div>
  );
}

