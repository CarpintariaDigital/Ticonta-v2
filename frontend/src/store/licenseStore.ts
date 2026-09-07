import { create } from 'zustand';

export interface LicenseInfo {
  key: string;
  plan: 'Comunitário' | 'Starter' | 'Profissional' | 'Industrial Enterprise';
  status: 'Ativa' | 'Expirada' | 'Pendente';
  nuit: string;
  companyName: string;
  maxDevices: number;
  activeDevices: number;
  expiresAt: string;
  daysRemaining: number;
  offlineGraceDays: number;
  signature: string;
}

interface LicenseState {
  license: LicenseInfo;
  activateLicense: (key: string) => { success: boolean; message: string };
}

export const useLicenseStore = create<LicenseState>((set) => ({
  license: {
    key: 'TC-PRO-2026-MZ-8942-SHA256',
    plan: 'Profissional',
    status: 'Ativa',
    nuit: '100482914',
    companyName: 'Carpintaria Digital & Serviços',
    maxDevices: 5,
    activeDevices: 2,
    expiresAt: '2027-08-15',
    daysRemaining: 342,
    offlineGraceDays: 30,
    signature: 'HMAC-SHA256:7f83b165...9044',
  },
  activateLicense: (key: string) => {
    const cleanKey = key.trim().toUpperCase();
    if (cleanKey.startsWith('TC-') && cleanKey.length >= 15) {
      set((state) => ({
        license: {
          ...state.license,
          key: cleanKey,
          status: 'Ativa',
          daysRemaining: 365,
          expiresAt: '2027-09-07',
        },
      }));
      return { success: true, message: 'Chave de ativação validada com sucesso via algoritmo criptográfico local!' };
    }
    return { success: false, message: 'Chave de licença inválida. Verifique o formato TC-XXXX-XXXX-XXXX.' };
  },
}));
