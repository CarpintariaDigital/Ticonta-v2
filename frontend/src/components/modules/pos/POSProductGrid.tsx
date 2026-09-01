"use client";

import { useState, useMemo } from "react";
import { Search, Package, AlertTriangle } from "lucide-react";
import { Product } from "@/types/pos";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col h-full space-y-3.5 font-sans">
      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar produto, código SKU ou leitor..."
            className="pl-9 text-xs bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 shadow-sm"
          />
        </div>

        {/* Category Key Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-9 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-sm border border-emerald-600"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 text-[11px] shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl border border-zinc-200 bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-500 border-2 border-dashed border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
            <Package className="h-10 w-10 mb-2 stroke-1 text-zinc-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">NENHUM ARTIGO ENCONTRADO</p>
            <p className="text-[11px] text-zinc-500 mt-1">Ajuste os filtros de pesquisa ou categoria.</p>
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
                      ? "opacity-40 cursor-not-allowed border-zinc-200 bg-zinc-50"
                      : "cursor-pointer border border-zinc-200 bg-white hover:border-emerald-500 hover:shadow-md active:translate-y-0.5"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold text-zinc-600 border border-zinc-200 font-mono">
                        {product.sku}
                      </span>
                      {isLowStock && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          BAIXO
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-tight uppercase group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2.5 flex items-end justify-between border-t border-zinc-100 mt-2">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-tight font-medium">PREÇO UNIT.</p>
                      <p className="text-sm font-black text-emerald-700 font-mono">
                        {product.unit_price.toFixed(2)}{" "}
                        <span className="text-[9px] font-normal text-zinc-500">MT</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-zinc-600">
                        Qtd: <b className="text-zinc-900">{product.quantity}</b>
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
