"use client";

import React, { useState } from "react";
import {
  Search,
  Clock,
  Plus,
  Minus,
  Check,
  X,
  Sparkles,
  Flame,
  Leaf,
  Fish,
  AlertCircle,
  Utensils,
  Coffee,
  IceCream,
  Sandwich,
  Wine,
} from "lucide-react";
import { MenuItem, MenuCategory } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MenuSelectorProps {
  menuItems: MenuItem[];
  activeCategory: MenuCategory | "all";
  onSelectCategory: (cat: MenuCategory | "all") => void;
  onAddItem: (menuItemId: number, quantity: number, specialRequests?: string) => void;
  onClose: () => void;
}

export default function MenuSelector({
  menuItems,
  activeCategory,
  onSelectCategory,
  onAddItem,
  onClose,
}: MenuSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedItemForAdd, setSelectedItemForAdd] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [specialRequest, setSpecialRequest] = useState("");

  const categories: Array<{ id: MenuCategory | "all"; label: string; icon: any }> = [
    { id: "all", label: "Cardápio Completo", icon: Utensils },
    { id: "appetizers", label: "Entradas", icon: Sandwich },
    { id: "mains", label: "Pratos Principais", icon: Flame },
    { id: "sides", label: "Acompanhamentos", icon: Leaf },
    { id: "drinks", label: "Bebidas & Bar", icon: Wine },
    { id: "desserts", label: "Sobremesas", icon: IceCream },
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = activeCategory === "all" || item.category === activeCategory;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      (item.dietary_info && item.dietary_info.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const handleOpenAddDialog = (item: MenuItem) => {
    if (!item.available) return;
    setSelectedItemForAdd(item);
    setQuantity(1);
    setSpecialRequest("");
  };

  const handleConfirmAdd = () => {
    if (selectedItemForAdd) {
      onAddItem(selectedItemForAdd.id, quantity, specialRequest.trim() || undefined);
      setSelectedItemForAdd(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/95 rounded-xl border border-zinc-800 p-4 backdrop-blur-md overflow-hidden select-none">
      {/* Header with Search and Close */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar pratos, bebidas ou alergias..."
            className="pl-9 bg-zinc-900 border-zinc-800 text-xs h-9 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 text-zinc-400 hover:text-white">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar shrink-0">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/50"
                  : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Menu Items Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 py-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenAddDialog(item)}
              className={`group flex flex-col justify-between p-3.5 rounded-xl border transition-all select-none ${
                item.available
                  ? "bg-zinc-900/60 border-zinc-800/90 hover:border-emerald-500/50 hover:bg-zinc-900/90 cursor-pointer hover:shadow-lg"
                  : "bg-zinc-950 border-zinc-800/40 opacity-50 cursor-not-allowed"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-mono text-zinc-400 border-zinc-700">
                    <Clock className="w-2.5 h-2.5 mr-1 text-zinc-400" />
                    {item.preparation_time}m
                  </Badge>
                </div>

                {item.description && (
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Dietary Tags */}
                {item.dietary_info && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.dietary_info.split(",").map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Action Button */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60">
                <span className="font-bold text-base text-emerald-400 font-mono">
                  {Number(item.price).toFixed(2)} MZN
                </span>

                {item.available ? (
                  <button className="h-7 w-7 rounded-lg bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[10px] text-red-400 font-medium">Esgotado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Addition Dialog (Quantity & Special Requests) */}
      {selectedItemForAdd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  {selectedItemForAdd.name}
                </h3>
                <p className="text-xs text-emerald-400 font-mono mt-0.5 font-semibold">
                  {Number(selectedItemForAdd.price).toFixed(2)} MZN / unidade
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400"
                onClick={() => setSelectedItemForAdd(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-2 border-y border-zinc-800">
              <span className="text-xs font-medium text-zinc-300">Quantidade:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold text-zinc-100 w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Special Request Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Observações Especiais para a Cozinha:</span>
                <span className="text-[10px] text-zinc-500">Opcional</span>
              </label>
              <Input
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="Ex: Sem sal, Extra piripíri, Alergia a amendoim..."
                className="bg-zinc-950 border-zinc-800 text-xs h-9 text-zinc-100 placeholder:text-zinc-600"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Sem sal", "Extra piripíri", "Bem passado", "Sem picante", "Limão à parte"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSpecialRequest((prev) => (prev ? `${prev}, ${tag}` : tag))}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Total and Submit */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400">Total do Item</span>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {(Number(selectedItemForAdd.price) * quantity).toFixed(2)} MZN
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300"
                  onClick={() => setSelectedItemForAdd(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  onClick={handleConfirmAdd}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar ao Pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
