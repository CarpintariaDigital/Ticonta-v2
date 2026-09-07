import { create } from 'zustand';

export interface ServiceOrder {
  id: string;
  osNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  clientName: string;
  clientPhone: string;
  mechanic: string;
  serviceDescription: string;
  checklist: Array<{ item: string; ok: boolean }>;
  partsTotal: number;
  laborTotal: number;
  total: number;
  status: 'Diagnóstico' | 'Em Execução' | 'Aguardando Peças' | 'Concluída' | 'Faturada';
  createdAt: string;
}

interface AutoState {
  orders: ServiceOrder[];
  addOrder: (order: ServiceOrder) => void;
  updateStatus: (id: string, status: ServiceOrder['status']) => void;
}

const initialOrders: ServiceOrder[] = [
  {
    id: 'OS-01',
    osNumber: 'OS-2026/0089',
    vehiclePlate: 'AFG-832-MC',
    vehicleModel: 'Toyota Hilux D4D 2021',
    clientName: 'Transportes Machava',
    clientPhone: '+258 84 771 9922',
    mechanic: 'Mestre Carlos',
    serviceDescription: 'Revisão geral dos 80.000km, troca de pastilhas e óleo motor',
    checklist: [
      { item: 'Nível Óleo do Motor', ok: true },
      { item: 'Fluido de Travões', ok: true },
      { item: 'Pastilhas de Travão', ok: false },
      { item: 'Filtro de Ar e Combustível', ok: false },
      { item: 'Suspensão e Amortecedores', ok: true },
    ],
    partsTotal: 8400,
    laborTotal: 3500,
    total: 11900,
    status: 'Em Execução',
    createdAt: '2026-09-06 08:30',
  },
  {
    id: 'OS-02',
    osNumber: 'OS-2026/0090',
    vehiclePlate: 'AIR-410-MP',
    vehicleModel: 'Isuzu D-Max 3.0',
    clientName: 'Agro-Comércio Matola',
    clientPhone: '+258 82 112 3344',
    mechanic: 'Júlio Mecânico',
    serviceDescription: 'Diagnóstico de sobreaquecimento e fuga no radiador',
    checklist: [
      { item: 'Radiador e Mangueiras', ok: false },
      { item: 'Termostato e Bomba de Água', ok: false },
      { item: 'Ventoinha Viscosa', ok: true },
      { item: 'Nível de Líquido Refrigerante', ok: false },
    ],
    partsTotal: 6200,
    laborTotal: 2800,
    total: 9000,
    status: 'Diagnóstico',
    createdAt: '2026-09-06 14:10',
  },
];

export const useAutoStore = create<AutoState>((set) => ({
  orders: initialOrders,
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));
