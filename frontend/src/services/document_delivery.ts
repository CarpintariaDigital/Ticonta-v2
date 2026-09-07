import { apiClient } from "@/services/auth";

export type DeliveryMethod = "whatsapp" | "sms" | "email";
export type DeliveryStatus = "pending" | "sent" | "failed" | "delivered";

export interface SendDocumentPayload {
  document_type?: "invoice" | "receipt" | "quote" | "purchase_order";
  delivery_method: DeliveryMethod;
  customer_phone?: string;
  customer_email?: string;
}

export interface DocumentDeliveryItem {
  id: number;
  company_id: number;
  document_type: string;
  document_id: number;
  customer_phone?: string;
  customer_email?: string;
  delivery_method: DeliveryMethod;
  status: DeliveryStatus;
  pdf_url: string;
  message_id?: string;
  sent_at?: string;
  delivered_at?: string;
}

export interface DocumentDeliveryStatusResponse {
  document_id: number;
  delivery_id: number;
  delivery_method: DeliveryMethod;
  status: DeliveryStatus;
  pdf_url: string;
  sent_at?: string;
  delivered_at?: string;
  history_count: number;
}

export const documentDeliveryService = {
  /**
   * Envia um documento por WhatsApp, SMS ou Email
   */
  async sendDocument(
    documentId: number,
    payload: SendDocumentPayload
  ): Promise<DocumentDeliveryItem> {
    const response = await apiClient.post<DocumentDeliveryItem>(
      `/api/v1/documents/${documentId}/send`,
      payload
    );
    return response.data;
  },

  /**
   * Consulta o status de entrega do documento
   */
  async getDeliveryStatus(documentId: number): Promise<DocumentDeliveryStatusResponse> {
    const response = await apiClient.get<DocumentDeliveryStatusResponse>(
      `/api/v1/documents/${documentId}/delivery-status`
    );
    return response.data;
  },

  /**
   * Reenvia um documento pelo ID da entrega
   */
  async resendDocument(deliveryId: number): Promise<DocumentDeliveryItem> {
    const response = await apiClient.post<DocumentDeliveryItem>(
      `/api/v1/documents/${deliveryId}/resend`
    );
    return response.data;
  },

  /**
   * Consulta o histórico de entregas
   */
  async getDeliveryHistory(params?: {
    delivery_method?: string;
    status?: string;
  }): Promise<DocumentDeliveryItem[]> {
    const query = new URLSearchParams();
    if (params?.delivery_method) query.append("delivery_method", params.delivery_method);
    if (params?.status) query.append("status", params.status);

    const response = await apiClient.get<DocumentDeliveryItem[]>(
      `/api/v1/documents/delivery-history?${query.toString()}`
    );
    return response.data;
  },
};
