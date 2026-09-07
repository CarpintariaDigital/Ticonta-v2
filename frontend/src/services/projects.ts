import { apiClient } from "@/services/auth";
import {
  CreateExpenseInput,
  CreateProjectInput,
  CreateTaskInput,
  Project,
  ProjectExpense,
  ProjectStatus,
  ProjectSummary,
  ProjectTask,
  TaskStatus,
} from "@/types/projects";

export const defaultProjects: Project[] = [
  {
    id: 1,
    company_id: 1,
    name: "Construção de Pavilhão Industrial Matola",
    description: "Obra civil completa de alvenaria, cobertura metálica e piso epóxi de alta resistência",
    status: "active",
    budget: 850000,
    actual_cost: 495000,
    progress: 60,
    start_date: "2026-07-01",
    end_date: "2026-11-30",
    created_at: "2026-07-01T08:00:00Z",
    updated_at: "2026-08-14T14:00:00Z",
    tasks: [
      { id: 1, project_id: 1, title: "Fundações e Sapatas", status: "completed", due_date: "2026-07-20", created_at: "" },
      { id: 2, project_id: 1, title: "Alvenaria e Pilares", status: "completed", due_date: "2026-08-05", created_at: "" },
      { id: 3, project_id: 1, title: "Montagem da Estrutura Metálica", status: "in_progress", due_date: "2026-08-25", created_at: "" },
      { id: 4, project_id: 1, title: "Instalação Elétrica e Iluminação", status: "pending", due_date: "2026-09-15", created_at: "" },
      { id: 5, project_id: 1, title: "Pintura e Piso Epóxi", status: "pending", due_date: "2026-10-10", created_at: "" },
    ],
    expenses: [
      { id: 1, project_id: 1, description: "Cimento 50kg (300 sacos) e Brita", amount: 165000, category: "material", date: "2026-07-10", created_at: "" },
      { id: 2, project_id: 1, description: "Vigas e Perfis de Aço Galvanizado", amount: 210000, category: "material", date: "2026-07-28", created_at: "" },
      { id: 3, project_id: 1, description: "Pagamento Encarregado e Pedreiros (Mês Julho)", amount: 80000, category: "labor", date: "2026-07-31", created_at: "" },
      { id: 4, project_id: 1, description: "Aluguer de Betoneira e Andaimes", amount: 40000, category: "equipment", date: "2026-08-02", created_at: "" },
    ],
  },
  {
    id: 2,
    company_id: 1,
    name: "Mobiliário por Medida - Sede Bancária",
    description: "Fabrico e montagem de balcões em madeira maciça e divisórias de vidro",
    status: "active",
    budget: 320000,
    actual_cost: 145000,
    progress: 75,
    start_date: "2026-08-01",
    end_date: "2026-09-15",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-14T10:00:00Z",
    tasks: [
      { id: 6, project_id: 2, title: "Corte e Tratamento de Madeira", status: "completed", due_date: "2026-08-08", created_at: "" },
      { id: 7, project_id: 2, title: "Envernizamento e Montagem Prévia", status: "completed", due_date: "2026-08-14", created_at: "" },
      { id: 8, project_id: 2, title: "Transporte e Instalação no Local", status: "in_progress", due_date: "2026-08-28", created_at: "" },
      { id: 9, project_id: 2, title: "Vistoria e Entrega ao Cliente", status: "pending", due_date: "2026-09-05", created_at: "" },
    ],
    expenses: [
      { id: 5, project_id: 2, description: "Madeira Chanfuta e Pranchas", amount: 95000, category: "material", date: "2026-08-03", created_at: "" },
      { id: 6, project_id: 2, description: "Vernizes, Dobradiças e Puxadores", amount: 30000, category: "material", date: "2026-08-07", created_at: "" },
      { id: 7, project_id: 2, description: "Frete e Transporte Especializado", amount: 20000, category: "transport", date: "2026-08-12", created_at: "" },
    ],
  },
  {
    id: 3,
    company_id: 1,
    name: "Reforma de Cobertura e Pintura Zimpeto",
    description: "Substituição de chapas de zinco e impermeabilização de laje",
    status: "completed",
    budget: 180000,
    actual_cost: 135000,
    progress: 100,
    start_date: "2026-06-01",
    end_date: "2026-07-15",
    created_at: "2026-06-01T08:00:00Z",
    updated_at: "2026-07-15T18:00:00Z",
    tasks: [],
    expenses: [
      { id: 8, project_id: 3, description: "Chapas IBR e Parafusos", amount: 85000, category: "material", date: "2026-06-05", created_at: "" },
      { id: 9, project_id: 3, description: "Mão de Obra de Telhadores", amount: 50000, category: "labor", date: "2026-07-10", created_at: "" },
    ],
  },
];

export const projectService = {
  async getProjects(filters?: { status?: ProjectStatus; search?: string }): Promise<Project[]> {
    try {
      let url = "/api/v1/projects?company_id=1";
      if (filters?.status) url += `&status=${filters.status}`;
      if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;

      const response = await apiClient.get<Project[]>(url);
      return response.data;
    } catch {
      return defaultProjects;
    }
  },

  async getProject(id: number): Promise<Project> {
    const response = await apiClient.get<Project>(`/api/v1/projects/${id}?company_id=1`);
    return response.data;
  },

  async createProject(data: CreateProjectInput): Promise<Project> {
    const response = await apiClient.post<Project>("/api/v1/projects", data);
    return response.data;
  },

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.put<Project>(`/api/v1/projects/${id}?company_id=1`, data);
    return response.data;
  },

  async deleteProject(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/projects/${id}?company_id=1`);
  },

  async getProjectSummary(id: number): Promise<ProjectSummary> {
    try {
      const response = await apiClient.get<ProjectSummary>(`/api/v1/projects/${id}/summary?company_id=1`);
      return response.data;
    } catch {
      const p = defaultProjects.find((x) => x.id === id) || defaultProjects[0];
      const actual = p.actual_cost;
      const budget = p.budget;
      const profit = budget - actual;
      const pct = budget > 0 ? (actual / budget) * 100 : 0;
      return {
        project_id: p.id,
        name: p.name,
        status: p.status,
        budget,
        actual_cost: actual,
        remaining_budget: profit,
        profit,
        budget_used_percentage: Math.round(pct),
        progress_percentage: p.progress,
        is_over_budget: actual > budget,
        budget_alert: pct >= 80,
        total_tasks: p.tasks.length,
        completed_tasks: p.tasks.filter((t) => t.status === "completed").length,
      };
    }
  },

  async addTask(projectId: number, data: CreateTaskInput): Promise<ProjectTask> {
    const response = await apiClient.post<ProjectTask>(`/api/v1/projects/${projectId}/tasks?company_id=1`, data);
    return response.data;
  },

  async updateTask(projectId: number, taskId: number, data: { status?: TaskStatus; title?: string }): Promise<ProjectTask> {
    const response = await apiClient.put<ProjectTask>(
      `/api/v1/projects/${projectId}/tasks/${taskId}?company_id=1`,
      data
    );
    return response.data;
  },

  async deleteTask(projectId: number, taskId: number): Promise<void> {
    await apiClient.delete(`/api/v1/projects/${projectId}/tasks/${taskId}?company_id=1`);
  },

  async addExpense(projectId: number, data: CreateExpenseInput): Promise<ProjectExpense> {
    const response = await apiClient.post<ProjectExpense>(
      `/api/v1/projects/${projectId}/expenses?company_id=1`,
      data
    );
    return response.data;
  },

  async getExpenses(projectId: number): Promise<ProjectExpense[]> {
    const response = await apiClient.get<ProjectExpense[]>(`/api/v1/projects/${projectId}/expenses?company_id=1`);
    return response.data;
  },
};
