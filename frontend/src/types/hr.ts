export type AttendanceStatus = "present" | "absent" | "leave" | "sick";

export type PayrollStatus = "draft" | "approved" | "paid";

export interface Employee {
  id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  nuit?: string;
  inss_number?: string;
  position: string;
  department: string;
  salary: number;
  start_date: string;
  active: boolean;
  created_at: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  status: AttendanceStatus;
  hours: number;
  notes?: string;
  created_at: string;
}

export interface PayrollItem {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_nuit?: string;
  employee_inss?: string;
  position: string;
  period: string;
  gross_salary: number;
  inss_employee: number; // 3%
  inss_employer: number; // 4%
  irps: number;          // Retenção IRPS / IRT
  other_deductions: number;
  net_salary: number;
  status: PayrollStatus;
}

export interface MonthlyPayrollSummary {
  company_id: number;
  period: string;
  total_employees: number;
  total_gross: number;
  total_inss_employee: number; // 3%
  total_inss_employer: number; // 4%
  total_inss_due: number;      // 7%
  total_irps: number;
  total_net_payable: number;
  items: PayrollItem[];
}

export interface CreateEmployeeInput {
  company_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  nuit?: string;
  inss_number?: string;
  position: string;
  department?: string;
  salary: number;
  start_date?: string;
}

export interface RecordAttendanceInput {
  employee_id: number;
  date: string;
  status: AttendanceStatus;
  hours: number;
  notes?: string;
}

export interface INSSDeclarationXML {
  company_id: number;
  period: string;
  xml_content: string;
  filename: string;
}
