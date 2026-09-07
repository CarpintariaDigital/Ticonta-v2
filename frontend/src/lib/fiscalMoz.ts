/**
 * Validação de NUIT (9 dígitos obrigatórios) e utilitários fiscais AT Moçambique
 */
export function isValidNUIT(nuit: string): boolean {
  const clean = nuit.replace(/\D/g, '');
  return clean.length === 9;
}

export function formatNUIT(nuit: string): string {
  const clean = nuit.replace(/\D/g, '');
  if (clean.length !== 9) return nuit;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
}

export function generateFiscalDocNumber(type: 'FR' | 'FT' | 'ND' | 'OS' = 'FR', sequence: number = 1042): string {
  const year = new Date().getFullYear();
  const padded = sequence.toString().padStart(6, '0');
  return `${type}-${year}/${padded}`;
}

export interface FiscalDocument {
  id: string;
  docNumber: string;
  docType: 'Factura-Recibo' | 'Factura' | 'Nota de Débito' | 'Ordem de Serviço';
  date: string;
  clientName: string;
  clientPhone: string;
  clientNUIT: string;
  companyName: string;
  companyNUIT: string;
  companyAddress: string;
  companyContact: string;
  items: Array<{
    id: string;
    description: string;
    qty: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax16: number;
  total: number;
  paymentMethod: 'M-Pesa' | 'e-Mola' | 'POS/Cartão' | 'Numerário' | 'Transferência';
  paymentReference?: string;
  amountReceived?: number;
  change?: number;
  verificationHash: string;
}
