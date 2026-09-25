export interface InformalCustomer {
  id: number | string;
  company_id?: number | string;
  name: string;
  phone: string;
  location?: string;
  total_purchases: number;
  total_owed: number;
  trusted_credit_limit: number;
  payment_reliability: number; // ex: 4.8
  verified: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PartialPaymentRecord {
  id?: number | string;
  amount: number;
  paid_at: string;
  method?: string;
}

export interface Debit {
  id: number | string;
  company_id?: number | string;
  customer_id: number | string;
  customer_name?: string;
  total_amount: number;
  initial_paid: number;
  amount_owed: number;
  amount_paid: number;
  due_date: string;
  status: "pending" | "partial" | "paid" | "overdue";
  reminder_count?: number;
  is_overdue?: boolean;
  days_overdue?: number;
  created_at?: string;
  updated_at?: string;
  partial_payments?: PartialPaymentRecord[];
}

export interface InformalCartItem {
  id: string | number;
  name: string;
  unit_price: number;
  quantity: number;
  total?: number;
}

export interface InformalSale {
  id?: number | string;
  company_id?: number | string;
  customer_id?: number | string;
  customer_name?: string;
  items: InformalCartItem[];
  total_amount: number;
  amount_paid: number;
  amount_owed: number;
  is_fiado: boolean;
  due_date?: string | null;
  payment_method: string;
  notes?: string;
  created_at?: string;
}

export type FiadoEntry = Debit;
export type TrustScore = number;

export interface DebtCollection {
  id?: number | string;
  debit_id: number | string;
  channel: "whatsapp" | "sms" | "in_person";
  sent_at: string;
  status: "sent" | "failed" | "responded";
  message?: string;
}
