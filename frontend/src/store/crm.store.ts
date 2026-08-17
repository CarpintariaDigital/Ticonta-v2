import { create } from "zustand";
import { Lead, LeadStage, LeadSource } from "@/types/crm";

interface CRMState {
  leads: Lead[];
  selectedLead: Lead | null;
  activeStage: LeadStage | "all";
  filters: {
    source?: LeadSource | "all";
    search: string;
    minValue?: number;
  };
  isLoading: boolean;

  setLeads: (leads: Lead[]) => void;
  selectLead: (lead: Lead | null) => void;
  setActiveStage: (stage: LeadStage | "all") => void;
  setFilters: (filters: Partial<CRMState["filters"]>) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateLeadInState: (updated: Lead) => void;
  removeLeadFromState: (id: number) => void;
}

export const useCRMStore = create<CRMState>((set) => ({
  leads: [],
  selectedLead: null,
  activeStage: "all",
  filters: {
    source: "all",
    search: "",
  },
  isLoading: false,

  setLeads: (leads) => set({ leads }),
  selectLead: (selectedLead) => set({ selectedLead }),
  setActiveStage: (activeStage) => set({ activeStage }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateLeadInState: (updated) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === updated.id ? updated : l)),
      selectedLead: state.selectedLead?.id === updated.id ? updated : state.selectedLead,
    })),
  removeLeadFromState: (id) =>
    set((state) => ({
      leads: state.leads.filter((l) => l.id !== id),
      selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
    })),
}));
