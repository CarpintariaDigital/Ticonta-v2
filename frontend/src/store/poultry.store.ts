import { create } from "zustand";
import {
  Farm,
  Flock,
  FlockPerformance,
  FlockForecast,
  PoultryProductionReport,
} from "@/types/poultry";

interface PoultryState {
  farms: Farm[];
  selectedFarmId: number | null;
  flocks: Flock[];
  selectedFlock: Flock | null;
  performance: FlockPerformance | null;
  forecast: FlockForecast | null;
  report: PoultryProductionReport | null;

  speciesFilter: string;
  statusFilter: string;

  isNewFarmOpen: boolean;
  isNewFlockOpen: boolean;
  isDailyEggOpen: boolean;
  isFeedLogOpen: boolean;
  isMortalityOpen: boolean;
  isHealthLogOpen: boolean;
  isLoading: boolean;

  setFarms: (farms: Farm[]) => void;
  setSelectedFarmId: (farmId: number | null) => void;
  setFlocks: (flocks: Flock[]) => void;
  addFlockToState: (flock: Flock) => void;
  setSelectedFlock: (flock: Flock | null) => void;
  setPerformance: (performance: FlockPerformance | null) => void;
  setForecast: (forecast: FlockForecast | null) => void;
  setReport: (report: PoultryProductionReport | null) => void;

  setSpeciesFilter: (filter: string) => void;
  setStatusFilter: (filter: string) => void;

  setIsNewFarmOpen: (open: boolean) => void;
  setIsNewFlockOpen: (open: boolean) => void;
  setIsDailyEggOpen: (open: boolean) => void;
  setIsFeedLogOpen: (open: boolean) => void;
  setIsMortalityOpen: (open: boolean) => void;
  setIsHealthLogOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const usePoultryStore = create<PoultryState>((set) => ({
  farms: [],
  selectedFarmId: null,
  flocks: [],
  selectedFlock: null,
  performance: null,
  forecast: null,
  report: null,

  speciesFilter: "all",
  statusFilter: "all",

  isNewFarmOpen: false,
  isNewFlockOpen: false,
  isDailyEggOpen: false,
  isFeedLogOpen: false,
  isMortalityOpen: false,
  isHealthLogOpen: false,
  isLoading: false,

  setFarms: (farms) => set({ farms }),
  setSelectedFarmId: (selectedFarmId) => set({ selectedFarmId }),
  setFlocks: (flocks) => set({ flocks }),
  addFlockToState: (flock) => set((s) => ({ flocks: [flock, ...s.flocks] })),
  setSelectedFlock: (selectedFlock) => set({ selectedFlock }),
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
  setIsLoading: (isLoading) => set({ isLoading }),
}));
