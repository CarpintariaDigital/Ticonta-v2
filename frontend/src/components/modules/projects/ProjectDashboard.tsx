"use client";

import { useState } from "react";
import { X, Calendar, DollarSign, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import {
  CreateExpenseInput,
  CreateTaskInput,
  Project,
  ProjectStatus,
  ProjectSummary,
  TaskStatus,
} from "@/types/projects";
import BudgetVsActual from "@/components/modules/projects/BudgetVsActual";
import TaskBoard from "@/components/modules/projects/TaskBoard";
import ExpenseTracker from "@/components/modules/projects/ExpenseTracker";
import { Button } from "@/components/ui/button";

interface ProjectDashboardProps {
  project: Project;
  summary: ProjectSummary | null;
  onClose: () => void;
  onUpdateStatus: (status: ProjectStatus) => Promise<void>;
  onAddTask: (data: CreateTaskInput) => Promise<any>;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<any>;
  onAddExpense: (data: CreateExpenseInput) => Promise<any>;
}

export default function ProjectDashboard({
  project,
  summary,
  onClose,
  onUpdateStatus,
  onAddTask,
  onUpdateTaskStatus,
  onAddExpense,
}: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "expenses">("overview");

  const STATUS_BADGES: Record<ProjectStatus, { label: string; style: string }> = {
    planning: { label: "Planeamento", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    active: { label: "Em Execução", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    completed: { label: "Concluído", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    closed: { label: "Encerrado", style: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-white">{project.name}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  STATUS_BADGES[project.status].style
                }`}
              >
                {STATUS_BADGES[project.status].label}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Início: {project.start_date || "N/A"} • Previsão Fim: {project.end_date || "N/A"} • Progresso:{" "}
              <b className="text-emerald-400">{project.progress}%</b>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Status State Switcher */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 bg-zinc-900/60 px-6 py-2">
          <span className="text-xs font-semibold text-zinc-400 mr-2">Estado da Obra:</span>
          {(["planning", "active", "completed", "closed"] as ProjectStatus[]).map((st) => (
            <button
              key={st}
              disabled={project.status === st}
              onClick={() => onUpdateStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                project.status === st
                  ? "bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed"
                  : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              {STATUS_BADGES[st].label}
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-950/40">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Visão Geral & Orçamento
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "tasks"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Tarefas & Cronograma ({project.tasks?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "expenses"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Custos & Despesas ({project.expenses?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && summary && (
            <div className="space-y-4">
              <BudgetVsActual summary={summary} />
              {project.description && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-1 text-xs">
                  <span className="font-bold text-zinc-400 uppercase tracking-wider block">
                    Escopo do Projeto
                  </span>
                  <p className="text-zinc-300">{project.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <TaskBoard
              projectId={project.id}
              tasks={project.tasks || []}
              onAddTask={onAddTask}
              onUpdateTaskStatus={onUpdateTaskStatus}
            />
          )}

          {activeTab === "expenses" && (
            <ExpenseTracker
              projectId={project.id}
              expenses={project.expenses || []}
              onAddExpense={onAddExpense}
            />
          )}
        </div>
      </div>
    </div>
  );
}
