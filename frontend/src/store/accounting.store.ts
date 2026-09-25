import { create } from 'zustand';
import { api } from '../lib/api';
import {
  Account,
  JournalEntry,
  TrialBalance,
  IncomeStatement,
  BalanceSheet,
} from '@/types/accounting';

interface AccountingState {
  accounts: Account[];
  journalEntries: JournalEntry[];
  trialBalance: TrialBalance | null;
  incomeStatement: IncomeStatement | null;
  balanceSheet: BalanceSheet | null;
  isLoading: boolean;
  error: string | null;

  fetchChartOfAccounts: () => Promise<void>;
  createAccount: (data: { account_code: string; account_name: string; account_type: string; is_header?: boolean; parent_id?: number | null }) => Promise<Account>;
  fetchJournalEntries: (filters?: { start_date?: string; end_date?: string; account_id?: number }) => Promise<void>;
  createJournalEntry: (data: { debit_account_id: number; credit_account_id: number; amount: number; description: string; entry_date?: string }) => Promise<JournalEntry>;
  fetchTrialBalance: (asOfDate?: string) => Promise<void>;
  fetchIncomeStatement: (dateFrom?: string, dateTo?: string) => Promise<void>;
  fetchBalanceSheet: (asOfDate?: string) => Promise<void>;
}

export const useAccountingStore = create<AccountingState>((set, get) => ({
  accounts: [],
  journalEntries: [],
  trialBalance: null,
  incomeStatement: null,
  balanceSheet: null,
  isLoading: false,
  error: null,

  fetchChartOfAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/accounting/chart-of-accounts');
      set({ accounts: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar plano de contas', isLoading: false });
    }
  },

  createAccount: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/accounting/accounts', data);
      await get().fetchChartOfAccounts();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao criar conta', isLoading: false });
      throw err;
    }
  },

  fetchJournalEntries: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/accounting/journal-entries', { params: filters });
      set({ journalEntries: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar lançamentos', isLoading: false });
    }
  },

  createJournalEntry: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/accounting/journal-entries', data);
      await get().fetchJournalEntries();
      await get().fetchChartOfAccounts();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao criar lançamento', isLoading: false });
      throw err;
    }
  },

  fetchTrialBalance: async (asOfDate) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/accounting/trial-balance', {
        params: { as_of_date: asOfDate || undefined },
      });
      set({ trialBalance: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao gerar balancete', isLoading: false });
    }
  },

  fetchIncomeStatement: async (dateFrom, dateTo) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/accounting/income-statement', {
        params: { date_from: dateFrom || undefined, date_to: dateTo || undefined },
      });
      set({ incomeStatement: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao gerar DRE', isLoading: false });
    }
  },

  fetchBalanceSheet: async (asOfDate) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/accounting/balance-sheet', {
        params: { as_of_date: asOfDate || undefined },
      });
      set({ balanceSheet: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao gerar balanço patrimonial', isLoading: false });
    }
  },
}));
