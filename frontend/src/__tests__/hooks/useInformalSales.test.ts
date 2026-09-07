import { describe, it, expect, beforeEach } from "vitest";
import { useInformalSalesStore } from "@/store/informal_sales.store";
import { InformalCustomer, Debit } from "@/types/informal_sales";

describe("useInformalSalesStore", () => {
  beforeEach(() => {
    useInformalSalesStore.setState({
      customers: [],
      selectedCustomer: null,
      customerDebits: [],
      overdueDebits: [],
      cartItems: [],
      amountPaidNow: 0,
      dueDate: null,
      paymentMethod: "cash",
      saleNotes: "",
      activeTab: "checkout",
      searchQuery: "",
      customerFilter: "all",
      isCollectionModalOpen: false,
      selectedDebitForCollection: null,
      isHistoryModalOpen: false,
      isNewCustomerModalOpen: false,
      isReceiptModalOpen: false,
      lastSaleReceipt: null,
      cashFlowForecast: null,
      revenueBreakdown: null,
      creditRiskReport: null,
      isLoading: false,
    });
  });

  it("initializes with default state", () => {
    const state = useInformalSalesStore.getState();
    expect(state.customers).toHaveLength(0);
    expect(state.selectedCustomer).toBeNull();
    expect(state.cartItems).toHaveLength(0);
    expect(state.activeTab).toBe("checkout");
  });

  it("adds items to cart and computes quantities", () => {
    useInformalSalesStore.getState().addItemToCart({ name: "Saco Arroz 25kg", unit_price: 1450, quantity: 1 });
    useInformalSalesStore.getState().addItemToCart({ name: "Óleo 5L", unit_price: 650, quantity: 2 });

    let state = useInformalSalesStore.getState();
    expect(state.cartItems).toHaveLength(2);
    expect(state.cartItems[0].name).toBe("Saco Arroz 25kg");
    expect(state.cartItems[1].quantity).toBe(2);

    // Increment quantity
    useInformalSalesStore.getState().updateCartItemQuantity(state.cartItems[0].id, 1);
    state = useInformalSalesStore.getState();
    expect(state.cartItems[0].quantity).toBe(2);

    // Clear cart
    useInformalSalesStore.getState().clearCart();
    expect(useInformalSalesStore.getState().cartItems).toHaveLength(0);
  });

  it("manages informal customers and updates debt balances", () => {
    const mockCustomer: InformalCustomer = {
      id: 1,
      company_id: 1,
      name: "Dona Maria Machava",
      phone: "+258849993344",
      location: "Chamanculo C",
      total_purchases: 5000,
      total_owed: 2000,
      trusted_credit_limit: 5000,
      payment_reliability: 4.8,
      verified: true,
      active: true,
      created_at: "",
      updated_at: "",
    };

    useInformalSalesStore.getState().addCustomerToState(mockCustomer);
    expect(useInformalSalesStore.getState().customers).toHaveLength(1);
    expect(useInformalSalesStore.getState().selectedCustomer?.name).toBe("Dona Maria Machava");

    // Partial Payment updates customer balance
    useInformalSalesStore.getState().updateCustomerInState(1, { total_owed: 1000 });
    expect(useInformalSalesStore.getState().customers[0].total_owed).toBe(1000);
    expect(useInformalSalesStore.getState().selectedCustomer?.total_owed).toBe(1000);
  });

  it("applies partial payment to overdue debits in state", () => {
    const mockDebit: Debit = {
      id: 101,
      company_id: 1,
      customer_id: 1,
      customer_name: "Dona Maria Machava",
      total_amount: 2000,
      initial_paid: 0,
      amount_owed: 2000,
      amount_paid: 0,
      due_date: new Date().toISOString(),
      status: "overdue",
      reminder_count: 0,
      is_overdue: true,
      days_overdue: 4,
      created_at: "",
      updated_at: "",
      partial_payments: [],
    };

    useInformalSalesStore.getState().setOverdueDebits([mockDebit]);
    expect(useInformalSalesStore.getState().overdueDebits).toHaveLength(1);

    // Amortize 1000 MT
    useInformalSalesStore.getState().applyPartialPaymentToState(101, 1000, 1000);
    let state = useInformalSalesStore.getState();
    expect(state.overdueDebits[0].amount_owed).toBe(1000);
    expect(state.overdueDebits[0].amount_paid).toBe(1000);

    // Fully pay remaining 1000 MT -> removes from overdue
    useInformalSalesStore.getState().applyPartialPaymentToState(101, 1000, 0);
    state = useInformalSalesStore.getState();
    expect(state.overdueDebits).toHaveLength(0);
  });
});
