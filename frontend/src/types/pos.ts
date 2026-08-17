export type PaymentMethod = "cash" | "mpesa" | "emola" | "card" | "bank_transfer" | "credit";

export interface Product {
  id: number;
  company_id?: number;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit_price: number;
  cost_price?: number;
  quantity: number;
  iva_rate: number;
  active: boolean;
  image_url?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface SaleSummary {
  subtotal: number;
  taxAmount: number;
  discountPercentage: number;
  discountAmount: number;
  netTotal: number;
  itemCount: number;
}

export interface OfflineSalePayload {
  id?: number;
  offline_id: string;
  company_id: number;
  customer_id?: number;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
  }[];
  payment_method: PaymentMethod;
  payment_status: string;
  discount: number;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  created_at: string;
  synced: boolean;
}
