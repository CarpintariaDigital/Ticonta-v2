import { apiClient } from "@/services/auth";
import {
  Account,
  BalanceSheetResponse,
  CreateJournalEntryInput,
  IncomeStatementResponse,
  JournalEntry,
  TrialBalanceResponse,
} from "@/types/accounting";

export const accountingService = {
  async getChartOfAccounts(companyId = 1): Promise<Account[]> {
    try {
      const response = await apiClient.get<Account[]>(`/api/v1/accounting/chart-of-accounts?company_id=${companyId}`);
      return response.data;
    } catch (err) {
      return defaultChartOfAccounts;
    }
  },

  async getAccount(accountId: number, companyId = 1): Promise<Account> {
    const response = await apiClient.get<Account>(`/api/v1/accounting/accounts/${accountId}?company_id=${companyId}`);
    return response.data;
  },

  async createAccount(data: Partial<Account>): Promise<Account> {
    const response = await apiClient.post<Account>("/api/v1/accounting/accounts", data);
    return response.data;
  },

  async getJournalEntries(companyId = 1): Promise<JournalEntry[]> {
    try {
      const response = await apiClient.get<JournalEntry[]>(`/api/v1/accounting/journal-entries?company_id=${companyId}`);
      return response.data;
    } catch (err) {
      return [];
    }
  },

  async createJournalEntry(data: CreateJournalEntryInput): Promise<JournalEntry> {
    const response = await apiClient.post<JournalEntry>("/api/v1/accounting/journal-entries", data);
    return response.data;
  },

  async getTrialBalance(companyId = 1): Promise<TrialBalanceResponse> {
    try {
      const response = await apiClient.get<TrialBalanceResponse>(`/api/v1/accounting/trial-balance?company_id=${companyId}`);
      return response.data;
    } catch (err) {
      return {
        date: new Date().toISOString().split("T")[0],
        items: [],
        sum_total_debits: 0,
        sum_total_credits: 0,
        is_balanced: true,
      };
    }
  },

  async getIncomeStatement(companyId = 1): Promise<IncomeStatementResponse> {
    try {
      const response = await apiClient.get<IncomeStatementResponse>(`/api/v1/accounting/income-statement?company_id=${companyId}`);
      return response.data;
    } catch (err) {
      return {
        period_from: "2026-01-01",
        period_to: new Date().toISOString().split("T")[0],
        total_revenues: 0,
        total_expenses: 0,
        gross_profit: 0,
        operating_profit: 0,
        net_income: 0,
        revenues_breakdown: [],
        expenses_breakdown: [],
      };
    }
  },

  async getBalanceSheet(companyId = 1): Promise<BalanceSheetResponse> {
    try {
      const response = await apiClient.get<BalanceSheetResponse>(`/api/v1/accounting/balance-sheet?company_id=${companyId}`);
      return response.data;
    } catch (err) {
      return {
        as_of_date: new Date().toISOString().split("T")[0],
        total_assets: 0,
        total_liabilities: 0,
        total_equity: 0,
        retained_earnings: 0,
        is_balanced: true,
        assets_breakdown: [],
        liabilities_breakdown: [],
        equity_breakdown: [],
      };
    }
  },
};

export const defaultChartOfAccounts: Account[] = [
  { id: 1, company_id: 1, account_code: "1.1", account_name: "Caixa", account_type: "asset", is_header: true, debit_balance: 0, credit_balance: 0, current_balance: 0, created_at: "" },
  { id: 2, company_id: 1, account_code: "1.1.1", account_name: "Caixa Geral (Sede)", account_type: "asset", is_header: false, debit_balance: 45000, credit_balance: 12000, current_balance: 33000, created_at: "" },
  { id: 3, company_id: 1, account_code: "1.2", account_name: "Bancos e Carteiras Digitais", account_type: "asset", is_header: true, debit_balance: 0, credit_balance: 0, current_balance: 0, created_at: "" },
  { id: 4, company_id: 1, account_code: "1.2.1", account_name: "Depósitos à Ordem MZN", account_type: "asset", is_header: false, debit_balance: 180000, credit_balance: 45000, current_balance: 135000, created_at: "" },
  { id: 5, company_id: 1, account_code: "1.2.2", account_name: "Carteiras Móveis (M-Pesa / e-Mola)", account_type: "asset", is_header: false, debit_balance: 68000, credit_balance: 21000, current_balance: 47000, created_at: "" },
  { id: 6, company_id: 1, account_code: "2.1", account_name: "Mercadorias", account_type: "asset", is_header: true, debit_balance: 0, credit_balance: 0, current_balance: 0, created_at: "" },
  { id: 7, company_id: 1, account_code: "2.1.1", account_name: "Mercadorias em Armazém Geral", account_type: "asset", is_header: false, debit_balance: 240000, credit_balance: 85000, current_balance: 155000, created_at: "" },
  { id: 8, company_id: 1, account_code: "4.1.1", account_name: "Clientes Conta Corrente", account_type: "asset", is_header: false, debit_balance: 95000, credit_balance: 35000, current_balance: 60000, created_at: "" },
  { id: 9, company_id: 1, account_code: "4.2.1", account_name: "Fornecedores Conta Corrente", account_type: "liability", is_header: false, debit_balance: 20000, credit_balance: 90000, current_balance: 70000, created_at: "" },
  { id: 10, company_id: 1, account_code: "4.4.1", account_name: "IVA Liquidado (16%)", account_type: "liability", is_header: false, debit_balance: 0, credit_balance: 38400, current_balance: 38400, created_at: "" },
  { id: 11, company_id: 1, account_code: "5.1", account_name: "Capital Social Realizado", account_type: "equity", is_header: false, debit_balance: 0, credit_balance: 200000, current_balance: 200000, created_at: "" },
  { id: 12, company_id: 1, account_code: "6.1", account_name: "Custo das Mercadorias Vendidas (CMVMC)", account_type: "expense", is_header: false, debit_balance: 85000, credit_balance: 0, current_balance: 85000, created_at: "" },
  { id: 13, company_id: 1, account_code: "6.2", account_name: "Gastos com o Pessoal (Salários + INSS)", account_type: "expense", is_header: false, debit_balance: 42000, credit_balance: 0, current_balance: 42000, created_at: "" },
  { id: 14, company_id: 1, account_code: "7.1.1", account_name: "Vendas Mercado Nacional (Moçambique)", account_type: "revenue", is_header: false, debit_balance: 0, credit_balance: 240000, current_balance: 240000, created_at: "" },
];
