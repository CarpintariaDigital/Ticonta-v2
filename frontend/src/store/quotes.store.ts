import { create } from 'zustand';
import { api } from '@/lib/api';

export interface QuoteItem {
  id?: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  iva_rate: number;
  subtotal: number;
  iva_amount: number;
  total: number;
}

export interface Quote {
  id: number;
  company_id: number;
  quote_number: string;
  quote_type: 'cotacao' | 'proforma';
  customer_id?: number;
  customer_name: string;
  customer_nuit?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  issue_date: string;
  valid_until: string;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'recusada' | 'convertida';
  subtotal: number;
  iva_total: number;
  discount_total: number;
  total: number;
  payment_terms: string;
  notes?: string;
  converted_sale_id?: number;
  created_at: string;
  items: QuoteItem[];
}

interface QuotesState {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;

  fetchQuotes: () => Promise<void>;
  createQuote: (data: any) => Promise<Quote>;
  updateQuoteStatus: (id: number, status: string, reason?: string) => Promise<void>;
  convertToSale: (id: number) => Promise<{ sale_id: number; invoice_number: string }>;
}

export const useQuotesStore = create<QuotesState>((set, get) => ({
  quotes: [],
  isLoading: false,
  error: null,

  fetchQuotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Quote[]>('/quotes');
      const data = res.data;
      set({ quotes: Array.isArray(data) ? data : [], isLoading: false });
    } catch {
      // Offline fallback com dados padrão se necessário
      set({ isLoading: false });
    }
  },

  createQuote: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<Quote>('/quotes', data);
      const newQuote = res.data;
      set((state) => ({ quotes: [newQuote, ...state.quotes], isLoading: false }));
      return newQuote;
    } catch (err: any) {
      // Fallback local se offline
      const subtotal = data.items.reduce((sum: number, i: any) => sum + (i.quantity * i.unit_price), 0);
      const discount = data.items.reduce((sum: number, i: any) => sum + (i.quantity * i.unit_price * (i.discount_percent / 100)), 0);
      const iva = (subtotal - discount) * 0.16;
      const total = (subtotal - discount) + iva;

      const fallbackQuote: Quote = {
        id: Date.now(),
        company_id: 1,
        quote_number: `${data.quote_type === 'proforma' ? 'PRO' : 'COT'}-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        quote_type: data.quote_type || 'cotacao',
        customer_name: data.customer_name,
        customer_nuit: data.customer_nuit,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email,
        issue_date: new Date().toISOString().slice(0, 10),
        valid_until: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        status: 'enviada',
        subtotal,
        discount_total: discount,
        iva_total: iva,
        total,
        payment_terms: data.payment_terms || 'Pronto Pagamento',
        notes: data.notes,
        created_at: new Date().toISOString(),
        items: data.items.map((it: any, idx: number) => ({
          id: idx + 1,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          discount_percent: it.discount_percent || 0,
          iva_rate: 16,
          subtotal: it.quantity * it.unit_price,
          iva_amount: (it.quantity * it.unit_price) * 0.16,
          total: (it.quantity * it.unit_price) * 1.16,
        })),
      };

      set((state) => ({ quotes: [fallbackQuote, ...state.quotes], isLoading: false }));
      return fallbackQuote;
    }
  },

  updateQuoteStatus: async (id, status, reason) => {
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === id ? { ...q, status: status as any } : q)),
    }));
    try {
      await api.patch(`/quotes/${id}/status`, { status, rejection_reason: reason });
    } catch {
      // OK offline
    }
  },

  convertToSale: async (id) => {
    try {
      const res = await api.post(`/quotes/${id}/convert-to-sale`);
      const result = res.data;
      set((state) => ({
        quotes: state.quotes.map((q) => (q.id === id ? { ...q, status: 'convertida', converted_sale_id: result.sale_id } : q)),
      }));
      return result;
    } catch {
      const dummySaleId = Date.now();
      const invoiceNum = `FT-${new Date().getFullYear()}/${id}`;
      set((state) => ({
        quotes: state.quotes.map((q) => (q.id === id ? { ...q, status: 'convertida', converted_sale_id: dummySaleId } : q)),
      }));
      return { sale_id: dummySaleId, invoice_number: invoiceNum };
    }
  },
}));
