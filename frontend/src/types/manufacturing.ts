export type WorkOrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface WorkOrderMaterial {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost?: number;
}

export interface WorkOrder {
  id: number;
  company_id: number;
  project_id?: number;
  project_name?: string;
  order_number: string;
  description: string;
  status: WorkOrderStatus;
  budget: number;
  actual_cost: number;
  profit: number;
  start_date: string;
  end_date?: string;
  created_at: string;
  materials: WorkOrderMaterial[];
}

export interface BudgetCalculationInput {
  material_cost: number;
  labor_hours: number;
  labor_rate: number;
  overhead_percentage: number;
  margin_percentage: number;
}

export interface BudgetCalculationResult {
  material_cost: number;
  labor_hours: number;
  labor_rate: number;
  labor_cost: number;
  overhead_percentage: number;
  overhead_cost: number;
  total_direct_cost: number;
  margin_percentage: number;
  final_price: number;
  profit: number;
}

export interface PieceInput {
  name: string;
  length: number; // mm
  width: number;  // mm
  quantity: number;
}

export interface CuttingPlanInput {
  sheet_length: number; // mm
  sheet_width: number;  // mm
  blade_thickness: number;
  pieces: PieceInput[];
}

export interface PlacedPiece {
  sheet_index: number;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  rotated?: boolean;
}

export interface CuttingPlanResult {
  sheet_length: number;
  sheet_width: number;
  total_sheets_needed: number;
  total_pieces: number;
  used_area_m2: number;
  total_sheet_area_m2: number;
  efficiency_percentage: number;
  waste_percentage: number;
  placed_pieces: PlacedPiece[];
}

export interface CreateWorkOrderInput {
  company_id?: number;
  project_id?: number;
  description: string;
  budget: number;
  start_date?: string;
  end_date?: string;
  materials: WorkOrderMaterial[];
}
