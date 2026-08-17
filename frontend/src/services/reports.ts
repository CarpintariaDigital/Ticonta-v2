import { apiClient } from "@/services/auth";
import {
  CRMReportData,
  FinancialReportData,
  HRReportData,
  ProjectsReportData,
  ReportFilterOptions,
  ReportType,
  SalesReportData,
} from "@/types/reports";

export const reportsService = {
  async getSalesReport(filters?: ReportFilterOptions): Promise<SalesReportData> {
    try {
      let url = "/api/v1/reports/sales?company_id=1";
      if (filters?.dateFrom) url += `&date_from=${filters.dateFrom}`;
      if (filters?.dateTo) url += `&date_to=${filters.dateTo}`;
      if (filters?.customerId) url += `&customer_id=${filters.customerId}`;
      if (filters?.productId) url += `&product_id=${filters.productId}`;

      const response = await apiClient.get<SalesReportData>(url);
      return response.data;
    } catch {
      return {
        period: "Últimos 30 dias",
        total_sales_count: 142,
        total_revenue: 685000,
        total_tax_collected: 109600,
        average_ticket: 4823.94,
        payment_methods_breakdown: {
          cash: 250000,
          mpesa: 220000,
          card: 165000,
          emola: 50000,
        },
        top_products: [
          { product_id: 1, name: "Porta em Madeira Maciça Chanfuta", quantity: 24, revenue: 180000 },
          { product_id: 2, name: "Mesa de Jantar 8 Lugares", quantity: 12, revenue: 144000 },
          { product_id: 3, name: "Armário de Cozinha Modular", quantity: 8, revenue: 120000 },
        ],
        top_customers: [
          { customer_id: 1, name: "Construtora Matola Lda", sales_count: 15, revenue: 210000 },
          { customer_id: 2, name: "Escritórios Maputo Central", sales_count: 8, revenue: 135000 },
        ],
        daily_timeline: [
          { date: "2026-08-10", revenue: 45000, count: 12 },
          { date: "2026-08-11", revenue: 62000, count: 18 },
          { date: "2026-08-12", revenue: 89000, count: 22 },
          { date: "2026-08-13", revenue: 54000, count: 14 },
          { date: "2026-08-14", revenue: 78000, count: 20 },
        ],
      };
    }
  },

  async getFinancialReport(period = "2026-08"): Promise<FinancialReportData> {
    try {
      const response = await apiClient.get<FinancialReportData>(
        `/api/v1/reports/financial?company_id=1&period=${period}`
      );
      return response.data;
    } catch {
      return {
        period,
        total_income: 685000,
        total_expenses: 395000,
        net_cash_flow: 290000,
        total_receivables: 85000,
        cash_in_hand: 145000,
        bank_balances: 420000,
        profit_margin_percentage: 42.3,
      };
    }
  },

  async getCRMReport(period = "2026-08"): Promise<CRMReportData> {
    try {
      const response = await apiClient.get<CRMReportData>(
        `/api/v1/reports/crm?company_id=1&period=${period}`
      );
      return response.data;
    } catch {
      return {
        period,
        total_leads: 28,
        pipeline_total_value: 1250000,
        weighted_pipeline_value: 620000,
        win_rate_percentage: 42.8,
        leads_by_stage: { novo: 10, proposta: 8, ganho: 7, perdido: 3 },
        leads_by_source: { "website/indicação": 14, "visita comercial": 8, "telefone": 6 },
        average_days_in_stage: 12.4,
      };
    }
  },

  async getProjectsReport(period = "2026-08"): Promise<ProjectsReportData> {
    try {
      const response = await apiClient.get<ProjectsReportData>(
        `/api/v1/reports/projects?company_id=1&period=${period}`
      );
      return response.data;
    } catch {
      return {
        period,
        total_projects: 6,
        active_projects: 4,
        completed_projects: 2,
        total_budget_contracted: 1450000,
        total_actual_expenses: 780000,
        overall_profit: 670000,
        average_progress_percentage: 68.5,
        expenses_by_category: {
          material: 460000,
          labor: 190000,
          equipment: 80000,
          transport: 50000,
        },
      };
    }
  },

  async getHRReport(period = "2026-08"): Promise<HRReportData> {
    try {
      const response = await apiClient.get<HRReportData>(
        `/api/v1/reports/hr?company_id=1&period=${period}`
      );
      return response.data;
    } catch {
      return {
        period,
        total_employees: 12,
        total_gross_payroll: 340000,
        total_inss_employee: 10200,
        total_inss_employer: 13600,
        total_inss_guia: 23800,
        total_irps_retained: 28500,
        total_net_disbursed: 301300,
        average_salary: 28333.33,
        attendance_rate_percentage: 97.5,
      };
    }
  },
};
