import { create } from 'zustand';

export interface TakeawayOrder {
  id: string;
  orderNumber: string;
  type: 'delivery' | 'pickup'; // Entrega ao Domicílio vs Levantamento no Balcão
  clientName: string;
  clientPhone: string;
  address?: string;
  deliveryFee: number;
  itemsSummary: string;
  total: number;
  paymentMethod: 'M-Pesa' | 'e-Mola' | 'Numerário no Balcão' | 'POS Cartão';
  paymentStatus: 'Pago' | 'Pendente na Entrega' | 'Pendente no Balcão';
  status: 'Preparando' | 'Pronto p/ Envio' | 'Pronto p/ Levantamento' | 'Em Trânsito' | 'Entregue' | 'Levantado';
  courierName?: string;
  courierPhone?: string;
  estimatedMinutes: number;
  smsSent: boolean;
  createdAt: string;
}

interface TakeawayState {
  orders: TakeawayOrder[];
  addOrder: (order: TakeawayOrder) => void;
  dispatchOrder: (id: string, courierName: string, courierPhone: string) => void;
  markDelivered: (id: string) => void;
  markPickedUp: (id: string) => void;
}

const initialTakeaway: TakeawayOrder[] = [
  {
    id: 'TK-501',
    orderNumber: '#501',
    type: 'delivery',
    clientName: 'Dr. Salvador Sitoe',
    clientPhone: '+258 84 812 9001',
    address: 'Bairro Sommerschield, Rua das Acácias, nº 88',
    deliveryFee: 150,
    itemsSummary: '2x Frango à Zambeziana + 2x Frozy',
    total: 920,
    paymentMethod: 'M-Pesa',
    paymentStatus: 'Pago',
    status: 'Em Trânsito',
    courierName: 'Estafeta Amisse (Moto 03)',
    courierPhone: '+258 87 400 1122',
    estimatedMinutes: 12,
    smsSent: true,
    createdAt: '20:10',
  },
  {
    id: 'TK-502',
    orderNumber: '#502',
    type: 'pickup',
    clientName: 'Anabela Mondlane',
    clientPhone: '+258 82 667 8899',
    address: 'Levantamento no Balcão da Loja Central',
    deliveryFee: 0,
    itemsSummary: '1x Matapa Especial + 1x Suco Natural',
    total: 620,
    paymentMethod: 'Numerário no Balcão',
    paymentStatus: 'Pendente no Balcão',
    status: 'Pronto p/ Levantamento',
    estimatedMinutes: 5,
    smsSent: false,
    createdAt: '20:25',
  },
  {
    id: 'TK-503',
    orderNumber: '#503',
    type: 'delivery',
    clientName: 'Geraldo Manjate',
    clientPhone: '+258 84 111 2233',
    address: 'Av. Julius Nyerere, Edifício Jat, 4º Andar',
    deliveryFee: 200,
    itemsSummary: '3x Hambúrguer TiConta Duplo + 3x 2M Lata',
    total: 1450,
    paymentMethod: 'M-Pesa',
    paymentStatus: 'Pago',
    status: 'Preparando',
    courierName: 'Aguardando Atribuição',
    estimatedMinutes: 30,
    smsSent: false,
    createdAt: '20:40',
  },
];

export const useTakeawayStore = create<TakeawayState>((set) => ({
  orders: initialTakeaway,
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
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
        o.id === id ? { ...o, status: 'Entregue', paymentStatus: 'Pago' } : o
      ),
    })),
  markPickedUp: (id) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status: 'Levantado', paymentStatus: 'Pago' } : o
      ),
    })),
}));
