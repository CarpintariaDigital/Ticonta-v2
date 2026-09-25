export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'sick';
export type PayrollStatus = 'draft' | 'approved' | 'paid';

export interface Employee {
  id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  nuit?: string | null;
  inss_number?: string | null;
  position: string;
  department: string;
  salary: number;
  start_date: string;
  end_date?: string | null;
  active: boolean;
  created_at?: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name?: string | null;
  date: string;
  status: AttendanceStatus;
  hours: number;
  notes?: string | null;
  created_at?: string;
}

export interface PayrollItem {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_nuit?: string | null;
  employee_inss?: string | null;
  position: string;
  period: string;
  gross_salary: number;
  inss_employee: number;
  inss_employer: number;
  irps: number;
  other_deductions: number;
  net_salary: number;
  status: PayrollStatus;
}

export interface MonthlyPayrollSummary {
  company_id: number;
  period: string;
  total_employees: number;
  total_gross: number;
  total_inss_employee: number;
  total_inss_employer: number;
  total_inss_due: number;
  total_irps: number;
  total_net_payable: number;
  items: PayrollItem[];
}

export interface INSSDeclarationXML {
  company_id: number;
  period: string;
  xml_content: string;
  filename: string;
}
