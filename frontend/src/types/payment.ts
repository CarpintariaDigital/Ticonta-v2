export type PaymentStatus = "pending" | "partial" | "paid" | "completed" | "overdue" | "failed" | "refunded" | "cancelled";

export interface PaymentTransaction {
  id?: number;
  payment_method: string;
  amount: number;
  transaction_id?: string;
  created_at?: string;
  notes?: string;
}

export interface PaymentStatusData {
  payment_id?: number;
  sale_id: number;
  module_source?: string;
  invoice_number?: string;
  customer_name?: string;
  customer_phone?: string;
  amount_total: number;
  amount_paid: number;
  amount_owed: number;
  status: PaymentStatus;
  due_date?: string | null;
  is_overdue?: boolean;
  created_at?: string;
  updated_at?: string;
  transactions?: PaymentTransaction[];
  message?: string;
}

export type Payment = PaymentStatusData;

export interface MpesaTransaction {
  reference: string;
  phone: string;
  amount: number;
  status?: string;
  confirmation_code?: string;
  timestamp?: string;
}

export interface PaymentSummary {
  total_collected: number;
  total_owed: number;
  by_method: Record<string, number>;
}

export interface OutstandingPaymentsResponse {
  total_outstanding: number;
  count: number;
  items: PaymentStatusData[];
}
