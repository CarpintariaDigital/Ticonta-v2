export type PaymentMethod = "cash" | "card" | "mpesa" | "emola" | "transfer" | "pos" | "split";
export type PaymentStatus = "pending" | "partial" | "paid" | "overdue" | "cancelled";

export interface PaymentTransaction {
  id: number;
  payment_id: number;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string | null;
  notes?: string | null;
  paid_at: string;
  created_at: string;
}

export interface ProcessPaymentInput {
  amount_paid: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  notes?: string;
  due_date?: string | null;
  amount_total?: number;
  module_source?: string;
  invoice_number?: string;
  customer_id?: number;
  customer_name?: string;
  customer_phone?: string;
  company_id?: number;
}

export interface SplitPaymentItemInput {
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string;
  notes?: string;
}

export interface SplitPaymentInput {
  payments: SplitPaymentItemInput[];
  amount_total?: number;
  module_source?: string;
  invoice_number?: string;
  customer_id?: number;
  customer_name?: string;
  company_id?: number;
}

export interface PaymentStatusData {
  payment_id: number;
  sale_id?: number | null;
  module_source: string;
  invoice_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  amount_total: number;
  amount_paid: number;
  amount_owed: number;
  status: PaymentStatus;
  due_date?: string | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
  transactions: PaymentTransaction[];
  message: string;
}

export interface OutstandingPaymentItem {
  payment_id: number;
  sale_id?: number | null;
  module_source: string;
  invoice_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  amount_total: number;
  amount_paid: number;
  amount_owed: number;
  status: PaymentStatus;
  due_date?: string | null;
  is_overdue: boolean;
  created_at: string;
}

export interface OutstandingPaymentsResponse {
  company_id: number;
  total_outstanding_amount: number;
  total_unpaid_count: number;
  items: OutstandingPaymentItem[];
}
