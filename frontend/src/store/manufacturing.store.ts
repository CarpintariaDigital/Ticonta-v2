import { create } from 'zustand';
import { api } from '../lib/api';
import {
  WorkOrder,
  WorkOrderStatus,
  CuttingPlanResult,
  BudgetCalculationResult,
} from '@/types/manufacturing';

interface ManufacturingState {
  workOrders: WorkOrder[];
  selectedWorkOrder: WorkOrder | null;
  cuttingPlan: CuttingPlanResult | null;
  budgetResult: BudgetCalculationResult | null;
  isLoading: boolean;
  error: string | null;

  fetchWorkOrders: (status?: WorkOrderStatus) => Promise<void>;
  fetchWorkOrderById: (id: number) => Promise<void>;
  createWorkOrder: (data: {
    description: string;
    budget: number;
    project_id?: number | null;
    start_date?: string;
    end_date?: string | null;
    materials?: Array<{ name: string; quantity: number; unit: string; unit_price: number }>;
  }) => Promise<WorkOrder>;
  updateWorkOrderStatus: (id: number, status: WorkOrderStatus, actualCost?: number) => Promise<WorkOrder>;
  calculateBudget: (data: {
    materials: Array<{ name: string; quantity: number; unit_price: number }>;
    labor_hours: number;
    labor_rate: number;
    overhead_percentage?: number;
    margin_percentage?: number;
  }) => Promise<BudgetCalculationResult>;
  calculateCuttingPlan: (data: {
    sheet_width: number;
    sheet_height: number;
    blade_thickness?: number;
    pieces: Array<{ width: number; height: number; quantity: number; label?: string }>;
  }) => Promise<CuttingPlanResult>;
}

export const useManufacturingStore = create<ManufacturingState>((set, get) => ({
  workOrders: [],
  selectedWorkOrder: null,
  cuttingPlan: null,
  budgetResult: null,
  isLoading: false,
  error: null,

  fetchWorkOrders: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/manufacturing/work-orders', {
        params: { status: status || undefined },
      });
      set({ workOrders: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar ordens de produção', isLoading: false });
    }
  },

  fetchWorkOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/manufacturing/work-orders/${id}`);
      set({ selectedWorkOrder: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar OP', isLoading: false });
    }
  },

  createWorkOrder: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/manufacturing/work-orders', data);
      await get().fetchWorkOrders();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao criar ordem de produção', isLoading: false });
      throw err;
    }
  },

  updateWorkOrderStatus: async (id, status, actualCost) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put(`/api/v1/manufacturing/work-orders/${id}`, {
        status,
        actual_cost: actualCost,
      });
      await get().fetchWorkOrders();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao atualizar estado da OP', isLoading: false });
      throw err;
    }
  },

  calculateBudget: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/manufacturing/budget/calculate', data);
      set({ budgetResult: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao calcular orçamento', isLoading: false });
      throw err;
    }
  },

  calculateCuttingPlan: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/manufacturing/cutting-plan/calculate', data);
      set({ cuttingPlan: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao calcular plano de corte', isLoading: false });
      throw err;
    }
  },
}));
