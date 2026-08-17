import { apiClient as api } from "@/services/auth";
import {
  InformalCustomer,
  Debit,
  CustomerDebitSummary,
  SaleWithDebitCreate,
  SaleWithDebitResponse,
  PartialPaymentCreate,
  PartialPaymentResult,
  SendReminderRequest,
  SendReminderResponse,
  CreditRiskReportResponse,
  CashFlowForecastResponse,
  RevenueBreakdownResponse,
} from "@/types/informal_sales";

const API_PREFIX = "/api/v1/informal";

// Mock Fallback dataset for offline / testing mode
const MOCK_CUSTOMERS: InformalCustomer[] = [
  {
    id: 1,
    company_id: 1,
    name: "Dona Maria Machava",
    phone: "+258849993344",
    location: "Chamanculo C, Rua 4",
    profile_picture: null,
    total_purchases: 14500,
    total_owed: 2500,
    trusted_credit_limit: 5000,
    payment_reliability: 4.8,
    notes: "Vendedora de bolos e doces no mercado. Sempre paga à sexta-feira.",
    verified: true,
    last_purchase_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_purchase_amount: 1500,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    company_id: 1,
    name: "Sr. Alberto Chissano",
    phone: "+258821112233",
    location: "Zimpeto, Paragem Central",
    profile_picture: null,
    total_purchases: 8200,
    total_owed: 0,
    trusted_credit_limit: 6000,
    payment_reliability: 5.0,
    notes: "Revendedor de produtos agrícolas. Paga sempre por M-Pesa.",
    verified: true,
    last_purchase_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    last_purchase_amount: 2500,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    company_id: 1,
    name: "Tia Joana Macuácua",
    phone: "+258840001122",
    location: "Maxaquene D, Rua da Escola",
    profile_picture: null,
    total_purchases: 5400,
    total_owed: 1800,
    trusted_credit_limit: 3000,
    payment_reliability: 3.5,
    notes: "Dona de barraca no bairro. Às vezes atrasa 2 a 3 dias mas paga.",
    verified: true,
    last_purchase_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    last_purchase_amount: 1800,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    company_id: 1,
    name: "Mateus Cossa",
    phone: "+258847778899",
    location: "Hulene B, Travessa 12",
    profile_picture: null,
    total_purchases: 3200,
    total_owed: 3200,
    trusted_credit_limit: 2000,
    payment_reliability: 2.2,
    notes: "Conta vencida há 5 dias. Enviar lembrete amigável.",
    verified: false,
    last_purchase_date: new Date(Date.now() - 8 * 86400000).toISOString(),
    last_purchase_amount: 3200,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_OVERDUE_DEBITS: Debit[] = [
  {
    id: 101,
    company_id: 1,
    customer_id: 4,
    customer_name: "Mateus Cossa",
    customer_phone: "+258847778899",
    customer_location: "Hulene B, Travessa 12",
    sale_id: 401,
    total_amount: 3200,
    initial_paid: 0,
    amount_owed: 3200,
    amount_paid: 0,
    due_date: new Date(Date.now() - 4 * 86400000).toISOString(),
    status: "overdue",
    notes: "Prometeu pagar terça-feira",
    reminder_count: 1,
    last_reminder_sent_at: new Date(Date.now() - 86400000).toISOString(),
    is_overdue: true,
    days_overdue: 4,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    partial_payments: [],
  },
  {
    id: 102,
    company_id: 1,
    customer_id: 1,
    customer_name: "Dona Maria Machava",
    customer_phone: "+258849993344",
    customer_location: "Chamanculo C, Rua 4",
    sale_id: 402,
    total_amount: 3500,
    initial_paid: 1000,
    amount_owed: 2500,
    amount_paid: 0,
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: "active",
    notes: "Restante para sexta-feira",
    reminder_count: 0,
    last_reminder_sent_at: null,
    is_overdue: false,
    days_overdue: 0,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    partial_payments: [],
  },
];

class InformalSalesService {
  /**
   * Cadastro rápido de cliente informal pelo telefone / nome
   */
  async quickCreateCustomer(data: {
    name: string;
    phone?: string;
    location?: string;
    trusted_credit_limit?: number;
    notes?: string;
    company_id?: number;
  }): Promise<InformalCustomer> {
    try {
      const response = await api.post<InformalCustomer>(`${API_PREFIX}/customers/quick`, data);
      return response.data;
    } catch {
      const newCust: InformalCustomer = {
        id: Date.now(),
        company_id: data.company_id || 1,
        name: data.name,
        phone: data.phone || null,
        location: data.location || null,
        profile_picture: null,
        total_purchases: 0,
        total_owed: 0,
        trusted_credit_limit: data.trusted_credit_limit || 5000,
        payment_reliability: 5.0,
        notes: data.notes || null,
        verified: false,
        last_purchase_date: null,
        last_purchase_amount: null,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_CUSTOMERS.unshift(newCust);
      return newCust;
    }
  }

  /**
   * Listar clientes informais com busca por nome, telefone ou bairro
   */
  async getCustomers(search?: string, onlyWithDebt = false, companyId = 1): Promise<InformalCustomer[]> {
    try {
      const response = await api.get<InformalCustomer[]>(`${API_PREFIX}/customers`, {
        params: { search, only_with_debt: onlyWithDebt, company_id: companyId },
      });
      return response.data;
    } catch {
      let list = [...MOCK_CUSTOMERS];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.phone && c.phone.includes(q)) ||
            (c.location && c.location.toLowerCase().includes(q))
        );
      }
      if (onlyWithDebt) {
        list = list.filter((c) => c.total_owed > 0);
      }
      return list;
    }
  }

  /**
   * Obter perfil do cliente
   */
  async getCustomer(customerId: number, companyId = 1): Promise<InformalCustomer> {
    try {
      const response = await api.get<InformalCustomer>(`${API_PREFIX}/customers/${customerId}`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const found = MOCK_CUSTOMERS.find((c) => c.id === customerId);
      if (!found) throw new Error("Cliente não encontrado");
      return found;
    }
  }

  /**
   * Registrar venda com opção de fiado (débito / pagamento parcial)
   */
  async createSaleWithDebit(data: SaleWithDebitCreate): Promise<SaleWithDebitResponse> {
    try {
      const response = await api.post<SaleWithDebitResponse>(`${API_PREFIX}/sales/with-debit`, data);
      return response.data;
    } catch {
      const total = data.items.reduce((acc, it) => acc + it.quantity * it.unit_price, 0);
      const paid = data.amount_paid_now || 0;
      const owed = Math.max(0, total - paid);

      const cust = MOCK_CUSTOMERS.find((c) => c.id === data.customer_id);
      if (cust) {
        cust.total_purchases += total;
        cust.total_owed += owed;
        cust.last_purchase_date = new Date().toISOString();
        cust.last_purchase_amount = total;
      }

      const debitId = owed > 0 ? Date.now() : null;
      if (owed > 0 && cust) {
        MOCK_OVERDUE_DEBITS.unshift({
          id: debitId!,
          company_id: data.company_id || 1,
          customer_id: cust.id,
          customer_name: cust.name,
          customer_phone: cust.phone,
          customer_location: cust.location,
          sale_id: Math.floor(Math.random() * 1000),
          total_amount: total,
          initial_paid: paid,
          amount_owed: owed,
          amount_paid: 0,
          due_date: data.due_date || null,
          status: "active",
          notes: data.notes || null,
          reminder_count: 0,
          last_reminder_sent_at: null,
          is_overdue: false,
          days_overdue: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          partial_payments: [],
        });
      }

      return {
        sale_id: Date.now(),
        invoice_number: `INF-${Math.floor(Date.now() / 1000)}`,
        debit_id: debitId,
        customer_id: data.customer_id,
        customer_name: cust ? cust.name : "Cliente",
        customer_phone: cust?.phone || null,
        total_amount: total,
        amount_paid_now: paid,
        amount_owed: owed,
        due_date: data.due_date || null,
        status: owed > 0 ? "active" : "paid",
        payment_reliability_score: cust ? cust.payment_reliability : 5.0,
        message: owed > 0 ? `Venda registada! Saldo fiado: ${owed} MT.` : "Venda liquidada na totalidade.",
      };
    }
  }

  /**
   * Consultar extrato e débitos ativos de um cliente
   */
  async getCustomerDebits(customerId: number, companyId = 1): Promise<CustomerDebitSummary> {
    try {
      const response = await api.get<CustomerDebitSummary>(`${API_PREFIX}/customers/${customerId}/debit`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const cust = MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];
      const debits = MOCK_OVERDUE_DEBITS.filter((d) => d.customer_id === customerId);
      return {
        customer_id: cust.id,
        customer_name: cust.name,
        phone: cust.phone,
        location: cust.location,
        total_purchases: cust.total_purchases,
        total_owed: cust.total_owed,
        trusted_credit_limit: cust.trusted_credit_limit,
        payment_reliability: cust.payment_reliability,
        active_debits_count: debits.length,
        active_debits: debits,
      };
    }
  }

  /**
   * Registrar amortização / pagamento parcial de dívida
   */
  async recordPartialPayment(debitId: number, data: PartialPaymentCreate, companyId = 1): Promise<PartialPaymentResult> {
    try {
      const response = await api.post<PartialPaymentResult>(`${API_PREFIX}/debits/${debitId}/pay`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const debit = MOCK_OVERDUE_DEBITS.find((d) => d.id === debitId);
      if (!debit) throw new Error("Débito não encontrado");

      const payAmt = Math.min(data.amount, debit.amount_owed);
      debit.amount_paid += payAmt;
      debit.amount_owed = Math.max(0, debit.amount_owed - payAmt);
      debit.status = debit.amount_owed === 0 ? "paid" : "partially_paid";

      const cust = MOCK_CUSTOMERS.find((c) => c.id === debit.customer_id);
      if (cust) {
        cust.total_owed = Math.max(0, cust.total_owed - payAmt);
        if (debit.status === "paid") cust.verified = true;
      }

      return {
        payment_id: Date.now(),
        debit_id: debitId,
        amount_paid_now: payAmt,
        total_amortized: debit.amount_paid,
        remaining_balance: debit.amount_owed,
        debit_status: debit.status,
        notification_sent: true,
        notification_message: `Obrigado! Recebemos a sua amortização de ${payAmt} MT. Restam ${debit.amount_owed} MT.`,
        message: debit.amount_owed === 0 ? "Dívida totalmente QUITADA!" : `Amortização registada. Restam ${debit.amount_owed} MT.`,
      };
    }
  }

  /**
   * Listar dívidas vencidas (overdue)
   */
  async getOverdueDebits(companyId = 1): Promise<Debit[]> {
    try {
      const response = await api.get<Debit[]>(`${API_PREFIX}/debits/overdue`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      return MOCK_OVERDUE_DEBITS.filter((d) => d.status === "overdue" || d.is_overdue);
    }
  }

  /**
   * Enviar lembrete amigável via WhatsApp / SMS
   */
  async sendPaymentReminder(debitId: number, data: SendReminderRequest = {}, companyId = 1): Promise<SendReminderResponse> {
    try {
      const response = await api.post<SendReminderResponse>(`${API_PREFIX}/debits/${debitId}/send-reminder`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const debit = MOCK_OVERDUE_DEBITS.find((d) => d.id === debitId);
      return {
        debit_id: debitId,
        customer_name: debit?.customer_name || "Cliente",
        recipient: debit?.customer_phone || "+258840000000",
        channel: data.channel || "whatsapp",
        message: `Olá! Lembramos que a sua conta de ${debit?.amount_owed || 0} MT venceu. Agradecemos a regularização. Obrigado!`,
        status: "sent",
        sent_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Relatórios: Previsão de Fluxo de Caixa
   */
  async getCashFlowForecast(companyId = 1): Promise<CashFlowForecastResponse> {
    try {
      const response = await api.get<CashFlowForecastResponse>(`${API_PREFIX}/reports/cash-flow`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      return {
        company_id: companyId,
        total_outstanding_debt: 7500,
        overdue_amount: 3200,
        due_today_amount: 0,
        due_this_week_amount: 2500,
        forecast_timeline: [
          { period_label: "Vencidos (Atrasados)", expected_amount: 3200, debit_count: 1, customer_names: ["Mateus Cossa"] },
          { period_label: "Vencem Hoje", expected_amount: 0, debit_count: 0, customer_names: [] },
          { period_label: "Esta Semana (Próximos 7 dias)", expected_amount: 2500, debit_count: 1, customer_names: ["Dona Maria Machava"] },
          { period_label: "Próximos 15 Dias", expected_amount: 1800, debit_count: 1, customer_names: ["Tia Joana Macuácua"] },
          { period_label: "Próximo Mês / A Acordar", expected_amount: 0, debit_count: 0, customer_names: [] },
        ],
      };
    }
  }

  /**
   * Relatórios: Risco de Crédito
   */
  async getCreditRiskReport(companyId = 1): Promise<CreditRiskReportResponse> {
    try {
      const response = await api.get<CreditRiskReportResponse>(`${API_PREFIX}/reports/credit-risk`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      return {
        company_id: companyId,
        total_debt_at_risk: 3200,
        high_risk_customers_count: 1,
        medium_risk_customers_count: 1,
        low_risk_customers_count: 2,
        customers: [
          {
            customer_id: 4,
            name: "Mateus Cossa",
            phone: "+258847778899",
            location: "Hulene B",
            total_owed: 3200,
            trusted_credit_limit: 2000,
            payment_reliability: 2.2,
            risk_level: "high",
            overdue_debits_count: 1,
            overdue_amount: 3200,
          },
          {
            customer_id: 3,
            name: "Tia Joana Macuácua",
            phone: "+258840001122",
            location: "Maxaquene D",
            total_owed: 1800,
            trusted_credit_limit: 3000,
            payment_reliability: 3.5,
            risk_level: "medium",
            overdue_debits_count: 0,
            overdue_amount: 0,
          },
        ],
      };
    }
  }

  /**
   * Relatórios: Receita Direta vs Fiado
   */
  async getRevenueBreakdown(companyId = 1): Promise<RevenueBreakdownResponse> {
    try {
      const response = await api.get<RevenueBreakdownResponse>(`${API_PREFIX}/reports/revenue-breakdown`, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      return {
        company_id: companyId,
        immediate_cash_revenue: 25400,
        debit_credit_revenue: 14500,
        total_revenue: 39900,
        total_recovered_debt: 7000,
        debit_recovery_rate_percent: 78.5,
      };
    }
  }
}

export const informalSalesService = new InformalSalesService();
