export type ProjectStatus = "planning" | "active" | "completed" | "closed";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  assigned_to_id?: number;
  assigned_to_name?: string;
  due_date?: string;
  created_at: string;
}

export interface ProjectExpense {
  id: number;
  project_id: number;
  description: string;
  amount: number;
  category: "material" | "labor" | "equipment" | "transport" | "other";
  date: string;
  created_at: string;
}

export interface Project {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  budget: number;
  actual_cost: number;
  progress: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  tasks: ProjectTask[];
  expenses: ProjectExpense[];
}

export interface CreateProjectInput {
  company_id?: number;
  name: string;
  description?: string;
  budget: number;
  start_date?: string;
  end_date?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assigned_to_id?: number;
  due_date?: string;
}

export interface CreateExpenseInput {
  description: string;
  amount: number;
  category: "material" | "labor" | "equipment" | "transport" | "other";
  date?: string;
}

export interface ProjectSummary {
  project_id: number;
  name: string;
  status: ProjectStatus;
  budget: number;
  actual_cost: number;
  remaining_budget: number;
  profit: number;
  budget_used_percentage: number;
  progress_percentage: number;
  is_over_budget: boolean;
  budget_alert: boolean;
  total_tasks: number;
  completed_tasks: number;
}
