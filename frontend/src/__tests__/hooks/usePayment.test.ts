import { describe, it, expect, beforeEach } from "vitest";
import { usePaymentStore } from "@/store/payment.store";
import { PaymentStatusData } from "@/types/payment";

describe("usePaymentStore", () => {
  beforeEach(() => {
    usePaymentStore.setState({
      currentPayment: null,
      recentReceipt: null,
      outstandingPayments: null,
      isReceiptModalOpen: false,
      isSplitPaymentOpen: false,
      isOutstandingModalOpen: false,
      isLoading: false,
    });
  });

  it("initializes with default payment state", () => {
    const state = usePaymentStore.getState();
    expect(state.currentPayment).toBeNull();
    expect(state.recentReceipt).toBeNull();
    expect(state.isReceiptModalOpen).toBe(false);
    expect(state.isSplitPaymentOpen).toBe(false);
    expect(state.isOutstandingModalOpen).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it("sets current payment and recent receipt", () => {
    const mockPayment: PaymentStatusData = {
      payment_id: 10,
      sale_id: 99,
      module_source: "pos",
      invoice_number: "FT-9901",
      customer_name: "Armando Guebuza",
      customer_phone: "+258841112233",
      amount_total: 2000,
      amount_paid: 1000,
      amount_owed: 1000,
      status: "partial",
      due_date: new Date().toISOString(),
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      transactions: [],
      message: "Pagamento parcial.",
    };

    usePaymentStore.getState().setCurrentPayment(mockPayment);
    usePaymentStore.getState().setRecentReceipt(mockPayment);
    usePaymentStore.getState().setIsReceiptModalOpen(true);

    const state = usePaymentStore.getState();
    expect(state.currentPayment?.amount_owed).toBe(1000);
    expect(state.recentReceipt?.customer_name).toBe("Armando Guebuza");
    expect(state.isReceiptModalOpen).toBe(true);
  });

  it("toggles split payment and outstanding modals", () => {
    usePaymentStore.getState().setIsSplitPaymentOpen(true);
    usePaymentStore.getState().setIsOutstandingModalOpen(true);

    const state = usePaymentStore.getState();
    expect(state.isSplitPaymentOpen).toBe(true);
    expect(state.isOutstandingModalOpen).toBe(true);
  });
});
