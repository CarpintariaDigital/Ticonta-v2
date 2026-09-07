import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Gerente' | 'Operador' | 'Mecânico' | 'Garçom';
  operatorCode: string;
  shiftActive: boolean;
}

export interface Company {
  name: string;
  nuit: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number;
}

interface AuthState {
  user: User | null;
  company: Company;
  isAuthenticated: boolean;
  login: (email: string, role?: User['role']) => void;
  logout: () => void;
  toggleShift: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'USR-0941',
    name: 'Ildino Engenheiro',
    email: 'ildino@carpintaria.digital',
    role: 'Admin',
    operatorCode: 'OP-01',
    shiftActive: true,
  },
  company: {
    name: 'Carpintaria Digital & Serviços',
    nuit: '100482914',
    address: 'Av. Eduardo Mondlane, 1420 - Maputo',
    phone: '+258 84 000 0000',
    currency: 'MZN',
    taxRate: 16,
  },
  isAuthenticated: true,
  login: (email: string, role: User['role'] = 'Operador') => {
    set({
      user: {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: email.split('@')[0],
        email,
        role,
        operatorCode: 'OP-02',
        shiftActive: true,
      },
      isAuthenticated: true,
    });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  toggleShift: () =>
    set((state) =>
      state.user
        ? { user: { ...state.user, shiftActive: !state.user.shiftActive } }
        : state
    ),
}));
