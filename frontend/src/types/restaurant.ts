export type TableStatus = "available" | "occupied" | "reserved" | "dirty";
export type TableLocation = "indoor" | "outdoor" | "bar";
export type MenuCategory = "appetizers" | "mains" | "sides" | "drinks" | "desserts";
export type ItemPrepStatus = "pending" | "preparing" | "ready" | "served";
export type OrderStatus = "open" | "pending_payment" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "mpesa" | "emola" | "pos" | "card" | "mixed";

export interface Table {
  id: number;
  company_id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
  location: TableLocation;
  reserved_for?: string | null;
  reserved_contact?: string | null;
  reservation_time?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: number;
  company_id: number;
  product_id?: number | null;
  name: string;
  description?: string | null;
  category: MenuCategory;
  price: number;
  preparation_time: number;
  image_url?: string | null;
  dietary_info?: string | null;
  available: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name?: string | null;
  menu_item_category?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_requests?: string | null;
  preparation_status: ItemPrepStatus;
  started_at?: string | null;
  ready_at?: string | null;
  served_at?: string | null;
  created_at: string;
}

export interface OrderSplit {
  id: number;
  order_id: number;
  split_number: number;
  guest_name?: string | null;
  amount: number;
  payment_method?: string | null;
  payment_status: "pending" | "paid";
  paid_at?: string | null;
  created_at: string;
}

export interface RestaurantOrder {
  id: number;
  company_id: number;
  order_number: string;
  table_id?: number | null;
  table_number?: string | null;
  guest_count: number;
  status: OrderStatus;
  opened_at: string;
  closed_at?: string | null;
  subtotal: number;
  tax: number;
  service_charge: number;
  total: number;
  amount_paid: number;
  payment_method?: PaymentMethod | string | null;
  notes?: string | null;
  waiter_id?: number | null;
  sale_id?: number | null;
  items: OrderItem[];
  splits: OrderSplit[];
}

export interface KitchenDisplayItem {
  order_item_id: number;
  order_id: number;
  order_number: string;
  table_id?: number | null;
  table_number?: string | null;
  menu_item_id: number;
  menu_item_name: string;
  category: string;
  quantity: number;
  special_requests?: string | null;
  preparation_status: ItemPrepStatus;
  elapsed_minutes: number;
  urgency_color: "green" | "yellow" | "red";
  started_at?: string | null;
  created_at: string;
}

export interface KitchenDisplayResponse {
  items: KitchenDisplayItem[];
  total_pending: number;
  total_preparing: number;
  total_ready: number;
  average_wait_time_minutes: number;
}

export interface BillItem {
  id: number;
  menu_item_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_requests?: string | null;
  preparation_status: string;
}

export interface TableBillResponse {
  order_id: number;
  order_number: string;
  table_id?: number | null;
  table_number?: string | null;
  guest_count: number;
  opened_at: string;
  items: BillItem[];
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  service_charge_percent: number;
  service_charge_amount: number;
  total: number;
  amount_paid: number;
  remaining_balance: number;
  is_paid: boolean;
}

export interface SplitBillResponse {
  order_id: number;
  order_number: string;
  total_order_amount: number;
  num_splits: number;
  splits: OrderSplit[];
  total_allocated: number;
  remaining_to_allocate: number;
}

export interface CloseTableResponse {
  order_id: number;
  order_number: string;
  status: string;
  total: number;
  amount_paid: number;
  change: number;
  payment_method: string;
  closed_at: string;
  table_status?: string | null;
  message: string;
}

export interface HourlyRevenue {
  hour: number;
  hour_label: string;
  order_count: number;
  revenue: number;
}

export interface TopDish {
  menu_item_id: number;
  name: string;
  category: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface RestaurantReportsResponse {
  company_id: number;
  start_date?: string | null;
  end_date?: string | null;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  average_table_time_minutes: number;
  peak_hours: HourlyRevenue[];
  top_dishes: TopDish[];
  revenue_by_category: Record<string, number>;
}

export interface RestaurantSettings {
  id: number;
  company_id: number;
  service_charge_percent: number;
  tax_percent: number;
  auto_clean_tables: boolean;
  operating_hours?: Record<string, { open: string; close: string }> | null;
  menu_categories?: string[] | null;
  urgent_prep_time_minutes: number;
  created_at: string;
  updated_at: string;
}
