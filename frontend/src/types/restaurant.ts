export interface Table {
  id: number;
  company_id: number;
  table_number: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "billing";
  location?: "indoor" | "outdoor" | "terrace" | "vip" | string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: number;
  company_id: number;
  name: string;
  category: string;
  price: number;
  is_available: boolean;
  kitchen_station?: "kitchen" | "bar" | "grill" | string;
  image_url?: string;
}

export interface OrderItem {
  id?: string | number;
  product_id?: number;
  name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  status?: "pending" | "preparing" | "ready" | "delivered";
  kitchen_station?: string;
  created_at?: string;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "paid" | "cancelled";

export interface RestaurantOrder {
  id: number;
  company_id: number;
  order_number: string;
  table_id: number;
  table_number?: string;
  guest_count?: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  waiter_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type Order = RestaurantOrder;

export interface KitchenTicket {
  ticket_id: string | number;
  table_number: string;
  order_number: string;
  items: OrderItem[];
  created_at: string;
  urgency?: "normal" | "urgent" | "delayed";
}
