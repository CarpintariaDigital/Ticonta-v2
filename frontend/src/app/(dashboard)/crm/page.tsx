"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  TrendingUp,
  Filter,
  DollarSign,
  Award,
  Clock,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import KanbanBoard from "@/components/modules/crm/KanbanBoard";
import LeadForm from "@/components/modules/crm/LeadForm";
import LeadDetails from "@/components/modules/crm/LeadDetails";
import { useCRM } from "@/hooks/useCRM";
import { CreateLeadInput, Lead, LeadSource, LeadStage } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CRMPage() {
  const {
    leads,
    selectedLead,
    pipeline,
    analytics,
    filters,
    isLoading,
    fetchLeads,
    createLead,
    moveLead,
    deleteLead,
    selectLead,
    setFilters,
    addInteraction,
  } = useCRM();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateLead = async (data: CreateLeadInput) => {
    await createLead(data);
    setShowCreateModal(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
        {/* Header */}
        <header className="border-b border-zinc-200 bg-white backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">CRM & Pipeline Comercial</h1>
              <p className="text-xs text-zinc-500">Gestão de Oportunidades e Funil de Vendas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeads}
              className="border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-800 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Novo Lead
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {/* KPI Analytics Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Pipeline Total (Carteira)
              </span>
              <p className="text-xl font-black text-white mt-1">
                {Number(pipeline?.total_pipeline_value || 0).toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
                Valor Ponderado Fecho
              </span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {Number(pipeline?.weighted_pipeline_value || 0).toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Taxa de Ganho (Win Rate)
              </span>
              <p className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <Award className="h-5 w-5 text-purple-400" />
                {analytics?.win_rate_percentage || 0}%
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Total de Oportunidades
              </span>
              <p className="text-xl font-black text-white mt-1">
                {leads.length}{" "}
                <span className="text-xs font-normal text-zinc-500">leads activos</span>
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Pesquisar por cliente, telefone ou email..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="bg-zinc-50 border-zinc-200 pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Canal:
              </span>
              <select
                value={filters.source || "all"}
                onChange={(e) => setFilters({ source: e.target.value as LeadSource | "all" })}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Todos os canais</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website</option>
                <option value="referral">Indicação</option>
                <option value="direct">Direto</option>
                <option value="phone">Telefone</option>
              </select>
            </div>
          </div>

          {/* Kanban Pipeline View */}
          <KanbanBoard
            leads={leads}
            onSelectLead={(lead) => selectLead(lead)}
            onMoveStage={(id, stage) => moveLead(id, stage)}
            onOpenNewLeadModal={() => setShowCreateModal(true)}
          />
        </main>

        {/* Modal: Novo Lead */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-zinc-200 pb-3">
                Registar Oportunidade Comercial (Novo Lead)
              </h3>
              <LeadForm onSubmit={handleCreateLead} onCancel={() => setShowCreateModal(false)} />
            </div>
          </div>
        )}

        {/* Modal: Detalhes & Timeline do Lead */}
        {selectedLead && (
          <LeadDetails
            lead={selectedLead}
            onClose={() => selectLead(null)}
            onMoveStage={async (id, stage) => {
              await moveLead(id, stage);
            }}
            onDeleteLead={async (id) => {
              await deleteLead(id);
              selectLead(null);
            }}
            onAddInteraction={async (leadId, data) => {
              return addInteraction(leadId, data);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
