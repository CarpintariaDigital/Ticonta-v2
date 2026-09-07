'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Ban,
  Mail,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import { AdminLicenseItem } from '@/services/admin_licensing';

interface LicenseListProps {
  licenses: AdminLicenseItem[];
  total: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  planFilter: string;
  setPlanFilter: (plan: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  search: string;
  setSearch: (search: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  order: 'asc' | 'desc';
  setOrder: (order: 'asc' | 'desc') => void;
  onOpenRenew: (license: AdminLicenseItem) => void;
  onOpenRevoke: (license: AdminLicenseItem) => void;
  onResendEmail: (id: number, email?: string) => Promise<any>;
  isLoading?: boolean;
}

export const LicenseList: React.FC<LicenseListProps> = ({
  licenses,
  total,
  page,
  totalPages,
  setPage,
  planFilter,
  setPlanFilter,
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  sortBy,
  setSortBy,
  order,
  setOrder,
  onOpenRenew,
  onOpenRevoke,
  onResendEmail,
  isLoading = false,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [emailSuccessId, setEmailSuccessId] = useState<number | null>(null);

  const handleCopy = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendEmail = async (id: number, email?: string) => {
    try {
      await onResendEmail(id, email);
      setEmailSuccessId(id);
      setTimeout(() => setEmailSuccessId(null), 2500);
    } catch {
      alert('Falha ao reenviar email.');
    }
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setOrder('desc');
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'complete':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'professional':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    }
  };

  const getStatusBadge = (status: string, daysRemaining: number) => {
    if (status === 'revoked') {
      return <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-full">Revogada</span>;
    }
    if (daysRemaining <= 0 || status === 'expired') {
      return <span className="px-2.5 py-1 bg-slate-700/50 text-zinc-500 border border-slate-600 text-xs font-semibold rounded-full">Expirada</span>;
    }
    if (daysRemaining <= 30) {
      return <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full">Expira em {daysRemaining}d</span>;
    }
    return <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full">Ativa ({daysRemaining}d)</span>;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
      {/* Barra de Filtros e Pesquisa */}
      <div className="p-5 border-b border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, ID ou chave..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-sm text-zinc-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filtro de Plano */}
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Todos os Planos</option>
            <option value="basic">Básico</option>
            <option value="professional">Profissional</option>
            <option value="complete">Completo</option>
            <option value="enterprise">Enterprise</option>
          </select>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-zinc-50/80 border border-zinc-200/80 rounded-xl text-xs font-medium text-zinc-800 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Todos os Estados</option>
            <option value="active">Ativas</option>
            <option value="expired">Expiradas</option>
            <option value="revoked">Revogadas</option>
          </select>
        </div>
      </div>

      {/* Tabela de Licenças */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-700">
          <thead className="bg-zinc-50/70 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
            <tr>
              <th
                onClick={() => handleSort('customer_name')}
                className="py-3.5 px-5 cursor-pointer hover:text-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Cliente
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort('plan')}
                className="py-3.5 px-4 cursor-pointer hover:text-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Plano
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-3.5 px-4">Chave de Ativação</th>
              <th
                onClick={() => handleSort('expires_at')}
                className="py-3.5 px-4 cursor-pointer hover:text-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Validade
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    A carregar licenças...
                  </div>
                </td>
              </tr>
            ) : licenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500">
                  Nenhuma licença encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              licenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-5">
                    <div className="font-semibold text-zinc-900">{lic.customer_name}</div>
                    <div className="text-xs text-zinc-500 font-mono">
                      ID: {lic.customer_id} {lic.customer_email && `• ${lic.customer_email}`}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase ${getPlanBadge(lic.plan)}`}>
                      {lic.plan}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-700 font-semibold bg-zinc-50/80 px-2.5 py-1 rounded-lg border border-zinc-200">
                        {lic.license_key}
                      </span>
                      <button
                        onClick={() => handleCopy(lic.id, lic.license_key)}
                        className="p-1.5 hover:bg-slate-800 text-zinc-500 hover:text-zinc-800 rounded-md transition-colors"
                        title="Copiar Chave"
                      >
                        {copiedId === lic.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-xs text-zinc-800 font-medium">
                      {new Date(lic.expires_at).toLocaleDateString('pt-MZ')}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Emitida: {new Date(lic.issued_at).toLocaleDateString('pt-MZ')}
                    </div>
                  </td>

                  <td className="py-4 px-4">{getStatusBadge(lic.status, lic.days_remaining)}</td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Renovar */}
                      <button
                        onClick={() => onOpenRenew(lic)}
                        className="p-2 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-colors"
                        title="Renovar Licença"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {/* Reenviar Email */}
                      <button
                        onClick={() => handleSendEmail(lic.id, lic.customer_email)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 rounded-xl transition-colors"
                        title="Reenviar Chave por Email"
                      >
                        {emailSuccessId === lic.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </button>

                      {/* Revogar */}
                      {lic.status !== 'revoked' && (
                        <button
                          onClick={() => onOpenRevoke(lic)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-colors"
                          title="Revogar Licença"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
        <div>
          A mostrar <span className="font-semibold text-zinc-800">{licenses.length}</span> de{' '}
          <span className="font-semibold text-zinc-800">{total}</span> licenças registadas
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-2 bg-zinc-50/80 border border-zinc-200 hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors text-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 bg-zinc-50/80 border border-zinc-200 rounded-xl text-zinc-800 font-semibold">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-2 bg-zinc-50/80 border border-zinc-200 hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-colors text-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
