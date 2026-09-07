export type AutoServiceType =
  | "maintenance"
  | "bodywork_chapa"
  | "diagnosis"
  | "painting"
  | "tuning"
  | "full_service";

export type ServiceOrderStatus =
  | "quote"
  | "approved"
  | "in_progress"
  | "paint_booth"
  | "quality_test"
  | "ready"
  | "invoiced"
  | "cancelled";

export interface Vehicle {
  id: number;
  company_id: number;
  customer_id?: number | null;
  license_plate: string;
  make: string;
  model: string;
  year?: number | null;
  vin?: string | null;
  color?: string | null;
  fuel_type: "diesel" | "petrol" | "electric" | "hybrid";
  mileage_km: number;
  engine_size?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MechanicTechnician {
  id: number;
  company_id: number;
  name: string;
  specialty: "mechanics" | "bodywork" | "electronics_obd" | "painting" | "tuning";
  phone?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ServiceOrderItem {
  id: number;
  service_order_id: number;
  item_type: "part" | "labor" | "consumable" | "paint_material" | "tuning_kit";
  description: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  total_price: number;
  product_id?: number | null;
  is_completed: boolean;
}

export interface DtcCode {
  code: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  system?: string;
}

export interface DiagnosticReport {
  id: number;
  service_order_id: number;
  vehicle_id: number;
  scanner_tool: string;
  dtc_codes: DtcCode[];
  battery_voltage: number;
  alternator_charging_voltage: number;
  engine_compression?: string | null;
  brake_pad_wear_pct: number;
  road_test_notes?: string | null;
  technician_recommendations?: string | null;
  created_at: string;
}

export interface PaintTuningSpec {
  id: number;
  service_order_id: number;
  paint_code?: string | null;
  paint_finish: "solid" | "metallic" | "pearlescent" | "matte" | "satin";
  booth_temp_c: number;
  coats_applied: number;
  parts_to_paint: string[];
  bodywork_straightening_required: boolean;
  tuning_stage?: "stage1" | "stage2" | "stage3" | "eco_tune" | "custom" | null;
  ecu_remap_profile?: string | null;
  dyno_hp_before?: number | null;
  dyno_hp_after?: number | null;
  exhaust_modification?: string | null;
  suspension_upgrade?: string | null;
  sound_multimedia?: string | null;
  lighting_upgrade?: string | null;
}

export interface VisibleDamage {
  area: string;
  damage: string;
}

export interface ServiceOrder {
  id: number;
  company_id: number;
  order_number: string;
  vehicle_id: number;
  customer_id?: number | null;
  technician_id?: number | null;
  service_type: AutoServiceType;
  status: ServiceOrderStatus;
  entry_date: string;
  estimated_delivery?: string | null;
  completed_at?: string | null;
  entry_mileage?: number | null;
  fuel_level?: string | null;
  visible_damages: VisibleDamage[];
  belongings_left?: string | null;
  customer_complaint?: string | null;
  diagnostic_summary?: string | null;
  total_parts: number;
  total_labor: number;
  discount: number;
  iva_rate: number;
  iva_amount: number;
  total_final: number;
  sale_id?: number | null;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle;
  technician?: MechanicTechnician;
  items: ServiceOrderItem[];
  diagnostic_reports: DiagnosticReport[];
  paint_tuning_specs: PaintTuningSpec[];
}

export interface WorkshopStats {
  company_id: number;
  total_active_orders: number;
  in_boxes_count: number;
  in_paint_booth_count: number;
  in_diagnosis_count: number;
  in_tuning_count: number;
  completed_today: number;
  estimated_revenue_mzn: number;
  total_vehicles_registered: number;
}
