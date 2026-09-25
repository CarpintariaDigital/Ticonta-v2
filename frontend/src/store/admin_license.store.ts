'use client';

import { create } from 'zustand';
import { api } from '../lib/api';

export interface AdminLicenseItem {
  id: number;
  license_key: string;
  customer_name?: string;
  client_name?: string;
  customer_email?: string;
  client_email?: string;
  customer_phone?: string;
  nuit?: string;
  machine_id?: string;
  plan: string;
  status?: string;
  is_active?: boolean;
  issued_at: string;
  expires_at: string;
  days_remaining?: number;
  modules?: string[];
  revoked_at?: string | null;
  notes?: string;
}

export interface AdminStats {
  total_licenses: number;
  active_licenses: number;
  expiring_soon: number;
  mrr_mzn: number;
}

interface AdminLicenseState {
  licenses: AdminLicenseItem[];
  stats: AdminStats;
  isLoading: boolean;
  error: string | null;

  fetchLicenses: () => Promise<void>;
  generateLicense: (data: {
    customer_name: string;
    nuit?: string;
    customer_email?: string;
    customer_phone?: string;
    plan: string;
    days: number;
    machine_id?: string;
  }) => Promise<AdminLicenseItem>;
  revokeLicense: (id: number, reason: string) => Promise<boolean>;
  renewLicense: (id: number, days: number) => Promise<boolean>;
}

// Licenças iniciais de demonstração / fallback
const INITIAL_LICENSES: AdminLicenseItem[] = [
  {
    id: 1,
    license_key: 'TC-100482914-A8F92BC10924-20270925',
    customer_name: 'Mercearia & Congelados Zimpeto',
    nuit: '100482914',
    customer_phone: '+258 84 111 2233',
    customer_email: 'zimpeto@mercearia.co.mz',
    plan: 'basic',
    status: 'active',
    is_active: true,
    issued_at: '2026-09-25T10:00:00Z',
    expires_at: '2027-09-25T10:00:00Z',
    days_remaining: 365,
    modules: ['pos', 'informal'],
  },
  {
    id: 2,
    license_key: 'TC-200918234-BC190284F912-20270325',
    customer_name: 'Restaurante & Bar Marítimo Matola',
    nuit: '200918234',
    customer_phone: '+258 82 444 5566',
    customer_email: 'gerencia@maritimomatola.mz',
    plan: 'pro',
    status: 'active',
    is_active: true,
    issued_at: '2026-09-20T14:30:00Z',
    expires_at: '2027-03-20T14:30:00Z',
    days_remaining: 176,
    modules: ['pos', 'informal', 'restaurant', 'accounting', 'manufacturing'],
  },
  {
    id: 3,
    license_key: 'TC-300819482-990182AFBC01-20270925',
    customer_name: 'Agro-Avícola Moamba Lda',
    nuit: '300819482',
    customer_phone: '+258 87 999 8877',
    customer_email: 'contato@avicolamoamba.co.mz',
    plan: 'enterprise',
    status: 'active',
    is_active: true,
    issued_at: '2026-09-15T09:00:00Z',
    expires_at: '2027-09-15T09:00:00Z',
    days_remaining: 355,
    modules: ['pos', 'informal', 'restaurant', 'accounting', 'manufacturing', 'crm', 'poultry', 'takeaway', 'hr', '*'],
  },
];

export const useAdminLicenseStore = create<AdminLicenseState>((set, get) => ({
  licenses: INITIAL_LICENSES,
  stats: {
    total_licenses: 3,
    active_licenses: 3,
    expiring_soon: 0,
    mrr_mzn: 9800,
  },
  isLoading: false,
  error: null,

  fetchLicenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<any>('/admin/licenses');
      const payload = res.data;
      const items = Array.isArray(payload) ? payload : payload?.items || [];
      if (items.length > 0) {
        set({
          licenses: items,
          stats: {
            total_licenses: items.length,
            active_licenses: items.filter((l: any) => l.is_active || l.status === 'active').length,
            expiring_soon: items.filter((l: any) => (l.days_remaining || 0) < 30).length,
            mrr_mzn: items.reduce((sum: number, l: any) => {
              const p = (l.plan || '').toLowerCase();
              if (p === 'enterprise') return sum + 7500;
              if (p === 'pro' || p === 'complete') return sum + 3500;
              return sum + 500;
            }, 0),
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      // Manter estado local se offline
      set({ isLoading: false });
    }
  },

  generateLicense: async (data) => {
    set({ isLoading: true, error: null });
    const planClean = data.plan.toLowerCase();
    const cleanNuit = (data.nuit || '999999999').replace(/\D/g, '').padEnd(9, '0');
    const machineId = data.machine_id || `MACH-${Math.floor(1000 + Math.random() * 9000)}`;

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + data.days * 24 * 60 * 60 * 1000);
    const dateCode = expiresAt.toISOString().slice(0, 10).replace(/-/g, '');
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedKey = `TC-${cleanNuit}-${hash}-${dateCode}`;

    const newLic: AdminLicenseItem = {
      id: Date.now(),
      license_key: generatedKey,
      customer_name: data.customer_name,
      client_name: data.customer_name,
      nuit: cleanNuit,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      machine_id: machineId,
      plan: planClean,
      status: 'active',
      is_active: true,
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      days_remaining: data.days,
      modules: planClean === 'enterprise' ? ['*'] : planClean === 'pro' ? ['pos', 'restaurant', 'accounting', 'manufacturing'] : ['pos', 'informal'],
    };

    try {
      await api.post('/admin/licenses/issue', {
        nuit: cleanNuit,
        machine_id: machineId,
        plan: planClean,
        duration_days: data.days,
        client_name: data.customer_name,
        client_email: data.customer_email,
      });
    } catch {
      // Guardado localmente se offline
    }

    set((state) => {
      const updated = [newLic, ...state.licenses];
      return {
        licenses: updated,
        stats: {
          total_licenses: updated.length,
          active_licenses: updated.filter((l) => l.is_active || l.status === 'active').length,
          expiring_soon: updated.filter((l) => (l.days_remaining || 0) < 30).length,
          mrr_mzn: state.stats.mrr_mzn + (planClean === 'enterprise' ? 7500 : planClean === 'pro' ? 3500 : 500),
        },
        isLoading: false,
      };
    });

    return newLic;
  },

  revokeLicense: async (id, reason) => {
    set((state) => ({
      licenses: state.licenses.map((l) =>
        l.id === id ? { ...l, status: 'revoked', is_active: false, notes: reason, revoked_at: new Date().toISOString() } : l
      ),
    }));
    try {
      await api.post(`/admin/licenses/${id}/revoke`, { reason });
    } catch {
      // OK offline
    }
    return true;
  },

  renewLicense: async (id, days) => {
    set((state) => ({
      licenses: state.licenses.map((l) => {
        if (l.id !== id) return l;
        const currentExp = new Date(l.expires_at || new Date());
        const newExp = new Date(currentExp.getTime() + days * 24 * 60 * 60 * 1000);
        return {
          ...l,
          status: 'active',
          is_active: true,
          expires_at: newExp.toISOString(),
          days_remaining: (l.days_remaining || 0) + days,
          revoked_at: null,
        };
      }),
    }));
    try {
      await api.post(`/admin/licenses/${id}/renew`, { days });
    } catch {
      // OK offline
    }
    return true;
  },
}));
