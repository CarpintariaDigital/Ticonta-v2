"use client";

import { useState, useMemo } from "react";
import { Search, Package, PlusCircle, AlertTriangle, Layers } from "lucide-react";
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
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar produto ou código SKU..."
            className="bg-zinc-900 border-zinc-800 pl-9 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
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
              <div key={i} className="h-36 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-500">
            <Package className="h-10 w-10 mb-2 stroke-1" />
            <p className="text-sm font-medium">Nenhum produto encontrado</p>
            <p className="text-xs text-zinc-600">Tente ajustar a pesquisa ou categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.quantity <= 0;
              const isLowStock = product.quantity > 0 && product.quantity <= 5;

              return (
                <Card
                  key={product.id}
                  onClick={() => !isOutOfStock && onSelectProduct(product)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isOutOfStock
                      ? "opacity-50 cursor-not-allowed border-zinc-800/60 bg-zinc-900/30"
                      : "border-zinc-800/80 bg-zinc-900/70 hover:border-emerald-500/60 hover:bg-zinc-900 hover:shadow-lg hover:shadow-emerald-950/20 active:scale-[0.98]"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <span className="inline-block rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
                        {product.sku}
                      </span>
                      {isLowStock && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" />
                          Baixo
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-3 flex items-end justify-between border-t border-zinc-800/60 mt-2">
                    <div>
                      <p className="text-xs text-zinc-500 leading-none">Preço</p>
                      <p className="text-base font-extrabold text-white">
                        {product.unit_price.toFixed(2)}{" "}
                        <span className="text-[10px] font-normal text-zinc-400">MZN</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-medium text-zinc-400">
                        Qtd: <b className="text-zinc-200">{product.quantity}</b>
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
