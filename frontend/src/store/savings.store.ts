import { create } from 'zustand';
import { api } from '../lib/api';
import {
  SavingsGroup,
  SavingsGroupReport,
  SavingsLoan,
  SavingsMember,
} from '@/types/savings';

interface SavingsState {
  groups: SavingsGroup[];
  selectedGroup: SavingsGroup | null;
  report: SavingsGroupReport | null;
  isLoading: boolean;
  error: string | null;

  fetchGroups: () => Promise<void>;
  fetchGroupDetail: (id: number) => Promise<void>;
  fetchGroupReport: (id: number) => Promise<void>;
  createGroup: (data: { name: string; interest_rate: number; cycle_months: number; start_date?: string }) => Promise<SavingsGroup>;
  addMember: (groupId: number, data: { name: string; phone: string }) => Promise<SavingsMember>;
  registerDeposit: (data: { group_id: number; member_id: number; amount: number; payment_method: string; notes?: string }) => Promise<void>;
  createLoan: (data: { group_id: number; member_id: number; amount: number; due_date: string; interest_rate?: number }) => Promise<SavingsLoan>;
  registerRepayment: (loanId: number, data: { amount: number; payment_method: string }) => Promise<void>;
  closeCycle: (groupId: number) => Promise<SavingsGroupReport>;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
  groups: [],
  selectedGroup: null,
  report: null,
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/savings/groups');
      set({ groups: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar grupos de poupança', isLoading: false });
    }
  },

  fetchGroupDetail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/savings/groups/${id}`);
      set({ selectedGroup: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar detalhes do grupo', isLoading: false });
    }
  },

  fetchGroupReport: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/savings/groups/${id}/report`);
      set({ report: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar relatório do grupo', isLoading: false });
    }
  },

  createGroup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/savings/groups', data);
      await get().fetchGroups();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao criar grupo', isLoading: false });
      throw err;
    }
  },

  addMember: async (groupId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/api/v1/savings/groups/${groupId}/members`, data);
      await get().fetchGroupDetail(groupId);
      await get().fetchGroupReport(groupId);
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao adicionar membro', isLoading: false });
      throw err;
    }
  },

  registerDeposit: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/savings/deposits', data);
      await get().fetchGroupDetail(data.group_id);
      await get().fetchGroupReport(data.group_id);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao registar depósito', isLoading: false });
      throw err;
    }
  },

  createLoan: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/savings/loans', data);
      await get().fetchGroupReport(data.group_id);
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao conceder empréstimo', isLoading: false });
      throw err;
    }
  },

  registerRepayment: async (loanId, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/api/v1/savings/loans/${loanId}/repay`, data);
      const sel = get().selectedGroup;
      if (sel) {
        await get().fetchGroupReport(sel.id);
      }
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao registar reembolso', isLoading: false });
      throw err;
    }
  },

  closeCycle: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/api/v1/savings/groups/${groupId}/close`);
      set({ report: res.data, isLoading: false });
      await get().fetchGroups();
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao fechar ciclo', isLoading: false });
      throw err;
    }
  },
}));
