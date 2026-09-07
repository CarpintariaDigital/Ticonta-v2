import { useCallback, useEffect } from "react";
import { DeliveryMethod, documentDeliveryService } from "@/services/document_delivery";
import { useDocumentDeliveryStore } from "@/store/document_delivery.store";

export function useDocumentDelivery(customerKey?: string) {
  const {
    savedContacts,
    history,
    isLoading,
    error,
    saveContact,
    fetchHistory,
    sendDocument,
    resendDocument,
    clearError,
  } = useDocumentDeliveryStore();

  const savedContact = customerKey ? savedContacts[customerKey] : undefined;

  const sendViaWhatsApp = useCallback(
    async (documentId: number, phone: string, docType: any = "invoice") => {
      return sendDocument(documentId, {
        document_type: docType,
        delivery_method: "whatsapp",
        customer_phone: phone,
      });
    },
    [sendDocument]
  );

  const sendViaSMS = useCallback(
    async (documentId: number, phone: string, docType: any = "invoice") => {
      return sendDocument(documentId, {
        document_type: docType,
        delivery_method: "sms",
        customer_phone: phone,
      });
    },
    [sendDocument]
  );

  const sendViaEmail = useCallback(
    async (documentId: number, email: string, docType: any = "invoice") => {
      return sendDocument(documentId, {
        document_type: docType,
        delivery_method: "email",
        customer_email: email,
      });
    },
    [sendDocument]
  );

  const getDeliveryStatus = useCallback(async (documentId: number) => {
    return documentDeliveryService.getDeliveryStatus(documentId);
  }, []);

  return {
    savedContact,
    history,
    isLoading,
    error,
    sendViaWhatsApp,
    sendViaSMS,
    sendViaEmail,
    getDeliveryStatus,
    fetchHistory,
    resendDocument,
    saveContact,
    clearError,
  };
}
