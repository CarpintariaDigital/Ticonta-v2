import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Supplier {
  id: number;
  company_id: number;
  name: string;
  nuit?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  category: string;
  payment_terms: string;
  bank_name?: string;
  bank_account?: string;
  bank_nib?: string;
  notes?: string;
  active: boolean;
  total_purchased_mzn: number;
  total_debt_mzn: number;
  purchases_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierInvoice {
  id: number;
  supplier_id: number;
  supplier_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  iva_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'pendente' | 'pago_parcial' | 'pago' | 'vencido';
  description?: string;
  created_at: string;
}

interface SuppliersState {
  suppliers: Supplier[];
  invoices: SupplierInvoice[];
  isLoading: boolean;
  error: string | null;

  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: any) => Promise<Supplier>;
  recordInvoice: (data: any) => Promise<void>;
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
  suppliers: [],
  invoices: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const [suppRes, invRes] = await Promise.all([
        api.get<Supplier[]>('/suppliers'),
        api.get<SupplierInvoice[]>('/suppliers/invoices/all').catch(() => ({ data: [] })),
      ]);

      set({
        suppliers: Array.isArray(suppRes.data) ? suppRes.data : [],
        invoices: Array.isArray(invRes.data) ? invRes.data : [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  createSupplier: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<Supplier>('/suppliers', data);
      const newSupp = res.data;
      set((state) => ({ suppliers: [newSupp, ...state.suppliers], isLoading: false }));
      return newSupp;
    } catch {
      const fallbackSupp: Supplier = {
        id: Date.now(),
        company_id: 1,
        name: data.name,
        nuit: data.nuit,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city || 'Maputo',
        category: data.category || 'Geral',
        payment_terms: data.payment_terms || '30 Dias',
        bank_name: data.bank_name,
        bank_account: data.bank_account,
        active: true,
        total_purchased_mzn: 0,
        total_debt_mzn: 0,
        purchases_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({ suppliers: [fallbackSupp, ...state.suppliers], isLoading: false }));
      return fallbackSupp;
    }
  },

  recordInvoice: async (data) => {
    try {
      await api.post('/suppliers/invoices', data);
      await get().fetchSuppliers();
    } catch {
      // Local update
      const { suppliers } = get();
      const target = suppliers.find((s) => s.id === data.supplier_id);
      const total = Number(data.total_amount) || 0;

      const newInv: SupplierInvoice = {
        id: Date.now(),
        supplier_id: data.supplier_id,
        supplier_name: target ? target.name : 'Fornecedor',
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        total_amount: total,
        iva_amount: Number(data.iva_amount) || 0,
        paid_amount: 0,
        balance_due: total,
        status: 'pendente',
        description: data.description,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        invoices: [newInv, ...state.invoices],
        suppliers: state.suppliers.map((s) =>
          s.id === data.supplier_id
            ? {
                ...s,
                total_purchased_mzn: s.total_purchased_mzn + total,
                total_debt_mzn: s.total_debt_mzn + total,
                purchases_count: s.purchases_count + 1,
              }
            : s
        ),
      }));
    }
  },
}));
