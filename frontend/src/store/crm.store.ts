import { create } from 'zustand';
import { Customer, Lead, CRMFilters } from '../types/crm';

export interface CRMState {
  leads: Lead[];
  selectedLead: Lead | null;
  activeStage: string;
  filters: { source: string; search: string };
  crmFilters: CRMFilters;
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;

  setLeads: (leads: Lead[]) => void;
  updateLeadInState: (lead: Lead) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setActiveStage: (stage: string) => void;
  setFilters: (filters: Partial<{ source: string; search: string }>) => void;
  setCRMFilters: (filters: Partial<CRMFilters>) => void;
  setCustomers: (customers: Customer[]) => void;
  selectCustomer: (id: number | string | null) => void;
  updateTrustScore: (customerId: number | string, score: number) => void;
  searchCustomers: (query: string) => Customer[];
  fetchCustomers: (filters?: CRMFilters) => Promise<void>;
}

export const useCRMStore = create<CRMState>((set, get) => ({
  leads: [],
  selectedLead: null,
  activeStage: 'all',
  filters: { source: 'all', search: '' },
  crmFilters: {},
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,

  setLeads: (leads) => set({ leads }),

  updateLeadInState: (updatedLead) =>
    set((state) => ({
      leads: state.leads.map((l) => (String(l.id) === String(updatedLead.id) ? updatedLead : l)),
      selectedLead:
        state.selectedLead && String(state.selectedLead.id) === String(updatedLead.id)
          ? updatedLead
          : state.selectedLead,
    })),

  setSelectedLead: (lead) => set({ selectedLead: lead }),

  setActiveStage: (stage) => set({ activeStage: stage }),

  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  setCRMFilters: (newFilters) =>
    set((state) => ({ crmFilters: { ...state.crmFilters, ...newFilters } })),

  setCustomers: (customers) => set({ customers }),

  selectCustomer: (id) =>
    set((state) => ({
      selectedCustomer:
        id !== null && id !== undefined
          ? state.customers.find((c) => String(c.id) === String(id)) || null
          : null,
    })),

  updateTrustScore: (customerId, score) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        String(c.id) === String(customerId) ? { ...c, trust_score: score } : c
      ),
      selectedCustomer:
        state.selectedCustomer && String(state.selectedCustomer.id) === String(customerId)
          ? { ...state.selectedCustomer, trust_score: score }
          : state.selectedCustomer,
    })),

  searchCustomers: (query) => {
    const q = query.toLowerCase();
    return get().customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  },

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
