import { create } from 'zustand';

export interface DebtorClient {
  id: string;
  name: string;
  phone: string;
  nuit?: string;
  balance: number;
  limit: number;
  creditLimit?: number;
  creditScore: number; // 0 - 100
  lastPurchaseDate: string;
  daysOverdue: number;
  remindersSent: number;
}

export type Debtor = DebtorClient;

interface FiadoState {
  debtors: DebtorClient[];
  addDebtor: (debtor: DebtorClient) => void;
  registerPayment: (id: string, amount: number) => void;
  incrementReminder: (id: string) => void;
}

const initialDebtors: DebtorClient[] = [
  {
    id: 'CL-01',
    name: 'Mateus Chichava',
    phone: '+258 84 123 4567',
    nuit: '100234567',
    balance: 4500,
    limit: 10000,
    creditScore: 82,
    lastPurchaseDate: '2026-08-28',
    daysOverdue: 9,
    remindersSent: 1,
  },
  {
    id: 'CL-02',
    name: 'Oficina do Nhaca',
    phone: '+258 82 987 6543',
    nuit: '109876543',
    balance: 12800,
    limit: 15000,
    creditScore: 65,
    lastPurchaseDate: '2026-08-15',
    daysOverdue: 22,
    remindersSent: 2,
  },
  {
    id: 'CL-03',
    name: 'Dona Teresa (Banca 4)',
    phone: '+258 87 555 1234',
    nuit: '100456789',
    balance: 1450,
    limit: 5000,
    creditScore: 94,
    lastPurchaseDate: '2026-09-02',
    daysOverdue: 4,
    remindersSent: 0,
  },
  {
    id: 'CL-04',
    name: 'Construtora Zambezi Lda',
    phone: '+258 84 999 8888',
    nuit: '100999888',
    balance: 38500,
    limit: 50000,
    creditScore: 48,
    lastPurchaseDate: '2026-07-30',
    daysOverdue: 38,
    remindersSent: 4,
  },
];

export const useFiadoStore = create<FiadoState>((set) => ({
  debtors: initialDebtors,
  addDebtor: (debtor) => set((state) => ({ debtors: [debtor, ...state.debtors] })),
  registerPayment: (id, amount) =>
    set((state) => ({
      debtors: state.debtors.map((d) =>
        d.id === id ? { ...d, balance: Math.max(0, d.balance - amount) } : d
      ),
    })),
  incrementReminder: (id) =>
    set((state) => ({
      debtors: state.debtors.map((d) =>
        d.id === id ? { ...d, remindersSent: d.remindersSent + 1 } : d
      ),
    })),
}));
