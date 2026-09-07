import { create } from "zustand";
import { PaymentStatusData, OutstandingPaymentsResponse } from "@/types/payment";

interface PaymentState {
  currentPayment: PaymentStatusData | null;
  recentReceipt: PaymentStatusData | null;
  outstandingPayments: OutstandingPaymentsResponse | null;

  isReceiptModalOpen: boolean;
  isSplitPaymentOpen: boolean;
  isOutstandingModalOpen: boolean;
  isLoading: boolean;

  setCurrentPayment: (payment: PaymentStatusData | null) => void;
  setRecentReceipt: (receipt: PaymentStatusData | null) => void;
  setOutstandingPayments: (data: OutstandingPaymentsResponse | null) => void;
  setIsReceiptModalOpen: (open: boolean) => void;
  setIsSplitPaymentOpen: (open: boolean) => void;
  setIsOutstandingModalOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  currentPayment: null,
  recentReceipt: null,
  outstandingPayments: null,

  isReceiptModalOpen: false,
  isSplitPaymentOpen: false,
  isOutstandingModalOpen: false,
  isLoading: false,

  setCurrentPayment: (currentPayment) => set({ currentPayment }),
  setRecentReceipt: (recentReceipt) => set({ recentReceipt }),
  setOutstandingPayments: (outstandingPayments) => set({ outstandingPayments }),
  setIsReceiptModalOpen: (isReceiptModalOpen) => set({ isReceiptModalOpen }),
  setIsSplitPaymentOpen: (isSplitPaymentOpen) => set({ isSplitPaymentOpen }),
  setIsOutstandingModalOpen: (isOutstandingModalOpen) => set({ isOutstandingModalOpen }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
