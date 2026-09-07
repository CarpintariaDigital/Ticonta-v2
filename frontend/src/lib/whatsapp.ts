import { FiscalDocument } from './fiscalMoz';
import { formatMZN } from './currency';

/**
 * Gera mensagem estruturada para envio direto de comprovativo fiscal via WhatsApp
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

export function generateWhatsAppFiadoReminder(clientName: string, amount: number, dueDate: string, companyName: string): string {
  return encodeURIComponent(
`Olá *${clientName}*, tudo bem?
Passamos para lembrar do seu registo em aberto na *${companyName}*:
💰 *Valor Pendente: ${formatMZN(amount)}*
📅 Vencimento acordado: ${dueDate}

Agradecemos a sua preferência e parceria! Para regularizar via M-Pesa/e-Mola ou no balcão, responda a esta mensagem. Obrigado!`
  );
}

export function generateWhatsAppAutoDiagnosis(osNumber: string, clientName: string, vehicle: string, total: number, link: string): string {
  return encodeURIComponent(
`Olá *${clientName}*!
A Ordem de Serviço *${osNumber}* do veículo *${vehicle}* foi atualizada.
📊 *Diagnóstico Técnico & Orçamento:*
Total: *${formatMZN(total)}*
Aceda ao relatório e checklist digital: ${link}

Por favor, responda com sua aprovação para início imediato dos trabalhos.`
  );
}
