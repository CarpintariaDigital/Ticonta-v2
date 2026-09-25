export type SavingsGroupStatus = 'ACTIVE' | 'CLOSED';
export type SavingsMemberStatus = 'ACTIVE' | 'INACTIVE';
export type SavingsPaymentMethod = 'CASH' | 'MPESA' | 'TRANSFER';
export type SavingsLoanStatus = 'ACTIVE' | 'REPAID' | 'DEFAULTED';

export interface SavingsMember {
  id: number;
  member_id?: number;
  group_id?: number;
  name: string;
  phone: string;
  total_deposited: number;
  total_borrowed: number;
  total_repaid: number;
  status: SavingsMemberStatus;
  joined_at?: string;
  share_pct?: number;
  share_value?: number;
}

export interface SavingsGroup {
  id: number;
  name: string;
  interest_rate: number;
  cycle_months: number;
  status: SavingsGroupStatus;
  start_date: string;
  end_date?: string | null;
  total_members?: number;
  created_at?: string;
  members?: SavingsMember[];
}

export interface SavingsDeposit {
  id: number;
  group_id: number;
  member_id: number;
  amount: number;
  payment_method: SavingsPaymentMethod;
  notes?: string | null;
  deposited_at: string;
}

export interface SavingsLoan {
  id: number;
  group_id?: number;
  member_id: number;
  member_name?: string;
  amount: number;
  interest_rate: number;
  monthly_payment: number;
  total_repayable: number;
  amount_repaid: number;
  remaining?: number;
  due_date: string;
  status: SavingsLoanStatus;
  disbursed_at?: string;
}

export interface SavingsRepayment {
  id: number;
  loan_id: number;
  amount: number;
  principal_portion: number;
  interest_portion: number;
  payment_method: SavingsPaymentMethod;
  repaid_at: string;
}

export interface SavingsGroupReport {
  group_id: number;
  name: string;
  status: SavingsGroupStatus;
  interest_rate: number;
  cycle_months: number;
  start_date: string;
  end_date?: string | null;
  total_deposited: number;
  total_borrowed: number;
  total_repaid: number;
  total_interest_collected: number;
  total_receivable: number;
  fund_balance: number;
  total_fund_value: number;
  member_shares: SavingsMember[];
  loans: SavingsLoan[];
}
