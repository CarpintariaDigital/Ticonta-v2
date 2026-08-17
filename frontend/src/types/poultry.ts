export type PoultrySpecies = "chicken_broiler" | "chicken_layer" | "quail" | "duck";
export type FlockStatus = "growing" | "producing" | "sold" | "culled" | "closed";
export type EggQuality = "grade_a" | "grade_b" | "grade_c";

export interface Farm {
  id: number;
  company_id: number;
  name: string;
  location: string;
  total_capacity: number;
  owner_id?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Flock {
  id: number;
  farm_id: number;
  flock_number: string;
  species: PoultrySpecies;
  quantity_at_start: number;
  quantity_current: number;
  cost_per_bird: number;
  feed_type?: string | null;
  start_date: string;
  expected_slaughter_date?: string | null;
  expected_first_lay_date?: string | null;
  status: FlockStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EggProduction {
  id: number;
  flock_id: number;
  production_date: string;
  quantity: number;
  quality: EggQuality;
  broken_quantity: number;
  notes?: string | null;
  created_at: string;
}

export interface FeedStock {
  id: number;
  farm_id: number;
  feed_type: string;
  cost_per_bag: number;
  bag_weight_kg: number;
  quantity_in_stock: number;
  supplier?: string | null;
  date_last_purchase?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedConsumption {
  id: number;
  flock_id: number;
  feed_id?: number | null;
  consumption_date: string;
  bags_used: number;
  kg_used: number;
  cost: number;
  notes?: string | null;
  created_at: string;
}

export interface HealthRecord {
  id: number;
  flock_id: number;
  record_date: string;
  disease: string;
  birds_affected: number;
  treatment: string;
  cost: number;
  notes?: string | null;
  created_at: string;
}

export interface MortalityRecord {
  id: number;
  flock_id: number;
  record_date: string;
  quantity: number;
  cause: string;
  notes?: string | null;
  created_at: string;
}

export interface FlockPerformance {
  flock_id: number;
  flock_number: string;
  species: string;
  age_in_days: number;
  quantity_at_start: number;
  quantity_current: number;
  cumulative_mortality: number;
  mortality_rate_percent: number;
  total_feed_consumed_kg: number;
  feed_conversion_ratio_fcr: number;
  average_feed_per_bird_per_day_grams: number;
  total_eggs_collected: number;
  laying_percentage_current: number;
  cost_per_bird_accumulated: number;
  total_accumulated_cost: number;
  cost_breakdown: {
    initial_birds: number;
    feed: number;
    health_and_meds: number;
  };
}

export interface FlockForecast {
  flock_id: number;
  flock_number: string;
  species: string;
  current_age_days: number;
  projected_ready_date?: string | null;
  days_remaining: number;
  estimated_final_weight_kg: number;
  estimated_total_cost_at_sale: number;
  projected_revenue_at_sale: number;
  projected_net_profit: number;
  projected_roi_percent: number;
  forecast_notes: string[];
}

export interface PoultryProductionReport {
  farm_id: number;
  farm_name: string;
  period_start?: string | null;
  period_end?: string | null;
  total_flocks: number;
  active_flocks: number;
  live_birds_count: number;
  total_mortality_count: number;
  overall_mortality_rate_percent: number;
  total_eggs_harvested: number;
  total_feed_consumed_kg: number;
  total_feed_cost: number;
  total_health_meds_cost: number;
  total_bird_acquisition_cost: number;
  total_estimated_revenue: number;
  net_production_profit: number;
  generated_at: string;
}

// Input Types
export interface FarmCreateInput {
  name: string;
  location: string;
  total_capacity?: number;
  owner_id?: number;
  company_id?: number;
}

export interface FlockCreateInput {
  farm_id: number;
  flock_number?: string;
  species: PoultrySpecies;
  quantity_at_start: number;
  cost_per_bird: number;
  feed_type?: string;
  start_date?: string;
  expected_slaughter_date?: string;
  expected_first_lay_date?: string;
  notes?: string;
}

export interface EggProductionInput {
  production_date?: string;
  quantity: number;
  quality?: EggQuality;
  broken_quantity?: number;
  notes?: string;
}

export interface FeedConsumptionInput {
  consumption_date?: string;
  bags_used: number;
  kg_used?: number;
  cost?: number;
  feed_id?: number;
  notes?: string;
}

export interface HealthRecordInput {
  record_date?: string;
  disease: string;
  birds_affected?: number;
  treatment: string;
  cost?: number;
  notes?: string;
}

export interface MortalityRecordInput {
  record_date?: string;
  quantity: number;
  cause?: string;
  notes?: string;
}
