'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Share2, 
  MessageSquare, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { FiscalDocument } from '@/lib/fiscalMoz';
import { formatMZN } from '@/lib/currency';
import { generateWhatsAppReceiptText } from '@/lib/whatsapp';
import { generateSMSReceiptText } from '@/lib/sms';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: FiscalDocument | null;
}

export function DigitalReceiptModal({ isOpen, onClose, document }: DigitalReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  if (!document) return null;

  const handleWhatsAppSend = () => {
    const encodedText = generateWhatsAppReceiptText(document);
    const phoneClean = document.clientPhone.replace(/\D/g, '');
    const url = phoneClean 
      ? `https://wa.me/${phoneClean}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleSMSCopy = () => {
    const text = generateSMSReceiptText(document);
    navigator.clipboard.writeText(text);
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

  const handleCopySummary = () => {
    const summary = `${document.companyName}\n${document.docType}: ${document.docNumber}\nTotal: ${formatMZN(document.total)}\nValidação: https://ticonta.mz/v/${document.id}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DOCUMENTO FISCAL EMITIDO — 100% DIGITAL"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>CERTIFICADO DIGITAL AT MZ</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Concluir & Novo Registo
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase">Transação Gravada com Sucesso</h4>
            <p className="text-xs text-emerald-700">
              Documento assinado digitalmente. Faturação Zero Papel pronta para envio direto ao cliente.
            </p>
          </div>
        </div>

        {/* Digital Document Display Sheet */}
        <div className="border border-slate-300 rounded-lg bg-white overflow-hidden shadow-sm font-mono text-xs">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 flex justify-between items-start">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {document.companyName}
              </div>
              <div className="text-[10px] text-slate-400">NUIT: {document.companyNUIT}</div>
              <div className="text-[10px] text-slate-400">{document.companyAddress}</div>
            </div>
            <div className="text-right">
              <Badge variant="emerald" className="font-bold">
                {document.docType.toUpperCase()}
              </Badge>
              <div className="text-[11px] text-slate-300 font-bold mt-1">
                {document.docNumber}
              </div>
              <div className="text-[10px] text-slate-400">{document.date}</div>
            </div>
          </div>

          {/* Client Details */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[11px]">
            <div>
              <span className="text-slate-500">Cliente: </span>
              <span className="font-bold text-slate-800">{document.clientName}</span>
            </div>
            <div>
              <span className="text-slate-500">NUIT: </span>
              <span className="font-semibold text-slate-700">{document.clientNUIT || '999999999'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-3 max-h-48 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px]">
                  <th className="pb-1">QTD</th>
                  <th className="pb-1">DESCRIÇÃO</th>
                  <th className="pb-1 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {document.items.map((item, i) => (
                  <tr key={i} className="text-slate-800">
                    <td className="py-1.5 font-bold text-slate-500">{item.qty}x</td>
                    <td className="py-1.5">{item.description}</td>
                    <td className="py-1.5 text-right font-bold">{formatMZN(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tax */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Incidência (Líquido):</span>
              <span>{formatMZN(document.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA (16% Incluído):</span>
              <span className="text-emerald-700 font-semibold">{formatMZN(document.tax16)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-300">
              <span>TOTAL PAGO:</span>
              <span className="text-emerald-700 font-mono text-base">{formatMZN(document.total)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Método: {document.paymentMethod}</span>
              {document.change ? <span>Troco: {formatMZN(document.change)}</span> : null}
            </div>
          </div>

          {/* Security Hash & Zero-Paper Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Hash Fiscal:</span>
              <span className="font-mono text-slate-700">{document.verificationHash}</span>
            </div>
            <span className="text-emerald-700 font-semibold">100% Digital / Zero Papel</span>
          </div>
        </div>

        {/* Digital Action Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <Button
            variant="primary"
            onClick={handleWhatsAppSend}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs"
          >
            <MessageSquare size={16} />
            <span>Enviar por WhatsApp</span>
          </Button>

          <Button
            variant="secondary"
            onClick={handleSMSCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs"
          >
            <Smartphone size={16} />
            <span>{smsSent ? 'SMS Copiado!' : 'Copiar Texto SMS'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCopySummary}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Sumário Copiado!' : 'Copiar Sumário Rápido'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.open(`https://ticonta.mz/v/${document.id}`, '_blank')}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs"
          >
            <ExternalLink size={14} />
            <span>Abrir Link Verificador</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
