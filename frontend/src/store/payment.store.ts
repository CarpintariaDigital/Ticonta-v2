import { create } from "zustand";
import { PaymentStatusData, OutstandingPaymentsResponse } from "@/types/payment";

export interface PaymentState {
  currentPayment: PaymentStatusData | null;
  recentReceipt: PaymentStatusData | null;
  outstandingPayments: OutstandingPaymentsResponse | null;
  isReceiptModalOpen: boolean;
  isSplitPaymentOpen: boolean;
  isOutstandingModalOpen: boolean;
  isLoading: boolean;

  setCurrentPayment: (payment: PaymentStatusData | null) => void;
  setRecentReceipt: (receipt: PaymentStatusData | null) => void;
  setIsReceiptModalOpen: (open: boolean) => void;
  setIsSplitPaymentOpen: (open: boolean) => void;
  setIsOutstandingModalOpen: (open: boolean) => void;
  setOutstandingPayments: (data: OutstandingPaymentsResponse | null) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  currentPayment: null,
  recentReceipt: null,
  outstandingPayments: null,
  isReceiptModalOpen: false,
  isSplitPaymentOpen: false,
  isOutstandingModalOpen: false,
  isLoading: false,

  setCurrentPayment: (payment) => set({ currentPayment: payment }),
  setRecentReceipt: (receipt) => set({ recentReceipt: receipt }),
  setIsReceiptModalOpen: (isReceiptModalOpen) => set({ isReceiptModalOpen }),
  setIsSplitPaymentOpen: (isSplitPaymentOpen) => set({ isSplitPaymentOpen }),
  setIsOutstandingModalOpen: (isOutstandingModalOpen) => set({ isOutstandingModalOpen }),
  setOutstandingPayments: (outstandingPayments) => set({ outstandingPayments }),
  reset: () =>
    set({
      currentPayment: null,
      recentReceipt: null,
      outstandingPayments: null,
      isReceiptModalOpen: false,
      isSplitPaymentOpen: false,
      isOutstandingModalOpen: false,
      isLoading: false,
    }),
}));
