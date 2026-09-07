import { create } from 'zustand';

export interface TakeawayOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  address: string;
  itemsSummary: string;
  total: number;
  status: 'Preparando' | 'Pronto p/ Envio' | 'Em Trânsito' | 'Entregue';
  courierName: string;
  courierPhone: string;
  estimatedMinutes: number;
  smsSent: boolean;
}

interface TakeawayState {
  orders: TakeawayOrder[];
  dispatchOrder: (id: string, courierName: string, courierPhone: string) => void;
  markDelivered: (id: string) => void;
}

const initialTakeaway: TakeawayOrder[] = [
  {
    id: 'TK-501',
    orderNumber: '#501',
    clientName: 'Dr. Salvador Sitoe',
    clientPhone: '+258 84 812 9001',
    address: 'Bairro Sommerschield, Rua das Acácias, nº 88',
    itemsSummary: '2x Frango à Zambeziana + 2x Frozy',
    total: 770,
    status: 'Em Trânsito',
    courierName: 'Estafeta Amisse (Moto 03)',
    courierPhone: '+258 87 400 1122',
    estimatedMinutes: 12,
    smsSent: true,
  },
  {
    id: 'TK-502',
    orderNumber: '#502',
    clientName: 'Anabela Mondlane',
    clientPhone: '+258 82 667 8899',
    address: 'Polana Cimento, Av. Armando Tivane, 204',
    itemsSummary: '1x Matapa Especial + 1x Suco Natural',
    total: 620,
    status: 'Pronto p/ Envio',
    courierName: 'Não atribuído',
    courierPhone: '',
    estimatedMinutes: 25,
    smsSent: false,
  },
];

export const useTakeawayStore = create<TakeawayState>((set) => ({
  orders: initialTakeaway,
  dispatchOrder: (id, courierName, courierPhone) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'Em Trânsito',
              courierName,
              courierPhone,
              smsSent: true,
            }
          : o
      ),
    })),
  markDelivered: (id) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status: 'Entregue' } : o
      ),
    })),
}));
