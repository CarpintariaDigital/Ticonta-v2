export type ReportType = "sales" | "financial" | "accounting" | "crm" | "projects" | "hr" | "custom";

export interface SalesReportData {
  period: string;
  total_sales_count: number;
  total_revenue: number;
  total_tax_collected: number;
  average_ticket: number;
  payment_methods_breakdown: Record<string, number>;
  top_products: Array<{
    product_id: number;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  top_customers: Array<{
    customer_id: number;
    name: string;
    sales_count: number;
    revenue: number;
  }>;
  daily_timeline: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
}

export interface FinancialReportData {
  period: string;
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  total_receivables: number;
  cash_in_hand: number;
  bank_balances: number;
  profit_margin_percentage: number;
}

export interface CRMReportData {
  period: string;
  total_leads: number;
  pipeline_total_value: number;
  weighted_pipeline_value: number;
  win_rate_percentage: number;
  leads_by_stage: Record<string, number>;
  leads_by_source: Record<string, number>;
  average_days_in_stage: number;
}

export interface ProjectsReportData {
  period: string;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget_contracted: number;
  total_actual_expenses: number;
  overall_profit: number;
  average_progress_percentage: number;
  expenses_by_category: Record<string, number>;
}

export interface HRReportData {
  period: string;
  total_employees: number;
  total_gross_payroll: number;
  total_inss_employee: number;
  total_inss_employer: number;
  total_inss_guia: number;
  total_irps_retained: number;
  total_net_disbursed: number;
  average_salary: number;
  attendance_rate_percentage: number;
}

export interface ReportFilterOptions {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  period?: string;
  customerId?: number;
  productId?: number;
}
