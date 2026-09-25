export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface Account {
  id: number;
  company_id: number;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  is_header: boolean;
  parent_id?: number | null;
  debit_balance: number;
  credit_balance: number;
  current_balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id: number;
  company_id: number;
  entry_date: string;
  entry_number: string;
  debit_account_id: number;
  debit_account_code?: string | null;
  debit_account_name?: string | null;
  credit_account_id: number;
  credit_account_code?: string | null;
  credit_account_name?: string | null;
  amount: number;
  description?: string | null;
  reference_type?: string | null;
  reference_id?: number | null;
  created_by_id: number;
  created_at?: string;
}

export interface TrialBalanceItem {
  account_code: string;
  account_name: string;
  account_type: string;
  debit: number;
  credit: number;
}

export interface TrialBalance {
  as_of_date: string;
  total_debit: number;
  total_credit: number;
  is_balanced: boolean;
  accounts: TrialBalanceItem[];
}

export interface IncomeStatement {
  date_from: string;
  date_to: string;
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  revenue_items: Array<{ account_code: string; account_name: string; amount: number }>;
  expense_items: Array<{ account_code: string; account_name: string; amount: number }>;
}

export interface BalanceSheet {
  as_of_date: string;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  is_balanced: boolean;
  assets: Array<{ account_code: string; account_name: string; amount: number }>;
  liabilities: Array<{ account_code: string; account_name: string; amount: number }>;
  equity: Array<{ account_code: string; account_name: string; amount: number }>;
}
