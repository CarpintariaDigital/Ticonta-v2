import { create } from 'zustand';
import {
  XitiqueGroup,
  XitiqueMember,
  XitiqueContribution,
  XitiqueDelivery,
  XitiqueReminder,
  GroupSummary,
  XitiqueMemberInput,
} from '@/types/xitique';

interface XitiqueState {
  groups: XitiqueGroup[];
  selectedGroupSummary: GroupSummary | null;
  reminders: XitiqueReminder[];
  isLoading: boolean;
  error: string | null;

  fetchGroups: () => Promise<void>;
  fetchGroupSummary: (groupId: number) => Promise<void>;
  createGroup: (data: {
    name: string;
    type?: string;
    product_description?: string;
    contribution_value: number;
    period?: string;
    total_members?: number;
    order_type?: string;
    start_date?: string;
    members?: XitiqueMemberInput[];
  }) => Promise<number>;
  addMember: (groupId: number, member: XitiqueMemberInput) => Promise<void>;
  registerPayment: (contributionId: number, method?: string) => Promise<void>;
  processDelivery: (groupId: number, roundNumber: number, notes?: string) => Promise<void>;
  generateReminders: (groupId: number) => Promise<XitiqueReminder[]>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const useXitiqueStore = create<XitiqueState>((set, get) => ({
  groups: [],
  selectedGroupSummary: null,
  reminders: [],
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/xitique/groups`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Falha ao carregar grupos de Xitique');
      const data = await res.json();
      set({ groups: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchGroupSummary: async (groupId: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/xitique/groups/${groupId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Falha ao carregar resumo do grupo');
      const data = await res.json();
      set({ selectedGroupSummary: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createGroup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/xitique/groups`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Falha ao criar grupo de Xitique');
      const newGroup = await res.json();
      await get().fetchGroups();
      set({ isLoading: false });
      return newGroup.id;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addMember: async (groupId: number, member: XitiqueMemberInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/xitique/groups/${groupId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(member),
      });
      if (!res.ok) throw new Error('Falha ao adicionar membro');
      await get().fetchGroupSummary(groupId);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  registerPayment: async (contributionId: number, method = 'CASH') => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/xitique/contributions/${contributionId}/pay`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ payment_method: method }),
      });
      if (!res.ok) throw new Error('Falha ao registar pagamento da quota');
      const current = get().selectedGroupSummary;
      if (current) {
        await get().fetchGroupSummary(current.group.id);
      }
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  processDelivery: async (groupId: number, roundNumber: number, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/xitique/groups/${groupId}/deliver/${roundNumber}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Falha ao processar entrega do bolo');
      await get().fetchGroupSummary(groupId);
      await get().fetchGroups();
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  generateReminders: async (groupId: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/xitique/groups/${groupId}/reminders`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Falha ao gerar lembretes WhatsApp');
      const reminders = await res.json();
      set({ reminders, isLoading: false });
      return reminders;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return [];
    }
  },
}));
