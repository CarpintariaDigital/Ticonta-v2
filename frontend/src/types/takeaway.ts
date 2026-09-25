export type TakeawayStatus =
  | "received"
  | "pending"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "collected"
  | "cancelled";

export interface TakeawayDelivery {
  driver_name?: string;
  driver_phone?: string;
  delivery_address?: string;
  delivery_fee?: number;
  assigned_at?: string;
  delivered_at?: string;
}

export interface TakeawayItem {
  id?: string | number;
  product_id?: number;
  name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface TakeawayOrder {
  id: number;
  company_id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: "takeaway" | "delivery";
  status: TakeawayStatus;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: "pending" | "partial" | "paid";
  estimated_prep_minutes?: number;
  estimated_delivery_minutes?: number;
  items?: TakeawayItem[];
  delivery?: TakeawayDelivery | null;
  created_at?: string;
  updated_at?: string;
}

export interface TakeawaySlot {
  id?: string | number;
  time_slot: string;
  capacity: number;
  booked_count: number;
}
