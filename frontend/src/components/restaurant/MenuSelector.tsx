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
    if (!selectedItemForAdd) return;
    onAddItem(selectedItemForAdd.id, quantity, specialRequest || undefined);
    setSelectedItemForAdd(null);
  };

  return (
    <div className="flex flex-col h-full bg-white/85 rounded-2xl border border-emerald-900/10 p-4 backdrop-blur shadow-xs overflow-hidden">
      {/* Top Header with Close Button */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 shrink-0">
        <div>
          <h3 className="text-base font-black text-emerald-950 font-mono flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-700" />
            Adicionar Itens à Comanda
          </h3>
          <p className="text-xs text-zinc-500">
            Selecione uma categoria ou pesquise pelo nome do prato
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-full"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative my-3 shrink-0">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por prato, ingrediente, bebida..."
          className="pl-9 h-9 text-xs bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500 rounded-xl"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-700 text-white font-bold shadow-xs font-mono"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 border border-zinc-200"
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
              className={`group flex flex-col justify-between p-3.5 rounded-2xl border transition-all select-none ${
                item.available
                  ? "bg-white border-zinc-200 hover:border-emerald-500 hover:shadow-md cursor-pointer"
                  : "bg-zinc-100 border-zinc-200 opacity-50 cursor-not-allowed"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-zinc-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-mono text-zinc-500 border-zinc-200 bg-zinc-50">
                    <Clock className="w-2.5 h-2.5 mr-1 text-zinc-500" />
                    {item.preparation_time}m
                  </Badge>
                </div>

                {item.description && (
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Dietary Tags */}
                {item.dietary_info && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.dietary_info.split(",").map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Action Button */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100">
                <span className="font-black text-base text-emerald-800 font-mono">
                  {Number(item.price).toFixed(2)} MZN
                </span>

                {item.available ? (
                  <button className="h-7 w-7 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[10px] text-rose-600 font-medium">Esgotado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Item Addition Dialog (Quantity & Special Requests) */}
      {selectedItemForAdd && (
        <div className="fixed inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-emerald-900/10 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-emerald-950">
                  {selectedItemForAdd.name}
                </h3>
                <p className="text-xs text-emerald-700 font-mono mt-0.5 font-bold">
                  {Number(selectedItemForAdd.price).toFixed(2)} MZN / unidade
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-700 rounded-full"
                onClick={() => setSelectedItemForAdd(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-2 border-y border-zinc-200">
              <span className="text-xs font-semibold text-zinc-700">Quantidade:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-black text-emerald-950 w-6 text-center font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Special Request Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
                <span>Observações Especiais para a Cozinha:</span>
                <span className="text-[10px] text-zinc-500">Opcional</span>
              </label>
              <Input
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="Ex: Sem sal, Extra piripíri, Alergia a amendoim..."
                className="bg-white border-zinc-300 text-xs h-9 text-zinc-900 placeholder:text-zinc-500 rounded-xl"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["Sem sal", "Extra piripíri", "Bem passado", "Sem picante", "Limão à parte"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSpecialRequest((prev) => (prev ? `${prev}, ${tag}` : tag))}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 font-medium"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Total and Submit */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-medium">Total do Item</span>
                <div className="text-lg font-black text-emerald-800 font-mono">
                  {(Number(selectedItemForAdd.price) * quantity).toFixed(2)} MZN
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 text-zinc-700 rounded-xl"
                  onClick={() => setSelectedItemForAdd(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs"
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
