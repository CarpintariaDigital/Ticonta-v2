"use client";

import { useState } from "react";
import { Plus, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { CreateTaskInput, ProjectTask, TaskStatus } from "@/types/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskBoardProps {
  projectId: number;
  tasks: ProjectTask[];
  onAddTask: (data: CreateTaskInput) => Promise<any>;
  onUpdateTaskStatus: (taskId: number, status: TaskStatus) => Promise<any>;
}

const TASK_COLUMNS: { id: TaskStatus; title: string; color: string; border: string; bg: string }[] = [
  { id: "pending", title: "A Fazer (Pendente)", color: "text-zinc-700", border: "border-zinc-200", bg: "bg-zinc-50" },
  { id: "in_progress", title: "Em Execução", color: "text-amber-800", border: "border-amber-200", bg: "bg-amber-50/50" },
  { id: "completed", title: "Concluído", color: "text-emerald-800", border: "border-emerald-200", bg: "bg-emerald-50/50" },
];

export default function TaskBoard({
  projectId,
  tasks,
  onAddTask,
  onUpdateTaskStatus,
}: TaskBoardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate || undefined,
    });
    setTitle("");
    setDescription("");
    setDueDate("");
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4 text-zinc-900">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
          Cronograma de Tarefas & Etapas da Obra
        </h4>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-2.5 font-bold rounded-xl shadow-xs font-mono"
        >
          <Plus className="h-3 w-3 mr-1" />
          Nova Tarefa
        </Button>
      </div>

      {/* Add Task Form Modal / Inline */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
          <span className="text-xs font-bold text-emerald-950 block font-mono">Adicionar Marco / Tarefa ao Projeto</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Título da tarefa (ex: Instalação de Caixilharia de Alumínio)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white border-zinc-300 text-xs text-zinc-900 rounded-xl"
            />
          </div>
          <textarea
            placeholder="Descrição ou especificações técnicas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-zinc-300 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="text-xs h-7 border-zinc-300 text-zinc-700 rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 font-bold rounded-xl font-mono shadow-xs">
              Guardar Tarefa
            </Button>
          </div>
        </form>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TASK_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className={`rounded-2xl border ${col.border} ${col.bg} p-3 flex flex-col space-y-2.5`}>
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                <span className={`text-[11px] font-bold ${col.color} uppercase tracking-wider font-mono`}>
                  {col.title}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">{colTasks.length}</span>
              </div>

              <div className="space-y-2 min-h-[150px]">
                {colTasks.length === 0 ? (
                  <div className="text-[11px] text-zinc-500 text-center py-6">Sem tarefas</div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-zinc-200 bg-white p-3 text-xs space-y-2 hover:border-zinc-300 shadow-2xs transition-colors"
                    >
                      <div className="font-bold text-zinc-900">{t.title}</div>
                      {t.description && <p className="text-[11px] text-zinc-500 font-sans">{t.description}</p>}

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px] text-zinc-500">
                        <span>{t.due_date ? `Prazo: ${t.due_date}` : "Sem prazo"}</span>

                        {/* Quick state change button */}
                        <div className="flex gap-1">
                          {t.status !== "pending" && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, "pending")}
                              className="px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
                            >
                              A Fazer
                            </button>
                          )}
                          {t.status !== "in_progress" && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, "in_progress")}
                              className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium"
                            >
                              Execução
                            </button>
                          )}
                          {t.status !== "completed" && (
                            <button
                              onClick={() => onUpdateTaskStatus(t.id, "completed")}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-medium"
                            >
                              Concluir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
