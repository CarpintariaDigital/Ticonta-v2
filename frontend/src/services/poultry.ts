import { apiClient as api } from "@/services/auth";
import {
  Farm,
  Flock,
  EggProduction,
  FeedConsumption,
  HealthRecord,
  MortalityRecord,
  FlockPerformance,
  FlockForecast,
  PoultryProductionReport,
  FarmCreateInput,
  FlockCreateInput,
  EggProductionInput,
  FeedConsumptionInput,
  HealthRecordInput,
  MortalityRecordInput,
} from "@/types/poultry";

const API_PREFIX = "/api/v1/poultry";

// Mock Fallback Data
const MOCK_FARMS: Farm[] = [
  {
    id: 1,
    company_id: 1,
    name: "Quinta Avícola Matola-Rio",
    location: "Matola-Rio, Bairro Mussumbuluco",
    total_capacity: 5000,
    owner_id: 1,
    active: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    company_id: 1,
    name: "Exploração de Poedeiras Boane",
    location: "Boane, Campo 2, Maputo",
    total_capacity: 3500,
    owner_id: 1,
    active: true,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_FLOCKS: Flock[] = [
  {
    id: 1,
    farm_id: 1,
    flock_number: "LOTE-2026-001",
    species: "chicken_broiler",
    quantity_at_start: 1000,
    quantity_current: 978,
    cost_per_bird: 55,
    feed_type: "Ração Crescimento 50kg",
    start_date: new Date(Date.now() - 25 * 86400000).toISOString().split("T")[0],
    expected_slaughter_date: new Date(Date.now() + 13 * 86400000).toISOString().split("T")[0],
    expected_first_lay_date: null,
    status: "growing",
    notes: "Lote Cobb 500 em ótima conversão alimentar",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    farm_id: 2,
    flock_number: "LOTE-2026-002",
    species: "chicken_layer",
    quantity_at_start: 800,
    quantity_current: 785,
    cost_per_bird: 110,
    feed_type: "Ração Postura 50kg",
    start_date: new Date(Date.now() - 140 * 86400000).toISOString().split("T")[0],
    expected_slaughter_date: null,
    expected_first_lay_date: new Date(Date.now() - 15 * 86400000).toISOString().split("T")[0],
    status: "producing",
    notes: "Lohmann Brown com pico de postura de 88%",
    created_at: new Date(Date.now() - 140 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_EGGS: EggProduction[] = [
  {
    id: 1,
    flock_id: 2,
    production_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    quantity: 690,
    quality: "grade_a",
    broken_quantity: 10,
    notes: "Colheita matinal e vespertina",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    flock_id: 2,
    production_date: new Date().toISOString().split("T")[0],
    quantity: 710,
    quality: "grade_a",
    broken_quantity: 8,
    notes: "Ótima qualidade de casca",
    created_at: new Date().toISOString(),
  },
];

class PoultryService {
  /**
   * Criar quinta
   */
  async createFarm(data: FarmCreateInput, companyId = 1): Promise<Farm> {
    try {
      const response = await api.post<Farm>(`${API_PREFIX}/farms`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const newFarm: Farm = {
        id: Date.now(),
        company_id: companyId,
        name: data.name,
        location: data.location,
        total_capacity: data.total_capacity || 1000,
        owner_id: data.owner_id || null,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_FARMS.push(newFarm);
      return newFarm;
    }
  }

  /**
   * Listar quintas
   */
  async getFarms(companyId = 1): Promise<Farm[]> {
    try {
      const response = await api.get<Farm[]>(`${API_PREFIX}/farms`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      return MOCK_FARMS;
    }
  }

  /**
   * Criar lote de aves
   */
  async createFlock(data: FlockCreateInput, companyId = 1): Promise<Flock> {
    try {
      const response = await api.post<Flock>(`${API_PREFIX}/flocks`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const start = data.start_date || new Date().toISOString().split("T")[0];
      const newFlock: Flock = {
        id: Date.now(),
        farm_id: data.farm_id,
        flock_number: data.flock_number || `LOTE-2026-${String(MOCK_FLOCKS.length + 1).padStart(3, "0")}`,
        species: data.species,
        quantity_at_start: data.quantity_at_start,
        quantity_current: data.quantity_at_start,
        cost_per_bird: data.cost_per_bird,
        feed_type: data.feed_type || "Ração Inicial",
        start_date: start,
        expected_slaughter_date:
          data.expected_slaughter_date ||
          (data.species === "chicken_broiler"
            ? new Date(Date.now() + 38 * 86400000).toISOString().split("T")[0]
            : null),
        expected_first_lay_date:
          data.expected_first_lay_date ||
          (data.species === "chicken_layer"
            ? new Date(Date.now() + 130 * 86400000).toISOString().split("T")[0]
            : null),
        status: "growing",
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_FLOCKS.unshift(newFlock);
      return newFlock;
    }
  }

  /**
   * Listar lotes
   */
  async getFlocks(
    farmId?: number,
    species?: string,
    statusFilter?: string,
    companyId = 1
  ): Promise<Flock[]> {
    try {
      const response = await api.get<Flock[]>(`${API_PREFIX}/flocks`, {
        params: {
          farm_id: farmId,
          species,
          status: statusFilter,
          company_id: companyId,
        },
      });
      return response.data;
    } catch {
      let list = [...MOCK_FLOCKS];
      if (farmId) list = list.filter((f) => f.farm_id === farmId);
      if (species && species !== "all") list = list.filter((f) => f.species === species);
      if (statusFilter && statusFilter !== "all") list = list.filter((f) => f.status === statusFilter);
      return list;
    }
  }

  /**
   * Obter detalhe do lote
   */
  async getFlock(id: number): Promise<Flock> {
    try {
      const response = await api.get<Flock>(`${API_PREFIX}/flocks/${id}`);
      return response.data;
    } catch {
      const found = MOCK_FLOCKS.find((f) => f.id === id);
      if (!found) throw new Error("Lote não encontrado");
      return found;
    }
  }

  /**
   * Registar colheita diária de ovos
   */
  async recordEggProduction(flockId: number, data: EggProductionInput): Promise<EggProduction> {
    try {
      const response = await api.post<EggProduction>(
        `${API_PREFIX}/flocks/${flockId}/production`,
        data
      );
      return response.data;
    } catch {
      const record: EggProduction = {
        id: Date.now(),
        flock_id: flockId,
        production_date: data.production_date || new Date().toISOString().split("T")[0],
        quantity: data.quantity,
        quality: data.quality || "grade_a",
        broken_quantity: data.broken_quantity || 0,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
      };
      MOCK_EGGS.unshift(record);
      return record;
    }
  }

  /**
   * Registar consumo de ração
   */
  async recordFeedConsumption(flockId: number, data: FeedConsumptionInput): Promise<FeedConsumption> {
    try {
      const response = await api.post<FeedConsumption>(
        `${API_PREFIX}/flocks/${flockId}/feed`,
        data
      );
      return response.data;
    } catch {
      const kg = data.kg_used || data.bags_used * 50;
      const cost = data.cost || data.bags_used * 1950;
      return {
        id: Date.now(),
        flock_id: flockId,
        feed_id: data.feed_id || null,
        consumption_date: data.consumption_date || new Date().toISOString().split("T")[0],
        bags_used: data.bags_used,
        kg_used: kg,
        cost,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Registar mortes
   */
  async recordMortality(flockId: number, data: MortalityRecordInput): Promise<MortalityRecord> {
    try {
      const response = await api.post<MortalityRecord>(
        `${API_PREFIX}/flocks/${flockId}/mortality`,
        data
      );
      return response.data;
    } catch {
      const flock = MOCK_FLOCKS.find((f) => f.id === flockId);
      if (flock) {
        flock.quantity_current = Math.max(0, flock.quantity_current - data.quantity);
      }
      return {
        id: Date.now(),
        flock_id: flockId,
        record_date: data.record_date || new Date().toISOString().split("T")[0],
        quantity: data.quantity,
        cause: data.cause || "unknown",
        notes: data.notes || null,
        created_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Registar tratamento / vacinação
   */
  async recordHealthIssue(flockId: number, data: HealthRecordInput): Promise<HealthRecord> {
    try {
      const response = await api.post<HealthRecord>(
        `${API_PREFIX}/flocks/${flockId}/health`,
        data
      );
      return response.data;
    } catch {
      return {
        id: Date.now(),
        flock_id: flockId,
        record_date: data.record_date || new Date().toISOString().split("T")[0],
        disease: data.disease,
        birds_affected: data.birds_affected || 0,
        treatment: data.treatment,
        cost: data.cost || 0,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Métricas de desempenho zootécnico (FCR, mortalidade %, custo/ave)
   */
  async getFlockPerformance(flockId: number): Promise<FlockPerformance> {
    try {
      const response = await api.get<FlockPerformance>(
        `${API_PREFIX}/flocks/${flockId}/performance`
      );
      return response.data;
    } catch {
      const flock = MOCK_FLOCKS.find((f) => f.id === flockId) || MOCK_FLOCKS[0];
      const startD = new Date(flock.start_date);
      const ageInDays = Math.max(1, Math.floor((Date.now() - startD.getTime()) / 86400000));
      const dead = flock.quantity_at_start - flock.quantity_current;
      const mortRate = (dead / flock.quantity_at_start) * 100;
      const totalFeedKg = ageInDays * flock.quantity_current * 0.09;
      const initialCost = flock.cost_per_bird * flock.quantity_at_start;
      const feedCost = (totalFeedKg / 50) * 1950;
      const medsCost = 1500;
      const totalCost = initialCost + feedCost + medsCost;

      return {
        flock_id: flock.id,
        flock_number: flock.flock_number,
        species: flock.species,
        age_in_days: ageInDays,
        quantity_at_start: flock.quantity_at_start,
        quantity_current: flock.quantity_current,
        cumulative_mortality: dead,
        mortality_rate_percent: Number(mortRate.toFixed(2)),
        total_feed_consumed_kg: Number(totalFeedKg.toFixed(1)),
        feed_conversion_ratio_fcr: 1.62,
        average_feed_per_bird_per_day_grams: 95.5,
        total_eggs_collected: flock.species === "chicken_layer" ? 1420 : 0,
        laying_percentage_current: flock.species === "chicken_layer" ? 88.5 : 0,
        cost_per_bird_accumulated: Number((totalCost / flock.quantity_current).toFixed(2)),
        total_accumulated_cost: Number(totalCost.toFixed(2)),
        cost_breakdown: {
          initial_birds: initialCost,
          feed: feedCost,
          health_and_meds: medsCost,
        },
      };
    }
  }

  /**
   * Previsão de abate e receita futura
   */
  async getFlockForecast(flockId: number): Promise<FlockForecast> {
    try {
      const response = await api.get<FlockForecast>(
        `${API_PREFIX}/flocks/${flockId}/forecast`
      );
      return response.data;
    } catch {
      const flock = MOCK_FLOCKS.find((f) => f.id === flockId) || MOCK_FLOCKS[0];
      const daysLeft = 13;
      const totalCost = flock.quantity_current * 185;
      const revenue = flock.quantity_current * 280;
      const profit = revenue - totalCost;

      return {
        flock_id: flock.id,
        flock_number: flock.flock_number,
        species: flock.species,
        current_age_days: 25,
        projected_ready_date: new Date(Date.now() + daysLeft * 86400000).toISOString().split("T")[0],
        days_remaining: daysLeft,
        estimated_final_weight_kg: 2.2,
        estimated_total_cost_at_sale: totalCost,
        projected_revenue_at_sale: revenue,
        projected_net_profit: profit,
        projected_roi_percent: Number(((profit / totalCost) * 100).toFixed(1)),
        forecast_notes: [
          "Lote de frangos de corte pronto para abate e comercialização em 13 dias.",
          "Previsão de peso médio vivo de 2.2 kg com preço de mercado a 280 MT/frango.",
        ],
      };
    }
  }

  /**
   * Relatório completo da exploração
   */
  async getProductionReport(
    farmId: number,
    startDate?: string,
    endDate?: string,
    companyId = 1
  ): Promise<PoultryProductionReport> {
    try {
      const response = await api.get<PoultryProductionReport>(`${API_PREFIX}/reports`, {
        params: {
          farm_id: farmId,
          start_date: startDate,
          end_date: endDate,
          company_id: companyId,
        },
      });
      return response.data;
    } catch {
      const farm = MOCK_FARMS.find((f) => f.id === farmId) || MOCK_FARMS[0];
      return {
        farm_id: farm.id,
        farm_name: farm.name,
        period_start: startDate || null,
        period_end: endDate || null,
        total_flocks: 2,
        active_flocks: 2,
        live_birds_count: 1763,
        total_mortality_count: 37,
        overall_mortality_rate_percent: 2.05,
        total_eggs_harvested: 1420,
        total_feed_consumed_kg: 2850,
        total_feed_cost: 111150,
        total_health_meds_cost: 3000,
        total_bird_acquisition_cost: 143000,
        total_estimated_revenue: 325000,
        net_production_profit: 67850,
        generated_at: new Date().toISOString(),
      };
    }
  }
}

export const poultryService = new PoultryService();
