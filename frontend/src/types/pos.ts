export interface Product {
  id: number;
  company_id: number;
  name: string;
  sku: string;
  barcode?: string;
  category?: string;
  unit_price: number;
  cost_price?: number;
  quantity: number;
  iva_rate?: number; // ex: 16
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface POSItem {
  id: string | number;
  product: Product;
  quantity: number;
  unit_price?: number;
  discount?: number;
  total?: number;
}

export type POSCart = POSItem[];

export interface POSSummary {
  subtotal: number;
  taxAmount: number;
  netTotal: number;
  itemCount: number;
  discountTotal?: number;
}

export type PaymentMethod = "cash" | "mpesa" | "emola" | "card" | "credit" | "xitique" | "pos" | string;

export interface POSSession {
  id: number;
  user_id: number;
  opening_amount: number;
  closing_amount?: number;
  opened_at: string;
  closed_at?: string;
  status: "open" | "closed";
  total_sales?: number;
}
