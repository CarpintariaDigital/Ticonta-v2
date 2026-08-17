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
      planning: { label: "Planeamento", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      active: { label: "Em Execução", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
      completed: { label: "Concluído", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
      closed: { label: "Encerrado", style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
    };
    const c = map[st] || map.planning;
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${c.style}`}>
        {c.label}
      </span>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {/* Top Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Obras & Gestão de Projetos</h1>
              <p className="text-xs text-zinc-400">Controle de Custos, Orçamentos e Cronogramas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProjects}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs"
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
              Novo Projeto
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          {/* Summary KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
                Orçamento Total em Carteira
              </span>
              <p className="text-xl font-black text-white mt-1">
                {totalBudget.toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-amber-400 font-medium uppercase tracking-wider">
                Obras em Execução Ativa
              </span>
              <p className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <Clock className="h-5 w-5 text-amber-400" />
                {activeCount} projetos
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
                Projetos Concluídos
              </span>
              <p className="text-xl font-black text-white mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                {completedCount} projetos
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
                Custos Totais Realizados
              </span>
              <p className="text-xl font-black text-white mt-1">
                {totalActual.toLocaleString("pt-MZ")}{" "}
                <span className="text-xs font-normal text-zinc-500">MZN</span>
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Pesquisar por nome da obra ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border-zinc-800 pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-zinc-400 font-semibold">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs text-zinc-300">
                <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-mono">
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
                <tbody className="divide-y divide-zinc-800/40">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                        Nenhum projeto cadastrado no sistema.
                      </td>
                    </tr>
                  ) : (
                    projects.map((p) => {
                      const profit = Number(p.budget) - Number(p.actual_cost);
                      const isAlert = p.budget > 0 && p.actual_cost / p.budget >= 0.8;

                      return (
                        <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white line-clamp-1">{p.name}</div>
                            {p.description && (
                              <div className="text-[11px] text-zinc-500 line-clamp-1">{p.description}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">{getStatusBadge(p.status)}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                            {Number(p.budget).toLocaleString("pt-MZ")}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-300">
                            {Number(p.actual_cost).toLocaleString("pt-MZ")}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold">
                            <span className={profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                              {profit.toLocaleString("pt-MZ")} MZN
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${p.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400">{p.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Button
                              size="sm"
                              onClick={() => loadProjectDetails(p.id)}
                              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs h-7 px-2.5"
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
        </main>

        {/* Modal Novo Projeto */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">
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
    </ProtectedRoute>
  );
}
