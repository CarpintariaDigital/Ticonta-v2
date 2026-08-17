import { describe, it, expect, beforeEach } from "vitest";
import { usePoultryStore } from "@/store/poultry.store";
import { Farm, Flock, FlockPerformance } from "@/types/poultry";

describe("usePoultryStore", () => {
  beforeEach(() => {
    usePoultryStore.setState({
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
    });
  });

  it("initializes with default poultry farm state", () => {
    const state = usePoultryStore.getState();
    expect(state.farms).toEqual([]);
    expect(state.selectedFarmId).toBeNull();
    expect(state.flocks).toEqual([]);
    expect(state.selectedFlock).toBeNull();
    expect(state.performance).toBeNull();
    expect(state.forecast).toBeNull();
    expect(state.report).toBeNull();
    expect(state.isNewFlockOpen).toBe(false);
  });

  it("sets farms and selected farm id", () => {
    const mockFarm: Farm = {
      id: 1,
      company_id: 1,
      name: "Quinta Matola-Rio",
      location: "Matola-Rio",
      total_capacity: 5000,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    usePoultryStore.getState().setFarms([mockFarm]);
    usePoultryStore.getState().setSelectedFarmId(mockFarm.id);

    const state = usePoultryStore.getState();
    expect(state.farms).toHaveLength(1);
    expect(state.farms[0].name).toBe("Quinta Matola-Rio");
    expect(state.selectedFarmId).toBe(1);
  });

  it("manages flocks and adding new flock", () => {
    const mockFlock: Flock = {
      id: 10,
      farm_id: 1,
      flock_number: "LOTE-2026-001",
      species: "chicken_broiler",
      quantity_at_start: 1000,
      quantity_current: 980,
      cost_per_bird: 55,
      start_date: "2026-08-01",
      status: "growing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    usePoultryStore.getState().addFlockToState(mockFlock);
    usePoultryStore.getState().setSelectedFlock(mockFlock);

    const state = usePoultryStore.getState();
    expect(state.flocks).toHaveLength(1);
    expect(state.flocks[0].flock_number).toBe("LOTE-2026-001");
    expect(state.selectedFlock?.quantity_current).toBe(980);
  });

  it("sets flock performance metrics and FCR", () => {
    const mockPerf: FlockPerformance = {
      flock_id: 10,
      flock_number: "LOTE-2026-001",
      species: "chicken_broiler",
      age_in_days: 28,
      quantity_at_start: 1000,
      quantity_current: 980,
      cumulative_mortality: 20,
      mortality_rate_percent: 2.0,
      total_feed_consumed_kg: 2900,
      feed_conversion_ratio_fcr: 1.62,
      average_feed_per_bird_per_day_grams: 95.5,
      total_eggs_collected: 0,
      laying_percentage_current: 0,
      cost_per_bird_accumulated: 130.5,
      total_accumulated_cost: 127890,
      cost_breakdown: {
        initial_birds: 55000,
        feed: 70890,
        health_and_meds: 2000,
      },
    };

    usePoultryStore.getState().setPerformance(mockPerf);

    const state = usePoultryStore.getState();
    expect(state.performance?.feed_conversion_ratio_fcr).toBe(1.62);
    expect(state.performance?.mortality_rate_percent).toBe(2.0);
    expect(state.performance?.cost_per_bird_accumulated).toBe(130.5);
  });

  it("toggles all poultry modal forms", () => {
    usePoultryStore.getState().setIsNewFlockOpen(true);
    usePoultryStore.getState().setIsDailyEggOpen(true);
    usePoultryStore.getState().setIsFeedLogOpen(true);
    usePoultryStore.getState().setIsMortalityOpen(true);
    usePoultryStore.getState().setIsHealthLogOpen(true);

    const state = usePoultryStore.getState();
    expect(state.isNewFlockOpen).toBe(true);
    expect(state.isDailyEggOpen).toBe(true);
    expect(state.isFeedLogOpen).toBe(true);
    expect(state.isMortalityOpen).toBe(true);
    expect(state.isHealthLogOpen).toBe(true);
  });
});
