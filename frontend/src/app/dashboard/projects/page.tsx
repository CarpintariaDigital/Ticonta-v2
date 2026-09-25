'use client';

import React, { useEffect, useState } from 'react';
import {
  HardHat,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Layers,
  Trash2,
  PieChart,
} from 'lucide-react';
import { useProjectsStore } from '@/store/projects.store';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ProjectStatus, TaskStatus } from '@/types/projects';

export default function ProjectsPage() {
  const {
    projects,
    selectedProject,
    summary,
    isLoading,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    addTask,
    updateTaskStatus,
    deleteTask,
    addExpense,
  } = useProjectsStore();

  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'reports'>('list');

  // Modals
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewExpenseModalOpen, setIsNewExpenseModalOpen] = useState(false);

  // New Project Form
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projBudget, setProjBudget] = useState('');
  const [projStartDate, setProjStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [projEndDate, setProjEndDate] = useState('');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // New Expense Form
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('material');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = async (id: number) => {
    await fetchProjectById(id);
    setCurrentView('detail');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projBudget) return;
    try {
      const created = await createProject({
        name: projName,
        description: projDesc || undefined,
        budget: parseFloat(projBudget),
        start_date: projStartDate || undefined,
        end_date: projEndDate || undefined,
      });
      setIsNewProjectModalOpen(false);
      setProjName('');
      setProjDesc('');
      setProjBudget('');
      handleSelectProject(created.id);
    } catch (err) {
      // Handled
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !taskTitle) return;
    try {
      await addTask(selectedProject.id, {
        title: taskTitle,
        description: taskDesc || undefined,
        due_date: taskDueDate || undefined,
        status: 'pending',
      });
      setIsNewTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
    } catch (err) {
      // Handled
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !expDesc || !expAmount) return;
    try {
      await addExpense(selectedProject.id, {
        description: expDesc,
        amount: parseFloat(expAmount),
        category: expCategory,
        date: expDate,
      });
      setIsNewExpenseModalOpen(false);
      setExpDesc('');
      setExpAmount('');
    } catch (err) {
      // Handled
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active': return <Badge variant="info">EM CURSO</Badge>;
      case 'planning': return <Badge variant="warning">ORÇAMENTAÇÃO</Badge>;
      case 'completed': return <Badge variant="success">CONCLUÍDO</Badge>;
      case 'closed': return <Badge variant="neutral">ENCERRADO</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <HardHat className="w-7 h-7 text-amber-600" />
            Gestão de Projetos, Obras & Serviços
          </h1>
          <p className="text-sm text-neutral-500">
            Controlo de obras, marcenaria e empreitadas: orçamentos, despesas reais por categoria e Kanban de tarefas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
          >
            <Plus size={15} />
            Novo Projeto / Obra
          </Button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setCurrentView('list')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            currentView === 'list'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Lista de Projetos ({projects.length})
        </button>
        {selectedProject && (
          <button
            onClick={() => setCurrentView('detail')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              currentView === 'detail'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Painel da Obra: {selectedProject.name}
          </button>
        )}
        <button
          onClick={() => setCurrentView('reports')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            currentView === 'reports'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Relatório de Rentabilidade
        </button>
      </div>

      {/* VISTA 1: LISTA DE PROJETOS */}
      {currentView === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Input
              placeholder="Pesquisar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72"
            />
            <select
              className="border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os Estados</option>
              <option value="planning">Em Orçamentação</option>
              <option value="active">Em Curso / Ativo</option>
              <option value="completed">Concluído</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const burnRate = p.budget > 0 ? ((p.actual_cost || 0) / p.budget) * 100 : 0;
              return (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800"
                  onClick={() => handleSelectProject(p.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-bold truncate">{p.name}</CardTitle>
                    {getStatusBadge(p.status)}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-neutral-500 line-clamp-2">
                      {p.description || 'Sem descrição cadastrada'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-500 block">Orçamento:</span>
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatMZN(p.budget)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Gasto Real:</span>
                        <span className={`font-bold ${burnRate > 95 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {formatMZN(p.actual_cost || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-500">Progresso da Obra</span>
                        <span className="font-bold">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                      <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        Abrir Obra <ArrowRight size={13} />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredProjects.length === 0 && (
              <div className="col-span-full text-center py-12 text-neutral-400">
                Nenhum projeto encontrado. Clica em &ldquo;Novo Projeto / Obra&rdquo; para iniciar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 2: DASHBOARD DO PROJETO SELECIONADO */}
      {currentView === 'detail' && selectedProject && (
        <div className="space-y-6">
          {/* Project Header KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Orçamento Previsto</span>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatMZN(selectedProject.budget)}</div>
                <span className="text-xs text-neutral-400">Teto aprovado pelo cliente</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Gasto Realizado</span>
                <div className="text-2xl font-bold text-red-600">{formatMZN(selectedProject.actual_cost || 0)}</div>
                <span className="text-xs text-neutral-400">Materiais, mão-de-obra e outros</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Saldo Disponível</span>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatMZN(Math.max(0, selectedProject.budget - (selectedProject.actual_cost || 0)))}
                </div>
                <span className="text-xs text-neutral-400">Margem restante</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Progresso Físico</span>
                <div className="text-2xl font-bold text-amber-600">{selectedProject.progress}%</div>
                <span className="text-xs text-neutral-400">
                  {selectedProject.tasks?.filter((t) => t.status === 'completed').length || 0} de {selectedProject.tasks?.length || 0} Tarefas
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Kanban de Tarefas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <CardTitle className="text-base">Quadro Kanban de Tarefas da Obra</CardTitle>
                <p className="text-xs text-neutral-500">Acompanhamento visual do fluxo de trabalho</p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsNewTaskModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus size={14} className="mr-1" />
                Nova Tarefa
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Coluna 1: A Fazer / Pendente */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="font-bold text-xs uppercase text-neutral-600 dark:text-neutral-400">A Fazer / Pendente</span>
                    <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded-full font-bold">
                      {selectedProject.tasks?.filter((t) => t.status === 'pending').length || 0}
                    </span>
                  </div>
                  {selectedProject.tasks?.filter((t) => t.status === 'pending').map((t) => (
                    <div key={t.id} className="p-3 bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-2">
                      <div className="font-semibold text-sm">{t.title}</div>
                      {t.description && <p className="text-xs text-neutral-500">{t.description}</p>}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[11px] text-neutral-400">{t.due_date || 'Sem prazo'}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(selectedProject.id, t.id, 'in_progress')}
                          className="text-[11px] h-6 px-2 text-amber-600"
                        >
                          Iniciar ➔
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coluna 2: Em Curso */}
                <div className="bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/40 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-amber-200 dark:border-amber-800">
                    <span className="font-bold text-xs uppercase text-amber-700 dark:text-amber-400">Em Curso</span>
                    <span className="text-xs bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded-full font-bold">
                      {selectedProject.tasks?.filter((t) => t.status === 'in_progress').length || 0}
                    </span>
                  </div>
                  {selectedProject.tasks?.filter((t) => t.status === 'in_progress').map((t) => (
                    <div key={t.id} className="p-3 bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-amber-200 dark:border-amber-700 space-y-2">
                      <div className="font-semibold text-sm">{t.title}</div>
                      {t.description && <p className="text-xs text-neutral-500">{t.description}</p>}
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[11px] text-neutral-400">{t.due_date || 'Sem prazo'}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(selectedProject.id, t.id, 'completed')}
                          className="text-[11px] h-6 px-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        >
                          Concluir ✓
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coluna 3: Concluído */}
                <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-emerald-200 dark:border-emerald-800">
                    <span className="font-bold text-xs uppercase text-emerald-700 dark:text-emerald-400">Concluído</span>
                    <span className="text-xs bg-emerald-200 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full font-bold">
                      {selectedProject.tasks?.filter((t) => t.status === 'completed').length || 0}
                    </span>
                  </div>
                  {selectedProject.tasks?.filter((t) => t.status === 'completed').map((t) => (
                    <div key={t.id} className="p-3 bg-white dark:bg-neutral-800 rounded-md shadow-sm border border-neutral-200 dark:border-neutral-700 space-y-2 opacity-80">
                      <div className="font-semibold text-sm line-through text-neutral-500">{t.title}</div>
                      <div className="flex justify-end">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Despesas da Obra */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <CardTitle className="text-base">Despesas e Custos Diretos Lançados</CardTitle>
                <p className="text-xs text-neutral-500">Materiais, salários de operários e transportes</p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsNewExpenseModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus size={14} className="mr-1" />
                Lançar Despesa
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                  <tr>
                    <th className="p-3 pl-4">Data</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Descrição</th>
                    <th className="p-3 text-right pr-4">Valor (MZN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {selectedProject.expenses?.map((exp) => (
                    <tr key={exp.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 pl-4 text-xs text-neutral-500">{exp.date}</td>
                      <td className="p-3">
                        <Badge variant="neutral">{exp.category?.toUpperCase()}</Badge>
                      </td>
                      <td className="p-3 font-medium">{exp.description}</td>
                      <td className="p-3 text-right pr-4 font-bold text-red-600">{formatMZN(exp.amount)}</td>
                    </tr>
                  ))}
                  {(!selectedProject.expenses || selectedProject.expenses.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-neutral-400">
                        Nenhuma despesa lançada nesta obra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VISTA 3: RELATÓRIOS GERAIS */}
      {currentView === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidade e Análise Global de Obras</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                <tr>
                  <th className="p-3 pl-4">Projeto</th>
                  <th className="p-3 text-right">Orçamento</th>
                  <th className="p-3 text-right">Gasto Real</th>
                  <th className="p-3 text-right">Margem / Saldo</th>
                  <th className="p-3 text-center">Progresso</th>
                  <th className="p-3 pr-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {projects.map((p) => {
                  const saldo = p.budget - (p.actual_cost || 0);
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 pl-4 font-semibold">{p.name}</td>
                      <td className="p-3 text-right">{formatMZN(p.budget)}</td>
                      <td className="p-3 text-right text-red-600 font-medium">{formatMZN(p.actual_cost || 0)}</td>
                      <td className={`p-3 text-right font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatMZN(saldo)}
                      </td>
                      <td className="p-3 text-center font-semibold">{p.progress}%</td>
                      <td className="p-3 pr-4 text-center">{getStatusBadge(p.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* MODAL: NOVO PROJETO */}
      {isNewProjectModalOpen && (
        <Modal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          title="Registar Novo Projeto / Obra"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Projeto / Obra</label>
              <Input
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="Ex: Construção Residencial Matola"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Orçamento Total Aprovado (MZN)</label>
              <Input
                type="number"
                step="500"
                value={projBudget}
                onChange={(e) => setProjBudget(e.target.value)}
                placeholder="Ex: 250000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição do Escopo</label>
              <Input
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                placeholder="Ex: Alvenaria, marcenaria embutida e acabamentos"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data de Início</label>
                <Input
                  type="date"
                  value={projStartDate}
                  onChange={(e) => setProjStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Previsão de Conclusão</label>
                <Input
                  type="date"
                  value={projEndDate}
                  onChange={(e) => setProjEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewProjectModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Criar Projeto
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: NOVA TAREFA */}
      {isNewTaskModalOpen && (
        <Modal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          title="Adicionar Tarefa ao Projeto"
        >
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título da Tarefa</label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ex: Montagem das portas e armários"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Detalhes (opcional)</label>
              <Input
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Instruções para o encarregado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Limite</label>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewTaskModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                Guardar Tarefa
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: LANÇAR DESPESA */}
      {isNewExpenseModalOpen && (
        <Modal
          isOpen={isNewExpenseModalOpen}
          onClose={() => setIsNewExpenseModalOpen(false)}
          title="Lançar Custo / Despesa na Obra"
        >
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Descrição do Gasto</label>
              <Input
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="Ex: Compra de 50 sacos de cimento"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor (MZN)</label>
                <Input
                  type="number"
                  step="50"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="25000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                >
                  <option value="material">Matérias-Primas / Materiais</option>
                  <option value="labor">Mão-de-Obra / Diárias</option>
                  <option value="equipment">Equipamentos e Máquinas</option>
                  <option value="transport">Transporte / Frete</option>
                  <option value="other">Outros Custos</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data do Gasto</label>
              <Input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewExpenseModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Registar Custo
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
