import { create } from 'zustand';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'Livre' | 'Ocupada' | 'Conta Solicitada';
  currentTotal: number;
  openedAt?: string;
  waiter: string;
}

export interface KdsOrder {
  id: string;
  tableNumber: number;
  items: Array<{ name: string; qty: number; notes?: string }>;
  timeElapsedMin: number;
  status: 'Pendente' | 'Preparando' | 'Pronto';
  waiter: string;
}

interface RestaurantState {
  tables: Table[];
  kdsOrders: KdsOrder[];
  updateKdsStatus: (orderId: string, status: KdsOrder['status']) => void;
  openTable: (tableId: string, waiter: string) => void;
  closeTable: (tableId: string) => void;
}

const initialTables: Table[] = [
  { id: 'T-01', number: 1, capacity: 4, status: 'Ocupada', currentTotal: 1850, openedAt: '19:40', waiter: 'Beto' },
  { id: 'T-02', number: 2, capacity: 2, status: 'Livre', currentTotal: 0, waiter: '-' },
  { id: 'T-03', number: 3, capacity: 6, status: 'Conta Solicitada', currentTotal: 3420, openedAt: '18:50', waiter: 'Beto' },
  { id: 'T-04', number: 4, capacity: 4, status: 'Ocupada', currentTotal: 980, openedAt: '20:15', waiter: 'Zacarias' },
  { id: 'T-05', number: 5, capacity: 8, status: 'Livre', currentTotal: 0, waiter: '-' },
  { id: 'T-06', number: 6, capacity: 2, status: 'Ocupada', currentTotal: 740, openedAt: '20:25', waiter: 'Zacarias' },
];

const initialKds: KdsOrder[] = [
  {
    id: 'KDS-101',
    tableNumber: 1,
    items: [
      { name: '1x Frango à Zambeziana', qty: 1, notes: 'Pouco picante' },
      { name: '2x Porção Batata Frita', qty: 2 },
    ],
    timeElapsedMin: 14,
    status: 'Preparando',
    waiter: 'Beto',
  },
  {
    id: 'KDS-102',
    tableNumber: 4,
    items: [
      { name: '1x Matapa c/ Camarão', qty: 1 },
      { name: '1x Arroz Branco', qty: 1 },
    ],
    timeElapsedMin: 6,
    status: 'Pendente',
    waiter: 'Zacarias',
  },
  {
    id: 'KDS-103',
    tableNumber: 6,
    items: [
      { name: '2x Hambúrguer Especial TiConta', qty: 2, notes: 'Sem maionese' },
    ],
    timeElapsedMin: 22,
    status: 'Pronto',
    waiter: 'Zacarias',
  },
];

export const useRestaurantStore = create<RestaurantState>((set) => ({
  tables: initialTables,
  kdsOrders: initialKds,
  updateKdsStatus: (orderId, status) =>
    set((state) => ({
      kdsOrders: state.kdsOrders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    })),
  openTable: (tableId, waiter) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'Ocupada', waiter, openedAt: 'Agora' } : t
      ),
    })),
  closeTable: (tableId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status: 'Livre', currentTotal: 0, waiter: '-' } : t
      ),
    })),
}));
