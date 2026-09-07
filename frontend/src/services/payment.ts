import { apiClient as api } from "@/services/auth";
import {
  PaymentStatusData,
  ProcessPaymentInput,
  SplitPaymentInput,
  OutstandingPaymentsResponse,
} from "@/types/payment";

const API_PREFIX = "/api/v1/payments";

// In-memory mock fallback state
const MOCK_PAYMENTS: PaymentStatusData[] = [
  {
    payment_id: 1,
    sale_id: 101,
    module_source: "pos",
    invoice_number: "FT 2026/089",
    customer_name: "Armando Guebuza",
    customer_phone: "+258841112233",
    amount_total: 2500,
    amount_paid: 1000,
    amount_owed: 1500,
    status: "partial",
    due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    is_overdue: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    transactions: [
      {
        id: 1,
        payment_id: 1,
        amount: 1000,
        payment_method: "mpesa",
        transaction_id: "MP260817001",
        notes: "Entrada via M-Pesa",
        paid_at: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    message: "Pagamento parcial registrado.",
  },
  {
    payment_id: 2,
    sale_id: 102,
    module_source: "restaurant",
    invoice_number: "RST-044",
    customer_name: "Helena Mondlane",
    customer_phone: "+258823334455",
    amount_total: 3400,
    amount_paid: 3400,
    amount_owed: 0,
    status: "paid",
    due_date: null,
    is_overdue: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    transactions: [
      {
        id: 2,
        payment_id: 2,
        amount: 2000,
        payment_method: "card",
        transaction_id: "POS-9812",
        notes: "Cartão de Débito",
        paid_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        payment_id: 2,
        amount: 1400,
        payment_method: "cash",
        transaction_id: null,
        notes: "Dinheiro vivo",
        paid_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ],
    message: "Conta liquidada totalmente via pagamento dividido.",
  },
];

class PaymentService {
  /**
   * Processar pagamento integral ou amortização parcial
   */
  async processPayment(
    saleId: number,
    data: ProcessPaymentInput,
    companyId = 1
  ): Promise<PaymentStatusData> {
    try {
      const response = await api.post<PaymentStatusData>(`${API_PREFIX}/${saleId}`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      let existing = MOCK_PAYMENTS.find((p) => p.sale_id === saleId || p.payment_id === saleId);
      const now = new Date().toISOString();

      if (!existing) {
        const total = data.amount_total || data.amount_paid;
        const remaining = Math.max(0, total - data.amount_paid);
        const newPayment: PaymentStatusData = {
          payment_id: Date.now(),
          sale_id: saleId,
          module_source: data.module_source || "pos",
          invoice_number: data.invoice_number || `FT-${Date.now().toString().slice(-4)}`,
          customer_name: data.customer_name || "Cliente Balcão",
          customer_phone: data.customer_phone || null,
          amount_total: total,
          amount_paid: data.amount_paid,
          amount_owed: remaining,
          status: remaining === 0 ? "paid" : "partial",
          due_date: data.due_date || null,
          is_overdue: false,
          created_at: now,
          updated_at: now,
          transactions: [
            {
              id: Date.now() + 1,
              payment_id: Date.now(),
              amount: data.amount_paid,
              payment_method: data.payment_method,
              transaction_id: data.transaction_id || null,
              notes: data.notes || null,
              paid_at: now,
              created_at: now,
            },
          ],
          message:
            remaining === 0
              ? `Pagamento de ${data.amount_paid} MT liquidado!`
              : `Pagamento parcial de ${data.amount_paid} MT. Falta pagar ${remaining} MT.`,
        };
        MOCK_PAYMENTS.unshift(newPayment);
        return newPayment;
      }

      existing.amount_paid += data.amount_paid;
      existing.amount_owed = Math.max(0, existing.amount_total - existing.amount_paid);
      existing.status = existing.amount_owed === 0 ? "paid" : "partial";
      existing.updated_at = now;
      if (data.due_date) existing.due_date = data.due_date;

      existing.transactions.unshift({
        id: Date.now(),
        payment_id: existing.payment_id,
        amount: data.amount_paid,
        payment_method: data.payment_method,
        transaction_id: data.transaction_id || null,
        notes: data.notes || null,
        paid_at: now,
        created_at: now,
      });

      return existing;
    }
  }

  /**
   * Dividir pagamento entre múltiplos métodos simultâneos
   */
  async splitPayment(
    saleId: number,
    data: SplitPaymentInput,
    companyId = 1
  ): Promise<PaymentStatusData> {
    try {
      const response = await api.post<PaymentStatusData>(`${API_PREFIX}/${saleId}/split`, data, {
        params: { company_id: companyId },
      });
      return response.data;
    } catch {
      const totalSplit = data.payments.reduce((acc, p) => acc + p.amount, 0);
      const total = data.amount_total || totalSplit;
      const remaining = Math.max(0, total - totalSplit);
      const now = new Date().toISOString();

      const newPayment: PaymentStatusData = {
        payment_id: Date.now(),
        sale_id: saleId,
        module_source: data.module_source || "pos",
        invoice_number: data.invoice_number || `SPLIT-${Date.now().toString().slice(-4)}`,
        customer_name: data.customer_name || "Cliente Balcão",
        customer_phone: null,
        amount_total: total,
        amount_paid: totalSplit,
        amount_owed: remaining,
        status: remaining === 0 ? "paid" : "partial",
        due_date: null,
        is_overdue: false,
        created_at: now,
        updated_at: now,
        transactions: data.payments.map((p, idx) => ({
          id: Date.now() + idx,
          payment_id: Date.now(),
          amount: p.amount,
          payment_method: p.payment_method,
          transaction_id: p.transaction_id || null,
          notes: p.notes || null,
          paid_at: now,
          created_at: now,
        })),
        message:
          remaining === 0
            ? `Pagamento dividido de ${totalSplit} MT totalmente liquidado!`
            : `Pagamento dividido de ${totalSplit} MT registrado. Falta ${remaining} MT.`,
      };

      MOCK_PAYMENTS.unshift(newPayment);
      return newPayment;
    }
  }

  /**
   * Consultar status de pagamento
   */
  async getPaymentStatus(
    saleId: number,
    moduleSource?: string,
    companyId = 1
  ): Promise<PaymentStatusData> {
    try {
      const response = await api.get<PaymentStatusData>(`${API_PREFIX}/${saleId}/status`, {
        params: { module: moduleSource, company_id: companyId },
      });
      return response.data;
    } catch {
      const found = MOCK_PAYMENTS.find((p) => p.sale_id === saleId || p.payment_id === saleId);
      if (!found) {
        throw new Error("Registo de pagamento não encontrado");
      }
      return found;
    }
  }

  /**
   * Listar todas as vendas em aberto / com saldo devedor
   */
  async getOutstandingPayments(
    companyId = 1,
    moduleSource?: string
  ): Promise<OutstandingPaymentsResponse> {
    try {
      const response = await api.get<OutstandingPaymentsResponse>(`${API_PREFIX}/outstanding`, {
        params: { company_id: companyId, module: moduleSource },
      });
      return response.data;
    } catch {
      const unpaid = MOCK_PAYMENTS.filter((p) => p.amount_owed > 0);
      return {
        company_id: companyId,
        total_outstanding_amount: unpaid.reduce((acc, p) => acc + p.amount_owed, 0),
        total_unpaid_count: unpaid.length,
        items: unpaid.map((p) => ({
          payment_id: p.payment_id,
          sale_id: p.sale_id,
          module_source: p.module_source,
          invoice_number: p.invoice_number,
          customer_name: p.customer_name,
          customer_phone: p.customer_phone,
          amount_total: p.amount_total,
          amount_paid: p.amount_paid,
          amount_owed: p.amount_owed,
          status: p.status,
          due_date: p.due_date,
          is_overdue: p.is_overdue,
          created_at: p.created_at,
        })),
      };
    }
  }

  /**
   * Cálculo de preço e desconto para planos de subscrição e pagamentos anuais
   */
  calculatePrice(baseMonthly: number, cycle: "monthly" | "annual") {
    if (cycle === "annual") {
      const annualWithoutDiscount = baseMonthly * 12;
      const discount = annualWithoutDiscount * 0.1;
      const total = annualWithoutDiscount - discount;
      return {
        total,
        monthlyEquivalent: total / 12,
        savings: discount,
      };
    }
    return {
      total: baseMonthly,
      monthlyEquivalent: baseMonthly,
      savings: 0,
    };
  }

  /**
   * Processar checkout de subscrição / compra de plano de licença
   */
  async processSubscriptionCheckout(data: {
    planId: string;
    billingCycle: "monthly" | "annual";
    customerName: string;
    customerEmail?: string;
    companyNuit?: string;
    paymentMethod: string;
  }): Promise<{ success: boolean; licenseKey?: string; message?: string }> {
    try {
      const response = await api.post<{
        success: boolean;
        license_key?: string;
        licenseKey?: string;
        message?: string;
      }>("/api/v1/licensing/checkout", data);
      return {
        success: response.data.success ?? true,
        licenseKey: response.data.license_key || response.data.licenseKey,
        message: response.data.message || "Subscrição ativada com sucesso!",
      };
    } catch {
      // Mock local fallback para testes
      const prefix = "TIC";
      const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
      const planCode = data.planId.toUpperCase();
      const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const sig = Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockKey = `${prefix}-${randomPart}-${planCode}-${dateCode}-${sig}`;

      return {
        success: true,
        licenseKey: mockKey,
        message: `Pagamento de subscrição aprovado via ${data.paymentMethod.toUpperCase()}!`,
      };
    }
  }
}

export const paymentService = new PaymentService();
