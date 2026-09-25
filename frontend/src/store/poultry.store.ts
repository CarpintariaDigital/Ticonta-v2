import { create } from 'zustand';
import {
  Farm,
  Flock,
  DailyRecord,
  FlockPerformance,
  MortalityAlert,
  PoultryReport,
} from '../types/poultry';

export interface PoultryState {
  farms: Farm[];
  selectedFarmId: number | null;
  flocks: Flock[];
  selectedFlock: Flock | null;
  performance: FlockPerformance | null;
  forecast: any;
  report: PoultryReport | null;
  speciesFilter: string;
  statusFilter: string;
  isNewFarmOpen: boolean;
  isNewFlockOpen: boolean;
  isDailyEggOpen: boolean;
  isFeedLogOpen: boolean;
  isMortalityOpen: boolean;
  isHealthLogOpen: boolean;
  isLoading: boolean;
  error: string | null;
  dailyRecords: DailyRecord[];
  alerts: MortalityAlert[];

  // Actions
  setFarms: (farms: Farm[]) => void;
  setSelectedFarmId: (id: number | null) => void;
  setFlocks: (flocks: Flock[]) => void;
  addFlockToState: (flock: Flock) => void;
  setSelectedFlock: (flock: Flock | null) => void;
  setPerformance: (performance: FlockPerformance | null) => void;
  setForecast: (forecast: any) => void;
  setReport: (report: PoultryReport | null) => void;
  setSpeciesFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;
  setIsNewFarmOpen: (open: boolean) => void;
  setIsNewFlockOpen: (open: boolean) => void;
  setIsDailyEggOpen: (open: boolean) => void;
  setIsFeedLogOpen: (open: boolean) => void;
  setIsMortalityOpen: (open: boolean) => void;
  setIsHealthLogOpen: (open: boolean) => void;

  fetchFlocks: () => Promise<void>;
  addDailyRecord: (record: DailyRecord) => Promise<void>;
  checkMortalityAlerts: () => void;
  generateReport: (flockId: number | string, period?: string) => Promise<PoultryReport | null>;
}

export const usePoultryStore = create<PoultryState>((set, get) => ({
  farms: [],
  selectedFarmId: null,
  flocks: [],
  selectedFlock: null,
  performance: null,
  forecast: null,
  report: null,
  speciesFilter: 'all',
  statusFilter: 'all',
  isNewFarmOpen: false,
  isNewFlockOpen: false,
  isDailyEggOpen: false,
  isFeedLogOpen: false,
  isMortalityOpen: false,
  isHealthLogOpen: false,
  isLoading: false,
  error: null,
  dailyRecords: [],
  alerts: [],

  setFarms: (farms) => set({ farms }),
  setSelectedFarmId: (id) => set({ selectedFarmId: id }),
  setFlocks: (flocks) => set({ flocks }),
  addFlockToState: (flock) =>
    set((state) => ({ flocks: [flock, ...state.flocks] })),
  setSelectedFlock: (flock) => set({ selectedFlock: flock }),
  setPerformance: (performance) => set({ performance }),
  setForecast: (forecast) => set({ forecast }),
  setReport: (report) => set({ report }),
  setSpeciesFilter: (speciesFilter) => set({ speciesFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setIsNewFarmOpen: (isNewFarmOpen) => set({ isNewFarmOpen }),
  setIsNewFlockOpen: (isNewFlockOpen) => set({ isNewFlockOpen }),
  setIsDailyEggOpen: (isDailyEggOpen) => set({ isDailyEggOpen }),
  setIsFeedLogOpen: (isFeedLogOpen) => set({ isFeedLogOpen }),
  setIsMortalityOpen: (isMortalityOpen) => set({ isMortalityOpen }),
  setIsHealthLogOpen: (isHealthLogOpen) => set({ isHealthLogOpen }),

  fetchFlocks: async () => {
    set({ isLoading: true });
    try {
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addDailyRecord: async (record) => {
    set((state) => ({
      dailyRecords: [record, ...state.dailyRecords],
    }));
    get().checkMortalityAlerts();
  },

  checkMortalityAlerts: () => {
    const records = get().dailyRecords;
    const alerts: MortalityAlert[] = [];
    records.forEach((r) => {
      if (r.mortality_rate && r.mortality_rate > 5) {
        alerts.push({
          flock_id: r.flock_id,
          date: r.date,
          mortality_rate: r.mortality_rate,
          threshold: 5,
          message: `Alerta: Taxa de mortalidade em ${r.mortality_rate}% excede o limite de 5%!`,
        });
      }
    });
    set({ alerts });
  },

  generateReport: async (flockId) => {
    const flock = get().flocks.find((f) => String(f.id) === String(flockId));
    if (!flock) return null;
    const report: PoultryReport = {
      flock_id: flock.id,
      total_feed_consumed: 0,
      total_eggs: 0,
      mortality_total: 0,
      fcr: 0,
      surviving_birds: flock.current_quantity,
    };
    set({ report });
    return report;
  },
}));
