"use client";

import { useState, useMemo } from "react";
import { Search, Package, AlertTriangle, Box } from "lucide-react";
import { Product } from "@/types/pos";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface POSProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  isLoading?: boolean;
}

export default function POSProductGrid({ products, onSelectProduct, isLoading }: POSProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category || "Outros")));
    return ["Todas", ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat =
        selectedCategory === "Todas" || product.category === selectedCategory;
      return matchesSearch && matchesCat && product.active;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col h-full space-y-3.5 font-mono">
      {/* Search & Categories Bar with Hardware Feel */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#4a7a9b]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar produto, código SKU ou leitor..."
            className="pl-9 font-mono text-xs"
          />
        </div>

        {/* Category Mechanical Key Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`key-mechanical h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                selectedCategory === cat
                  ? "bg-[#1d9e75] text-white border-b-2 border-[#0f6e56] shadow-[0_2px_0_#085041]"
                  : "key-action text-[11px]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tactile Product Keys */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl border border-[#162942] bg-[#0c1626]/40 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-[#4a7a9b] border-2 border-dashed border-[#1c3150] rounded-xl p-4">
            <Package className="h-10 w-10 mb-2 stroke-1 text-[#2a466c]" />
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">NENHUM ARTIGO ENCONTRADO</p>
            <p className="text-[11px] text-[#4a7a9b] mt-1">Ajuste os filtros de pesquisa ou categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.quantity <= 0;
              const isLowStock = product.quantity > 0 && product.quantity <= 5;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && onSelectProduct(product)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-150 select-none ${
                    isOutOfStock
                      ? "opacity-40 cursor-not-allowed border-[#1c3150] bg-[#09121f]"
                      : "cursor-pointer border-2 border-[#162942] bg-gradient-to-b from-[#16253d] to-[#0f1b2d] hover:border-[#2dc4a0] hover:shadow-xl hover:shadow-[#2dc4a0]/10 active:translate-y-0.5"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="inline-block rounded bg-[#09121f] px-1.5 py-0.5 text-[9px] font-bold text-[#4a7a9b] border border-[#1c3150]">
                        {product.sku}
                      </span>
                      {isLowStock && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          BAIXO
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-zinc-100 line-clamp-2 leading-tight uppercase group-hover:text-[#2dc4a0] transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2.5 flex items-end justify-between border-t border-[#1c3150] mt-2">
                    <div>
                      <p className="text-[9px] text-[#4a7a9b] uppercase tracking-tight">PREÇO UNIT.</p>
                      <p className="text-sm font-black text-[#2dc4a0] vfd-text">
                        {product.unit_price.toFixed(2)}{" "}
                        <span className="text-[9px] font-normal text-[#4a7a9b]">MT</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-300">
                        Qtd: <b className="text-white">{product.quantity}</b>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

