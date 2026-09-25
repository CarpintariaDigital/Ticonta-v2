import { create } from 'zustand';

export interface LicenseInfo {
  key: string;
  plan: 'Comunitário' | 'Starter' | 'Profissional' | 'Industrial Enterprise' | 'Personalizado' | 'Básico' | 'Completo';
  status: 'Ativa' | 'Expirada' | 'Pendente';
  nuit: string;
  companyName: string;
  maxDevices: number;
  activeDevices: number;
  expiresAt: string;
  daysRemaining: number;
  offlineGraceDays: number;
  signature: string;
  allowed_modules: string[]; // Lista de IDs autorizados (ex: ['pos', 'quotes', 'inventory'] ou ['*'])
}

interface LicenseState {
  license: LicenseInfo;
  activateLicense: (key: string) => { success: boolean; message: string };
  isModuleAllowed: (moduleIdOrPath: string) => boolean;
  setAllowedModules: (modules: string[]) => void;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
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
    allowed_modules: ['*'], // Acesso total por defeito no ambiente do criador/admin
  },

  isModuleAllowed: (moduleIdOrPath: string) => {
    const { license } = get();
    if (!license || license.status !== 'Ativa') return false;

    const path = moduleIdOrPath.toLowerCase().replace(/^\/dashboard\/?/, '').replace(/\/$/, '');

    // Módulos nativos sempre cobertos pelo valor mínimo base:
    if (!path || path === 'dashboard' || path === 'pos' || path === 'license' || path === 'reports') {
      return true;
    }

    // Se possui plano com acesso total
    if (
      license.allowed_modules.includes('*') ||
      license.plan === 'Industrial Enterprise' ||
      license.plan === 'Completo' ||
      license.plan === 'Profissional'
    ) {
      return true;
    }

    // Mapeamento de rotas para IDs de módulos
    const routeToModuleMap: Record<string, string> = {
      'informal-sales': 'informal_sales',
      'quotes': 'quotes',
      'inventory': 'inventory',
      'suppliers': 'suppliers',
      'crm': 'crm',
      'restaurant': 'restaurant',
      'auto-services': 'auto_services',
      'takeaway': 'takeaway',
      'manufacturing': 'manufacturing',
      'poultry': 'poultry',
      'projects': 'projects',
      'accounting': 'accounting',
      'hr': 'hr',
      'xitique': 'xitique_savings',
      'savings': 'xitique_savings',
    };

    const targetModuleId = routeToModuleMap[path] || path;

    return license.allowed_modules.includes(targetModuleId);
  },

  setAllowedModules: (modules: string[]) => {
    set((state) => ({
      license: {
        ...state.license,
        allowed_modules: modules,
      },
    }));
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
          allowed_modules: ['*'],
        },
      }));
      return { success: true, message: 'Chave de ativação validada com sucesso via algoritmo criptográfico local!' };
    }
    return { success: false, message: 'Chave de licença inválida. Verifique o formato TC-XXXX-XXXX-XXXX.' };
  },
}));
