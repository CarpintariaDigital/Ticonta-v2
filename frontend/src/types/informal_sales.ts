export type DebitStatus = "active" | "partially_paid" | "paid" | "overdue" | "cancelled";
export type PaymentMethod = "cash" | "mpesa" | "emola" | "pos" | "card";

export interface InformalCustomer {
  id: number;
  company_id: number;
  name: string;
  phone?: string | null;
  location?: string | null;
  profile_picture?: string | null;
  total_purchases: number;
  total_owed: number;
  trusted_credit_limit: number;
  payment_reliability: number; // 1.00 - 5.00
  notes?: string | null;
  verified: boolean;
  last_purchase_date?: string | null;
  last_purchase_amount?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartialPayment {
  id: number;
  debit_id: number;
  amount: number;
  payment_method: string;
  paid_at: string;
  notes?: string | null;
  created_at: string;
}

export interface Debit {
  id: number;
  company_id: number;
  customer_id: number;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_location?: string | null;
  sale_id?: number | null;
  total_amount: number;
  initial_paid: number;
  amount_owed: number;
  amount_paid: number;
  due_date?: string | null;
  status: DebitStatus;
  notes?: string | null;
  reminder_count: number;
  last_reminder_sent_at?: string | null;
  is_overdue: boolean;
  days_overdue: number;
  created_at: string;
  updated_at: string;
  partial_payments: PartialPayment[];
}

export interface CustomerDebitSummary {
  customer_id: number;
  customer_name: string;
  phone?: string | null;
  location?: string | null;
  total_purchases: number;
  total_owed: number;
  trusted_credit_limit: number;
  payment_reliability: number;
  active_debits_count: number;
  active_debits: Debit[];
}

export interface SaleWithDebitItemInput {
  product_id?: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
}

export interface SaleWithDebitCreate {
  customer_id: number;
  items: SaleWithDebitItemInput[];
  amount_paid_now?: number;
  due_date?: string | null;
  payment_method?: string;
  notes?: string | null;
  company_id?: number;
}

export interface SaleWithDebitResponse {
  sale_id?: number | null;
  invoice_number: string;
  debit_id?: number | null;
  customer_id: number;
  customer_name: string;
  customer_phone?: string | null;
  total_amount: number;
  amount_paid_now: number;
  amount_owed: number;
  due_date?: string | null;
  status: string;
  payment_reliability_score: number;
  message: string;
}

export interface PartialPaymentCreate {
  amount: number;
  payment_method: string;
  notes?: string | null;
  send_notification?: boolean;
}

export interface PartialPaymentResult {
  payment_id: number;
  debit_id: number;
  amount_paid_now: number;
  total_amortized: number;
  remaining_balance: number;
  debit_status: DebitStatus;
  notification_sent: boolean;
  notification_message?: string | null;
  message: string;
}

export interface SendReminderRequest {
  channel?: "whatsapp" | "sms";
  custom_message?: string;
}

export interface SendReminderResponse {
  debit_id: number;
  customer_name: string;
  recipient: string;
  channel: string;
  message: string;
  status: string;
  sent_at: string;
}

export interface CreditRiskCustomer {
  customer_id: number;
  name: string;
  phone?: string | null;
  location?: string | null;
  total_owed: number;
  trusted_credit_limit: number;
  payment_reliability: number;
  risk_level: "high" | "medium" | "low";
  overdue_debits_count: number;
  overdue_amount: number;
}

export interface CreditRiskReportResponse {
  company_id: number;
  total_debt_at_risk: number;
  high_risk_customers_count: number;
  medium_risk_customers_count: number;
  low_risk_customers_count: number;
  customers: CreditRiskCustomer[];
}

export interface CashFlowForecastItem {
  period_label: string;
  expected_amount: number;
  debit_count: number;
  customer_names: string[];
}

export interface CashFlowForecastResponse {
  company_id: number;
  total_outstanding_debt: number;
  overdue_amount: number;
  due_today_amount: number;
  due_this_week_amount: number;
  forecast_timeline: CashFlowForecastItem[];
}

export interface RevenueBreakdownResponse {
  company_id: number;
  immediate_cash_revenue: number;
  debit_credit_revenue: number;
  total_revenue: number;
  total_recovered_debt: number;
  debit_recovery_rate_percent: number;
}

// -------------------------------------------------------------
// XITIQUES (Rotativo & Comercial de Mercadoria)
// -------------------------------------------------------------
export type XitiqueType = "rotary_cash" | "commercial_goods";
export type XitiqueFrequency = "weekly" | "biweekly" | "monthly";

export interface XitiqueMember {
  id: string;
  name: string;
  phone: string;
  order_position: number; // Mês ou ciclo em que recebe
  payout_cycle_date: string;
  has_received: boolean;
  received_at?: string;
  goods_description?: string; // Para xitique de mercadorias (ex: 20 sacos cimento, cabaz compras)
  contributions_paid: number;
  total_contributed: number;
  status: "up_to_date" | "pending" | "late";
}

export interface XitiqueGroup {
  id: string;
  name: string;
  type: XitiqueType;
  contribution_amount: number; // Valor fixo periódico por membro (ex: 2.000 MT)
  frequency: XitiqueFrequency;
  total_cycles: number;
  current_cycle: number;
  start_date: string;
  end_date: string;
  target_goods_item?: string; // Para ferragem/loja: ex: "Kit Construção Quarto & Sala"
  members: XitiqueMember[];
  status: "active" | "completed" | "paused";
  notes?: string;
}

// -------------------------------------------------------------
// GRUPOS DE POUPANÇA & CRÉDITO ROTATIVO (ASCAS / PCR)
// -------------------------------------------------------------
export type RepaymentFrequency = "single" | "daily" | "weekly" | "monthly";

export interface SavingsMember {
  id: string;
  name: string;
  phone: string;
  total_saved: number; // Total acumulado no fundo de poupança
  active_loan_balance: number; // Dívida ativa de empréstimos
  interest_paid_to_group: number; // Juros já pagos que alimentam o lucro do grupo
  status: "active" | "defaulted";
}

export interface SavingsLoan {
  id: string;
  member_id: string;
  member_name: string;
  member_phone: string;
  principal_amount: number; // Valor emprestado
  interest_rate_percent: number; // Taxa de juro (ex: 10%)
  interest_amount: number; // Valor em Meticais dos juros
  total_to_repay: number; // principal + interest
  amount_repaid: number;
  remaining_balance: number;
  repayment_frequency: RepaymentFrequency;
  due_date: string;
  disbursed_at: string;
  status: "active" | "paid" | "overdue";
  notes?: string;
}

export interface SavingsShareoutMemberResult {
  member_id: string;
  member_name: string;
  total_saved: number;
  share_percent: number; // % do fundo total
  interest_profit_share: number; // Juro distribuído
  total_payout: number; // poupança + juros lucrados
  active_debt_deduction: number;
  net_payout: number; // Valor líquido a receber
  eligible: boolean;
}

export interface SavingsGroup {
  id: string;
  name: string;
  start_date: string;
  end_date: string; // Fim do ciclo onde ocorre a partilha
  default_interest_rate_percent: number;
  total_fund_accumulated: number;
  total_loans_disbursed: number;
  total_interest_earned: number;
  members: SavingsMember[];
  loans: SavingsLoan[];
  status: "active" | "shared_out" | "closed";
}
