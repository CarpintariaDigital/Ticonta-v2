export type TakeawayType = "takeaway" | "delivery";
export type TakeawayStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "in_transit"
  | "delivered"
  | "picked_up"
  | "cancelled";

export type DeliveryStatus = "pending" | "assigned" | "in_transit" | "delivered" | "failed" | "cancelled";

export interface TakeawayOrderItem {
  id: number;
  takeaway_order_id: number;
  menu_item_id?: number | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_requests?: string | null;
  preparation_status: string;
  created_at: string;
}

export interface Delivery {
  id: number;
  company_id: number;
  order_id: number;
  delivery_person_id?: number | null;
  delivery_person_name?: string | null;
  delivery_person_phone?: string | null;
  delivery_address: string;
  delivery_phone: string;
  estimated_delivery_time?: string | null;
  actual_delivery_time?: string | null;
  delivery_fee: number;
  delivery_status: DeliveryStatus;
  tracking_code: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TakeawayOrder {
  id: number;
  company_id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: TakeawayType;
  status: TakeawayStatus;
  delivery_address?: string | null;
  delivery_time?: string | null;
  special_instructions?: string | null;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: string;
  estimated_prep_minutes: number;
  estimated_delivery_minutes: number;
  estimated_ready_at?: string | null;
  ready_at?: string | null;
  pickup_at?: string | null;
  created_at: string;
  updated_at: string;
  items: TakeawayOrderItem[];
  delivery?: Delivery | null;
}

export interface TakeawayOrderItemInput {
  menu_item_id?: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  special_requests?: string;
}

export interface TakeawayOrderCreate {
  customer_name: string;
  customer_phone: string;
  order_type: TakeawayType;
  delivery_address?: string;
  delivery_time?: string | null;
  special_instructions?: string;
  payment_method?: string;
  payment_status?: string;
  items: TakeawayOrderItemInput[];
  delivery_fee?: number;
  company_id?: number;
}

export interface DeliveryAssignRequest {
  delivery_person_id?: number;
  delivery_person_name: string;
  delivery_person_phone?: string;
  estimated_minutes?: number;
}

export interface DeliveryStatusUpdateRequest {
  delivery_status: DeliveryStatus;
  notes?: string;
}

export interface OrderStatusUpdateRequest {
  status: TakeawayStatus;
  notes?: string;
}

export interface OrderTrackingStep {
  step_number: number;
  label: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string | null;
}

export interface OrderTrackingResponse {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: TakeawayType;
  current_status: TakeawayStatus;
  tracking_code?: string | null;
  estimated_ready_time?: string | null;
  estimated_delivery_time?: string | null;
  total_estimated_minutes: number;
  delivery_person_name?: string | null;
  delivery_person_phone?: string | null;
  delivery_address?: string | null;
  steps: OrderTrackingStep[];
  items_summary: string[];
  total_amount: number;
}

export interface TakeawayStatsResponse {
  company_id: number;
  total_orders_today: number;
  takeaway_count: number;
  delivery_count: number;
  pending_count: number;
  preparing_count: number;
  ready_count: number;
  in_transit_count: number;
  completed_today: number;
  total_revenue_today: number;
  average_prep_time_minutes: number;
}
