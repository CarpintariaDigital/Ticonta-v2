"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Eye,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProjectForm from "@/components/modules/projects/ProjectForm";
import ProjectDashboard from "@/components/modules/projects/ProjectDashboard";
import { useProjects } from "@/hooks/useProjects";
import { CreateProjectInput, Project, ProjectStatus } from "@/types/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  const {
    projects,
    selectedProject,
    summary,
    statusFilter,
    searchQuery,
    isLoading,
    fetchProjects,
    loadProjectDetails,
    createProject,
    updateProject,
    selectProject,
    setStatusFilter,
    setSearchQuery,
    addTask,
    updateTask,
    addExpense,
  } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalBudget = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalActual = projects.reduce((acc, p) => acc + (Number(p.actual_cost) || 0), 0);
  const activeCount = projects.filter((p) => p.status === "active").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  const handleCreateProject = async (data: CreateProjectInput) => {
    await createProject(data);
    setShowCreateModal(false);
  };

  const getStatusBadge = (st: ProjectStatus) => {
    const map: Record<ProjectStatus, { label: string; style: string }> = {
      planning: { label: "Planeamento", style: "bg-blue-50 text-blue-800 border-blue-200" },
      active: { label: "Em Execução", style: "bg-amber-50 text-amber-800 border-amber-300" },
      completed: { label: "Concluído", style: "bg-emerald-50 text-emerald-800 border-emerald-300" },
      closed: { label: "Encerrado", style: "bg-zinc-100 text-zinc-700 border-zinc-200" },
    };
    const c = map[st] || map.planning;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border font-mono ${c.style}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 text-zinc-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-emerald-950 font-mono flex items-center gap-2">
              Obras & Gestão de Projetos
            </h1>
            <p className="text-xs text-zinc-500">Controle de Custos, Orçamentos e Cronogramas de Execução</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProjects}
            className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 text-xs rounded-xl shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs font-mono"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
            Orçamento Total da Carteira
          </span>
          <p className="text-xl font-black text-emerald-950 font-mono mt-1">
            {totalBudget.toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider">
            Obras em Execução
          </span>
          <p className="text-xl font-black text-amber-800 font-mono mt-1 flex items-center gap-1.5">
            <Clock className="h-5 w-5 text-amber-600" />
            {activeCount} projetos
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider">
            Projetos Concluídos
          </span>
          <p className="text-xl font-black text-emerald-800 font-mono mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            {completedCount} projetos
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-xs">
          <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
            Custos Totais Realizados
          </span>
          <p className="text-xl font-black text-zinc-900 font-mono mt-1">
            {totalActual.toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Pesquisar por nome da obra ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-zinc-300 pl-9 text-xs text-zinc-900 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-600 font-semibold">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">Todos os estados</option>
            <option value="planning">Planeamento</option>
            <option value="active">Em Execução</option>
            <option value="completed">Concluídos</option>
            <option value="closed">Encerrados</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs text-zinc-800">
            <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-600 border-b border-zinc-200 font-mono font-bold">
              <tr>
                <th className="py-3.5 px-4">Nome da Obra / Projeto</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Orçamento (MZN)</th>
                <th className="py-3.5 px-4 text-right">Custo Real</th>
                <th className="py-3.5 px-4 text-right">Lucro Previsto</th>
                <th className="py-3.5 px-4 text-center">Progresso</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                    Nenhum projeto cadastrado no sistema.
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const profit = Number(p.budget) - Number(p.actual_cost);
                  const isAlert = p.budget > 0 && p.actual_cost / p.budget >= 0.8;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 line-clamp-1">{p.name}</div>
                        {p.description && (
                          <div className="text-[11px] text-zinc-500 line-clamp-1">{p.description}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-900">
                        {Number(p.budget).toLocaleString("pt-MZ")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-500">
                        {Number(p.actual_cost).toLocaleString("pt-MZ")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={profit >= 0 ? "text-emerald-700" : "text-rose-600"}>
                          {profit.toLocaleString("pt-MZ")} MZN
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-zinc-200 overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-600 font-bold">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => loadProjectDetails(p.id)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs h-7 px-2.5 rounded-xl border border-zinc-200 font-medium"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Projeto */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-2xl space-y-4 text-zinc-900">
            <h3 className="text-base font-black text-emerald-950 border-b border-zinc-200 pb-3 font-mono">
              Cadastrar Novo Projeto / Contrato de Obra
            </h3>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Dashboard Detalhes do Projeto */}
      {selectedProject && (
        <ProjectDashboard
          project={selectedProject}
          summary={summary}
          onClose={() => selectProject(null)}
          onUpdateStatus={async (st) => {
            await updateProject(selectedProject.id, { status: st });
          }}
          onAddTask={async (data) => {
            return addTask(selectedProject.id, data);
          }}
          onUpdateTaskStatus={async (taskId, st) => {
            return updateTask(selectedProject.id, taskId, { status: st });
          }}
          onAddExpense={async (data) => {
            return addExpense(selectedProject.id, data);
          }}
        />
      )}
    </div>
  );
}
