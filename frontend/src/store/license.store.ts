import { create } from 'zustand';
import { licensingService, LicenseInfo } from '../services/licensing';

export type LicenseStatus = 'licensed' | 'unlicensed' | 'expired';

export interface LicenseState {
  license: LicenseInfo | null;
  status: LicenseStatus;
  plan: string | null;
  activeModules: string[];
  licenseKey: string | null;
  expiresAt: string | null;
  daysRemaining: number;
  daysUntilExpiry: number;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;

  hasModule: (moduleName: string) => boolean;
  setLicenseData: (data: Partial<LicenseState>) => void;
  loadLicense: () => Promise<void>;
  activateLicense: (key: string) => Promise<boolean>;
  checkExpiry: () => void;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
  license: null,
  status: 'unlicensed',
  plan: null,
  activeModules: [],
  licenseKey: null,
  expiresAt: null,
  daysRemaining: 0,
  daysUntilExpiry: 0,
  isValid: false,
  isLoading: false,
  error: null,

  hasModule: (moduleName: string) => {
    const modules = get().activeModules || [];
    return modules.includes('*') || modules.includes(moduleName);
  },

  setLicenseData: (data) => set((state) => ({ ...state, ...data })),

  loadLicense: async () => {
    set({ isLoading: true, error: null });
    try {
      const info = licensingService.getLicenseInfo();
      if (info) {
        const days = licensingService.getDaysUntilExpiry();
        const valid = days > 0;
        set({
          license: info,
          licenseKey: info.license_key,
          plan: info.plan,
          activeModules: info.active_modules,
          expiresAt: info.expires_at || null,
          daysRemaining: days,
          daysUntilExpiry: days,
          isValid: valid,
          status: valid ? 'licensed' : 'expired',
          isLoading: false,
        });
      } else {
        set({
          license: null,
          status: 'unlicensed',
          isValid: false,
          isLoading: false,
        });
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  activateLicense: async (key: string) => {
    set({ isLoading: true, error: null });
    try {
      const info = await licensingService.activateLicense(key);
      const days = licensingService.getDaysUntilExpiry();
      set({
        license: info,
        licenseKey: key,
        plan: info.plan,
        activeModules: info.active_modules,
        expiresAt: info.expires_at || null,
        daysRemaining: days,
        daysUntilExpiry: days,
        isValid: true,
        status: 'licensed',
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  checkExpiry: () => {
    const days = licensingService.getDaysUntilExpiry();
    const isValid = days > 0;
    set({
      daysRemaining: days,
      daysUntilExpiry: days,
      isValid,
      status: isValid ? 'licensed' : 'expired',
    });
  },
}));
