export type ProjectStatus = 'planning' | 'active' | 'completed' | 'closed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ExpenseCategory = 'material' | 'labor' | 'equipment' | 'transport' | 'other';

export interface ProjectTask {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assigned_to_id?: number | null;
  assigned_to_name?: string | null;
  due_date?: string | null;
  created_at?: string;
}

export interface ProjectExpense {
  id: number;
  project_id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at?: string;
}

export interface Project {
  id: number;
  company_id: number;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  budget: number;
  actual_cost: number;
  progress: number;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
  tasks?: ProjectTask[];
  expenses?: ProjectExpense[];
}

export interface ProjectSummary {
  project_id: number;
  project_name: string;
  status: ProjectStatus;
  budget: number;
  total_expenses: number;
  balance_remaining: number;
  burn_rate_pct: number;
  is_over_budget: boolean;
  total_tasks: number;
  completed_tasks: number;
  progress_pct: number;
  expenses_by_category: Record<string, number>;
}
