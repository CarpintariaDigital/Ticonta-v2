"use client";

import React, { useState, useMemo } from "react";
import { InformalCustomer } from "@/types/informal_sales";
import {
  Search,
  UserPlus,
  X,
  Phone,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react";

interface QuickCustomerSearchProps {
  customers: InformalCustomer[];
  selectedCustomer: InformalCustomer | null;
  onSelectCustomer: (customer: InformalCustomer | null) => void;
  onOpenNewCustomerModal: () => void;
}

export const QuickCustomerSearch: React.FC<QuickCustomerSearchProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onOpenNewCustomerModal,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers.slice(0, 8);
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
    );
  }, [customers, search]);

  return (
    <div className="relative w-full">
      {/* Selected Customer Bar */}
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-xl shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-md">
              {selectedCustomer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm md:text-base">
                  {selectedCustomer.name}
                </span>
                {selectedCustomer.verified && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Confiável
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                {selectedCustomer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> {selectedCustomer.phone}
                  </span>
                )}
                {selectedCustomer.location && (
                  <span className="flex items-center gap-1 hidden sm:flex">
                    <MapPin className="w-3 h-3 text-slate-500" /> {selectedCustomer.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {selectedCustomer.payment_reliability.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Saldo Devedor
              </span>
              <span
                className={`font-bold text-sm md:text-base ${
                  selectedCustomer.total_owed > 0 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {selectedCustomer.total_owed > 0
                  ? `${selectedCustomer.total_owed.toLocaleString("pt-MZ")} MT`
                  : "0 MT (Em dia)"}
              </span>
            </div>

            <button
              onClick={() => onSelectCustomer(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Trocar cliente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Pesquisar cliente por Nome, Telefone ou Bairro..."
              className="w-full pl-10 pr-24 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={onOpenNewCustomerModal}
              className="absolute right-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-30 max-h-72 overflow-y-auto backdrop-blur-xl divide-y divide-slate-800/80">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">Nenhum cliente encontrado com "{search}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenNewCustomerModal();
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Criar "{search}" agora
                    </button>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        onSelectCustomer(customer);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="w-full p-3 text-left hover:bg-slate-800/80 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 group-hover:border-indigo-500/50">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-indigo-300 flex items-center gap-2">
                            {customer.name}
                            {customer.verified && (
                              <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-400">
                                Confiável
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            {customer.phone && <span>{customer.phone}</span>}
                            {customer.location && <span>• {customer.location}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs font-bold ${
                            customer.total_owed > 0 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {customer.total_owed > 0
                            ? `Deve: ${customer.total_owed.toLocaleString("pt-MZ")} MT`
                            : "Em dia"}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{customer.payment_reliability.toFixed(1)}/5</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
