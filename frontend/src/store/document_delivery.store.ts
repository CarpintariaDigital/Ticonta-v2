import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DeliveryMethod,
  DeliveryStatus,
  DocumentDeliveryItem,
  documentDeliveryService,
} from "@/services/document_delivery";

interface DocumentDeliveryState {
  savedContacts: Record<string, { phone?: string; email?: string }>;
  history: DocumentDeliveryItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  saveContact: (customerIdOrKey: string, contact: { phone?: string; email?: string }) => void;
  fetchHistory: (filters?: { delivery_method?: string; status?: string }) => Promise<void>;
  sendDocument: (
    documentId: number,
    payload: {
      document_type?: "invoice" | "receipt" | "quote" | "purchase_order";
      delivery_method: DeliveryMethod;
      customer_phone?: string;
      customer_email?: string;
    }
  ) => Promise<DocumentDeliveryItem>;
  resendDocument: (deliveryId: number) => Promise<DocumentDeliveryItem>;
  clearError: () => void;
}

export const useDocumentDeliveryStore = create<DocumentDeliveryState>()(
  persist(
    (set, get) => ({
      savedContacts: {},
      history: [],
      isLoading: false,
      error: null,

      saveContact: (key, contact) => {
        set((state) => ({
          savedContacts: {
            ...state.savedContacts,
            [key]: {
              ...state.savedContacts[key],
              ...contact,
            },
          },
        }));
      },

      fetchHistory: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const items = await documentDeliveryService.getDeliveryHistory(filters);
          set({ history: items, isLoading: false });
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.response?.data?.detail || err.message || "Erro ao carregar histórico de entregas",
          });
        }
      },

      sendDocument: async (documentId, payload) => {
        set({ isLoading: true, error: null });
        try {
          const item = await documentDeliveryService.sendDocument(documentId, payload);
          set((state) => ({
            history: [item, ...state.history],
            isLoading: false,
          }));
          return item;
        } catch (err: any) {
          const msg = err.response?.data?.detail || err.message || "Falha ao enviar documento";
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      resendDocument: async (deliveryId) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await documentDeliveryService.resendDocument(deliveryId);
          set((state) => ({
            history: state.history.map((h) => (h.id === deliveryId ? updated : h)),
            isLoading: false,
          }));
          return updated;
        } catch (err: any) {
          const msg = err.response?.data?.detail || err.message || "Falha ao reenviar documento";
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ticonta-document-delivery-storage",
      partialize: (state) => ({ savedContacts: state.savedContacts }),
    }
  )
);
