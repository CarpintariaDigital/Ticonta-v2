import { create } from 'zustand';

export interface DocumentDelivery {
  id: string;
  document_id: string;
  channel: 'email' | 'whatsapp' | 'sms';
  recipient: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at?: string;
  error_message?: string;
}

export interface DocumentDeliveryState {
  savedContacts: Record<string, { phone: string; email: string }>;
  history: DocumentDelivery[];
  pendingDeliveries: DocumentDelivery[];
  isLoading: boolean;
  error: string | null;

  // Actions
  saveContact: (customerId: string, contact: { phone: string; email: string }) => void;
  setHistory: (history: DocumentDelivery[]) => void;
  sendByEmail: (documentId: string, email: string) => Promise<boolean>;
  sendByWhatsApp: (documentId: string, phone: string) => Promise<boolean>;
  sendBySMS: (documentId: string, phone: string) => Promise<boolean>;
  fetchDeliveryHistory: (documentId: string) => Promise<void>;
}

export const useDocumentDeliveryStore = create<DocumentDeliveryState>((set) => ({
  savedContacts: {},
  history: [],
  pendingDeliveries: [],
  isLoading: false,
  error: null,

  saveContact: (customerId, contact) =>
    set((state) => ({
      savedContacts: {
        ...state.savedContacts,
        [customerId]: contact,
      },
    })),

  setHistory: (history) => set({ history }),

  sendByEmail: async (documentId, email) => {
    set({ isLoading: true });
    try {
      const delivery: DocumentDelivery = {
        id: `del-${Date.now()}`,
        document_id: documentId,
        channel: 'email',
        recipient: email,
        status: 'sent',
        sent_at: new Date().toISOString(),
      };
      set((state) => ({
        history: [delivery, ...state.history],
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  sendByWhatsApp: async (documentId, phone) => {
    set({ isLoading: true });
    try {
      const delivery: DocumentDelivery = {
        id: `del-${Date.now()}`,
        document_id: documentId,
        channel: 'whatsapp',
        recipient: phone,
        status: 'sent',
        sent_at: new Date().toISOString(),
      };
      set((state) => ({
        history: [delivery, ...state.history],
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  sendBySMS: async (documentId, phone) => {
    set({ isLoading: true });
    try {
      const delivery: DocumentDelivery = {
        id: `del-${Date.now()}`,
        document_id: documentId,
        channel: 'sms',
        recipient: phone,
        status: 'sent',
        sent_at: new Date().toISOString(),
      };
      set((state) => ({
        history: [delivery, ...state.history],
        isLoading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  fetchDeliveryHistory: async () => {
    set({ isLoading: true });
    try {
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
