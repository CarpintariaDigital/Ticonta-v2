import { create } from 'zustand';
import { api } from '../lib/api';
import {
  Employee,
  AttendanceRecord,
  MonthlyPayrollSummary,
  INSSDeclarationXML,
  AttendanceStatus,
} from '@/types/hr';

interface HRState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  payrollSummary: MonthlyPayrollSummary | null;
  attendances: AttendanceRecord[];
  inssXml: INSSDeclarationXML | null;
  selectedPeriod: string;
  isLoading: boolean;
  error: string | null;

  fetchEmployees: (activeOnly?: boolean) => Promise<void>;
  createEmployee: (data: Partial<Employee> & { first_name: string; last_name: string; position: string; salary: number; department?: string }) => Promise<Employee>;
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<Employee>;
  recordAttendance: (data: { employee_id: number; date: string; status: AttendanceStatus; hours?: number; notes?: string }) => Promise<AttendanceRecord>;
  generatePayroll: (period: string) => Promise<MonthlyPayrollSummary>;
  fetchPayroll: (period: string) => Promise<void>;
  exportINSSXml: (period: string) => Promise<INSSDeclarationXML>;
  setSelectedPeriod: (period: string) => void;
}

export const useHRStore = create<HRState>((set, get) => ({
  employees: [],
  selectedEmployee: null,
  payrollSummary: null,
  attendances: [],
  inssXml: null,
  selectedPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM
  isLoading: false,
  error: null,

  setSelectedPeriod: (period) => set({ selectedPeriod: period }),

  fetchEmployees: async (activeOnly = true) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/hr/employees', {
        params: { active_only: activeOnly },
      });
      set({ employees: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar colaboradores', isLoading: false });
    }
  },

  createEmployee: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/hr/employees', data);
      await get().fetchEmployees();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao admitir colaborador', isLoading: false });
      throw err;
    }
  },

  updateEmployee: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put(`/api/v1/hr/employees/${id}`, data);
      await get().fetchEmployees();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao atualizar colaborador', isLoading: false });
      throw err;
    }
  },

  recordAttendance: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/hr/attendance', data);
      set((state) => ({
        attendances: [res.data, ...state.attendances],
        isLoading: false,
      }));
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao registar presença', isLoading: false });
      throw err;
    }
  },

  generatePayroll: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/hr/payroll/generate', { period });
      set({ payrollSummary: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao processar folha de salários', isLoading: false });
      throw err;
    }
  },

  fetchPayroll: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/hr/payroll/${period}`);
      set({ payrollSummary: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Folha de salários não encontrada', payrollSummary: null, isLoading: false });
    }
  },

  exportINSSXml: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/hr/payroll/${period}/export-xml`);
      set({ inssXml: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao gerar XML do INSS', isLoading: false });
      throw err;
    }
  },
}));
