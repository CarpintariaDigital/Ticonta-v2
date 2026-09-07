import { FiscalDocument } from './fiscalMoz';
import { formatMZN } from './currency';

/**
 * Normaliza e formata números de telefone moçambicanos (+258 / 82, 83, 84, 85, 86, 87)
 */
export function formatMozPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("258")) return digits;
  if (
    digits.length === 9 &&
    (digits.startsWith("82") ||
      digits.startsWith("83") ||
      digits.startsWith("84") ||
      digits.startsWith("85") ||
      digits.startsWith("86") ||
      digits.startsWith("87"))
  ) {
    return `258${digits}`;
  }
  return digits;
}

/**
 * Gera URL seguro para disparo de WhatsApp Web ou Mobile (wa.me)
 */
export function getWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = formatMozPhone(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Abre o WhatsApp em nova aba com o texto pré-formatado
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = getWhatsAppLink(phone, message);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * Construtor padrão de mensagem de recibo digital
 */
export function buildReceiptMessage({
  invoiceNumber,
  customerName,
  total,
  itemsCount,
  publicUrl,
}: {
  invoiceNumber: string;
  customerName?: string;
  total: string;
  itemsCount: number;
  publicUrl?: string;
}): string {
  let msg = `*TiConta v2 ERP — Recibo Digital*\n`;
  if (customerName) msg += `Olá, ${customerName}!\n`;
  msg += `\n*Fatura/Recibo:* #${invoiceNumber}`;
  msg += `\n*Qtd. Itens:* ${itemsCount}`;
  msg += `\n*Total Pago:* ${total}`;
  if (publicUrl) msg += `\n\nComprovativo online:\n${publicUrl}`;
  msg += `\n\n_Obrigado pela preferência!_`;
  return msg;
}

/**
 * Gera mensagem fiscal detalhada compatível com as regras de Moçambique (Zero Papel)
 */
export function generateWhatsAppReceiptText(doc: FiscalDocument): string {
  const itemsText = doc.items
    .map((item) => `  ▫️ ${item.qty}x *${item.description}* - ${formatMZN(item.total)}`)
    .join('\n');

  return encodeURIComponent(
`*${doc.companyName.toUpperCase()}*
*${doc.docType.toUpperCase()}: ${doc.docNumber}*
📅 Data: ${doc.date}
👤 Cliente: ${doc.clientName} (NUIT: ${doc.clientNUIT || 'Consumidor Final'})
━━━━━━━━━━━━━━━━━━━━
*ITENS:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━
Subtotal: ${formatMZN(doc.subtotal)}
IVA (16% Incluído): ${formatMZN(doc.tax16)}
*TOTAL PAGO: ${formatMZN(doc.total)}*
Pagamento: *${doc.paymentMethod}* ${doc.paymentReference ? `(Ref: ${doc.paymentReference})` : ''}
━━━━━━━━━━━━━━━━━━━━
🔐 *Validação Fiscal Digital:*
https://ticonta.mz/v/${doc.id}?hash=${doc.verificationHash.slice(0, 8)}

_Documento processado eletronicamente por TiConta v2 ERP (Zero Papel)._`
  );
}

export function generateWhatsAppFiadoReminder(
  clientName: string,
  amount: number,
  dueDate: string,
  companyName: string
): string {
  return encodeURIComponent(
`Olá *${clientName}*, tudo bem?
Passamos para lembrar do seu registo em aberto na *${companyName}*:
💰 *Valor Pendente: ${formatMZN(amount)}*
📅 Vencimento acordado: ${dueDate}

Agradecemos a sua preferência e parceria! Para regularizar via M-Pesa/e-Mola ou no balcão, responda a esta mensagem. Obrigado!`
  );
}

export function generateWhatsAppAutoDiagnosis(
  osNumber: string,
  clientName: string,
  vehicle: string,
  total: number,
  link: string
): string {
  return encodeURIComponent(
`Olá *${clientName}*!
A Ordem de Serviço *${osNumber}* do veículo *${vehicle}* foi atualizada.
📊 *Diagnóstico Técnico & Orçamento:*
Total: *${formatMZN(total)}*
Aceda ao relatório e checklist digital: ${link}

Por favor, responda com sua aprovação para início imediato dos trabalhos.`
  );
}
