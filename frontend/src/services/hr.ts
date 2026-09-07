import { apiClient } from "@/services/auth";
import {
  Attendance,
  CreateEmployeeInput,
  Employee,
  INSSDeclarationXML,
  MonthlyPayrollSummary,
  RecordAttendanceInput,
} from "@/types/hr";

export const defaultEmployees: Employee[] = [
  {
    id: 1,
    company_id: 1,
    first_name: "Manuel",
    last_name: "Cossa",
    full_name: "Manuel Cossa",
    email: "manuel.cossa@empresa.co.mz",
    phone: "+258 84 777 6655",
    nuit: "100200300",
    inss_number: "99887766",
    position: "Carpinteiro Chefe",
    department: "Produção",
    salary: 30000,
    start_date: "2025-03-01",
    active: true,
    created_at: "2025-03-01T08:00:00Z",
  },
  {
    id: 2,
    company_id: 1,
    first_name: "Ana",
    last_name: "Mabote",
    full_name: "Ana Mabote",
    email: "ana.mabote@empresa.co.mz",
    phone: "+258 82 444 3322",
    nuit: "100100100",
    inss_number: "11122233",
    position: "Contabilista / Administrativa",
    department: "Administração",
    salary: 45000,
    start_date: "2024-06-15",
    active: true,
    created_at: "2024-06-15T08:00:00Z",
  },
  {
    id: 3,
    company_id: 1,
    first_name: "Carlos",
    last_name: "Machel",
    full_name: "Carlos Machel",
    email: "carlos.machel@empresa.co.mz",
    phone: "+258 86 999 1122",
    nuit: "200200200",
    inss_number: "44455566",
    position: "Encarregado Geral de Obras",
    department: "Engenharia & Obras",
    salary: 55000,
    start_date: "2024-01-10",
    active: true,
    created_at: "2024-01-10T08:00:00Z",
  },
];

export const hrService = {
  async getEmployees(): Promise<Employee[]> {
    try {
      const response = await apiClient.get<Employee[]>("/api/v1/hr/employees?company_id=1");
      return response.data;
    } catch {
      return defaultEmployees;
    }
  },

  async createEmployee(data: CreateEmployeeInput): Promise<Employee> {
    const response = await apiClient.post<Employee>("/api/v1/hr/employees", data);
    return response.data;
  },

  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/api/v1/hr/employees/${id}?company_id=1`, data);
    return response.data;
  },

  async recordAttendance(data: RecordAttendanceInput): Promise<Attendance> {
    const response = await apiClient.post<Attendance>("/api/v1/hr/attendance?company_id=1", data);
    return response.data;
  },

  async generatePayroll(period: string): Promise<MonthlyPayrollSummary> {
    const response = await apiClient.post<MonthlyPayrollSummary>("/api/v1/hr/payroll/generate", {
      company_id: 1,
      period,
    });
    return response.data;
  },

  async getPayroll(period: string): Promise<MonthlyPayrollSummary> {
    try {
      const response = await apiClient.get<MonthlyPayrollSummary>(`/api/v1/hr/payroll/${period}?company_id=1`);
      return response.data;
    } catch {
      // Fallback calculado
      const grossTotal = 130000;
      const inssEmp = grossTotal * 0.03;
      const inssPat = grossTotal * 0.04;
      return {
        company_id: 1,
        period,
        total_employees: 3,
        total_gross: grossTotal,
        total_inss_employee: inssEmp,
        total_inss_employer: inssPat,
        total_inss_due: inssEmp + inssPat,
        total_irps: 7650,
        total_net_payable: grossTotal - inssEmp - 7650,
        items: [
          {
            id: 1,
            employee_id: 1,
            employee_name: "Manuel Cossa",
            employee_nuit: "100200300",
            employee_inss: "99887766",
            position: "Carpinteiro Chefe",
            period,
            gross_salary: 30000,
            inss_employee: 900,
            inss_employer: 1200,
            irps: 887.5,
            other_deductions: 0,
            net_salary: 28212.5,
            status: "approved",
          },
          {
            id: 2,
            employee_id: 2,
            employee_name: "Ana Mabote",
            employee_nuit: "100100100",
            employee_inss: "11122233",
            position: "Contabilista",
            period,
            gross_salary: 45000,
            inss_employee: 1350,
            inss_employer: 1800,
            irps: 2887.5,
            other_deductions: 0,
            net_salary: 40762.5,
            status: "approved",
          },
          {
            id: 3,
            employee_id: 3,
            employee_name: "Carlos Machel",
            employee_nuit: "200200200",
            employee_inss: "44455566",
            position: "Encarregado Geral",
            period,
            gross_salary: 55000,
            inss_employee: 1650,
            inss_employer: 2200,
            irps: 4337.5,
            other_deductions: 0,
            net_salary: 49012.5,
            status: "approved",
          },
        ],
      };
    }
  },

  async exportINSSDeclarationXML(period: string): Promise<INSSDeclarationXML> {
    const response = await apiClient.get<INSSDeclarationXML>(
      `/api/v1/hr/payroll/${period}/export-xml?company_id=1`
    );
    return response.data;
  },
};
