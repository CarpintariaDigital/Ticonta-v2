export interface Farm {
  id: number;
  company_id: number;
  name: string;
  location: string;
  total_capacity: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Flock {
  id: number;
  farm_id: number;
  farm_name?: string;
  name: string;
  species: "layer" | "broiler" | "dual" | string;
  initial_quantity: number;
  current_quantity: number;
  entry_date: string;
  status: "active" | "sold" | "closed" | string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyRecord {
  id?: number;
  flock_id: number;
  date: string;
  eggs_collected?: number;
  mortality_count?: number;
  feed_consumed_kg?: number;
  notes?: string;
}

export interface FlockPerformance {
  flock_id: number;
  total_eggs?: number;
  total_mortality?: number;
  mortality_rate_percent?: number;
  fcr?: number; // Feed Conversion Ratio
  current_age_weeks?: number;
}

export interface FCRRecord {
  feed_kg: number;
  weight_gain_kg: number;
  ratio: number;
}

export interface MortalityAlert {
  flock_id: number;
  date: string;
  mortality_percentage: number;
  threshold_percentage: number;
  message: string;
}

export interface PoultryReport {
  farm_id: number;
  flock_count: number;
  total_birds: number;
  egg_production_today: number;
  feed_consumed_today_kg: number;
}
