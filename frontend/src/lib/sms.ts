import { FiscalDocument } from './fiscalMoz';
import { formatMZN } from './currency';

/**
 * Gera texto conciso para envio de SMS com resumo fiscal e código de autenticidade
 */
export function generateSMSReceiptText(doc: FiscalDocument): string {
  return `${doc.companyName}: ${doc.docType} ${doc.docNumber}. Total: ${formatMZN(doc.total)}. Pago via ${doc.paymentMethod}. Validação: https://ticonta.mz/v/${doc.id} (Hash: ${doc.verificationHash.slice(0, 6)})`;
}

export function generateSMSFiadoText(clientName: string, amount: number, companyName: string): string {
  return `${companyName}: Lembrança de saldo pendente no valor de ${formatMZN(amount)}. Regularize no balcão ou via M-Pesa. Obrigado!`;
}

export function generateSMSTakeawayText(orderId: string, status: string, courierName: string): string {
  return `TiConta Entregas: O seu pedido #${orderId} está ${status} com o estafeta ${courierName}. Previsão: 15-25 min.`;
}
