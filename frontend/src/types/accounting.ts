export interface Account {
  id: number;
  company_id: number;
  account_code: string;
  account_name: string;
  account_type: "asset" | "liability" | "equity" | "revenue" | "expense";
  is_header: boolean;
  parent_id?: number | null;
  debit_balance: number;
  credit_balance: number;
  current_balance: number;
  created_at: string;
}

export interface JournalEntry {
  id: number;
  company_id: number;
  entry_date: string;
  entry_number: string;
  debit_account_id: number;
  debit_account_code?: string;
  debit_account_name?: string;
  credit_account_id: number;
  credit_account_code?: string;
  credit_account_name?: string;
  amount: number;
  description?: string;
  reference_type?: string;
  reference_id?: number;
  created_by_id: number;
  created_at: string;
}

export interface CreateJournalEntryInput {
  company_id?: number;
  debit_account_id: number;
  credit_account_id: number;
  amount: number;
  description: string;
  entry_date?: string;
}

export interface TrialBalanceItem {
  account_code: string;
  account_name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  debit_balance: number;
  credit_balance: number;
}

export interface TrialBalanceResponse {
  date: string;
  items: TrialBalanceItem[];
  sum_total_debits: number;
  sum_total_credits: number;
  is_balanced: boolean;
}

export interface IncomeStatementResponse {
  period_from: string;
  period_to: string;
  total_revenues: number;
  total_expenses: number;
  gross_profit: number;
  operating_profit: number;
  net_income: number;
  revenues_breakdown: { code: string; name: string; amount: number }[];
  expenses_breakdown: { code: string; name: string; amount: number }[];
}

export interface BalanceSheetResponse {
  as_of_date: string;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  retained_earnings: number;
  is_balanced: boolean;
  assets_breakdown: { code: string; name: string; amount: number }[];
  liabilities_breakdown: { code: string; name: string; amount: number }[];
  equity_breakdown: { code: string; name: string; amount: number }[];
}
