"use client";

import React, { useState, useMemo } from "react";
import { InformalCustomer } from "@/types/informal_sales";
import {
  Search,
  Filter,
  Star,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  History,
  MessageCircle,
  AlertCircle,
  UserCheck,
  Plus,
} from "lucide-react";

interface CustomerDebitListProps {
  customers: InformalCustomer[];
  selectedCustomer: InformalCustomer | null;
  customerFilter: "all" | "with_debt" | "clean" | "overdue";
  onSelectCustomer: (customer: InformalCustomer) => void;
  onFilterChange: (filter: "all" | "with_debt" | "clean" | "overdue") => void;
  onOpenCollection: (customer: InformalCustomer) => void;
  onOpenHistory: (customer: InformalCustomer) => void;
  onOpenNewCustomer: () => void;
  onSendWhatsApp: (phone: string, name: string, owed: number) => void;
}

export const CustomerDebitList: React.FC<CustomerDebitListProps> = ({
  customers,
  selectedCustomer,
  customerFilter,
  onSelectCustomer,
  onFilterChange,
  onOpenCollection,
  onOpenHistory,
  onOpenNewCustomer,
  onSendWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"owed_desc" | "name_asc" | "score_desc">("owed_desc");

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Filter by Tab
    if (customerFilter === "with_debt") {
      result = result.filter((c) => c.total_owed > 0);
    } else if (customerFilter === "clean") {
      result = result.filter((c) => c.total_owed === 0);
    } else if (customerFilter === "overdue") {
      result = result.filter((c) => c.total_owed > 0 && c.payment_reliability < 3.5);
    }

    // Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === "owed_desc") {
      result.sort((a, b) => b.total_owed - a.total_owed);
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "score_desc") {
      result.sort((a, b) => b.payment_reliability - a.payment_reliability);
    }

    return result;
  }, [customers, customerFilter, searchTerm, sortBy]);

  const totalOwedAll = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.total_owed, 0);
  }, [customers]);

  return (
    <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-bold text-zinc-900">Clientes & Gestão de Fiado</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              {customers.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Total a receber na praça:{" "}
            <span className="font-bold text-rose-400">{totalOwedAll.toLocaleString("pt-MZ")} MT</span>
          </p>
        </div>

        <button
          onClick={onOpenNewCustomer}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="my-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Todos" },
            { id: "with_debt", label: "A Dever (Fiados)" },
            { id: "clean", label: "Em Dia (0 MT)" },
            { id: "overdue", label: "Em Risco / Atrasados" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                customerFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                  : "bg-slate-800/80 text-zinc-500 hover:text-zinc-800 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome, telefone ou bairro..."
              className="w-full pl-9 pr-3 py-2 bg-white/70 border border-zinc-200/80 rounded-xl text-zinc-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-2 bg-white/70 border border-zinc-200/80 rounded-xl text-zinc-900 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="owed_desc">Maior Dívida</option>
            <option value="name_asc">Nome (A-Z)</option>
            <option value="score_desc">Melhor Score</option>
          </select>
        </div>
      </div>

      {/* Customer Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px]">
        {filteredCustomers.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum cliente encontrado com este filtro.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const isSelected = selectedCustomer?.id === customer.id;
            return (
              <div
                key={customer.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50"
                    : "bg-zinc-50/70 border-zinc-200/80 hover:border-zinc-200 hover:bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Customer Info */}
                  <div
                    onClick={() => onSelectCustomer(customer)}
                    className="flex items-start gap-3 cursor-pointer flex-1"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center font-bold text-zinc-900 text-base shrink-0 shadow-md">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 text-sm md:text-base hover:text-indigo-300 transition-colors">
                          {customer.name}
                        </span>
                        {customer.verified && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            VIP
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 mt-1">
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-zinc-500" /> {customer.phone}
                          </span>
                        )}
                        {customer.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" /> {customer.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {customer.payment_reliability.toFixed(1)}/5
                        </span>
                      </div>

                      {customer.notes && (
                        <p className="text-[11px] text-zinc-500 mt-1.5 italic line-clamp-1 bg-white px-2 py-0.5 rounded border border-zinc-200">
                          "{customer.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial Status & Quick Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                        Saldo a Pagar
                      </span>
                      <span
                        className={`text-base font-extrabold block ${
                          customer.total_owed > 0 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {customer.total_owed > 0
                          ? `${customer.total_owed.toLocaleString("pt-MZ")} MT`
                          : "0 MT"}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        Limite: {customer.trusted_credit_limit.toLocaleString("pt-MZ")} MT
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {customer.total_owed > 0 && (
                        <button
                          onClick={() => onOpenCollection(customer)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow active:scale-95 transition-all flex items-center gap-1"
                        >
                          <DollarSign className="w-3.5 h-3.5" /> Cobrar
                        </button>
                      )}

                      <button
                        onClick={() => onOpenHistory(customer)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-zinc-700 hover:text-zinc-900 rounded-lg text-xs border border-zinc-200 transition-colors"
                        title="Ver Histórico de Fiados"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {customer.phone && customer.total_owed > 0 && (
                        <button
                          onClick={() => onSendWhatsApp(customer.phone!, customer.name, customer.total_owed)}
                          className="p-2 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 rounded-lg text-xs border border-emerald-600/40 transition-colors"
                          title="Lembrar via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
