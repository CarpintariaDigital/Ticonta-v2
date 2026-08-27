"use client";

import { useState } from "react";
import {
  Smartphone,
  Share2,
  Copy,
  Check,
  X,
  Receipt,
  FileCheck,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface POSReceiptProps {
  sale: any;
  onClose: () => void;
}

export default function POSReceipt({ sale, onClose }: POSReceiptProps) {
  const [customerPhone, setCustomerPhone] = useState(sale.customer_phone || "");
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const invoiceNumber = sale.invoice_number || `VD/${new Date().getFullYear()}/${String(sale.id || 1).padStart(4, "0")}`;
  const saleDate = new Date(sale.sale_date || Date.now()).toLocaleString("pt-MZ");
  const totalAmount = Number(sale.net_amount || sale.total_amount || 0);
  const subtotalAmount = Number(sale.total_amount || sale.net_amount || 0);
  const ivaAmount = (totalAmount * 0.16) / 1.16; // 16% IVA Moçambique incluído
  const paymentMethodLabel = (sale.payment_method || "Dinheiro").toUpperCase();

  const generateWhatsAppMessage = () => {
    const itemsText =
      sale.items && sale.items.length > 0
        ? sale.items
            .map(
              (it: any) =>
                `• *${it.quantity}x* ${it.product_name || `Artigo #${it.product_id}`} — ${(it.quantity * it.unit_price).toFixed(2)} MT`
            )
            .join("\n")
        : `• 1x Consumo Geral — ${totalAmount.toFixed(2)} MT`;

    return `🧾 *TICONTA v2 ERP • TALÃO DIGITAL MZ*
━━━━━━━━━━━━━━━━━━━━
🏢 *LOJA:* TiConta Comercial & Serviços
📄 *DOCUMENTO:* ${invoiceNumber}
📅 *DATA/HORA:* ${saleDate}
💳 *PAGAMENTO:* ${paymentMethodLabel}
━━━━━━━━━━━━━━━━━━━━
🛒 *ARTIGOS:*
${itemsText}
━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal:* ${(totalAmount - ivaAmount).toFixed(2)} MT
📊 *IVA (16% incluído):* ${ivaAmount.toFixed(2)} MT
💰 *TOTAL PAGO:* *${totalAmount.toFixed(2)} MT*
━━━━━━━━━━━━━━━━━━━━
✅ *Comprovativo Fiscal Certificado pela AT*
🌱 *Documento 100% Digital • Sem Papel*
🙏 *Obrigado pela sua preferência!*`;
  };

  const handleSendWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("258")
      ? cleanPhone
      : cleanPhone.length === 9
      ? `258${cleanPhone}`
      : cleanPhone;

    const message = encodeURIComponent(generateWhatsAppMessage());
    const waUrl = formattedPhone
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${message}`
      : `https://api.whatsapp.com/send?text=${message}`;

    window.open(waUrl, "_blank");
  };

  const handleCopyToClipboard = async () => {
    const text = generateWhatsAppMessage();
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: `Fatura ${invoiceNumber} - TiConta`,
          text: generateWhatsAppMessage(),
        });
      } catch {}
      setIsSharing(false);
    } else {
      handleCopyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md chassis-panel shadow-2xl text-zinc-100 flex flex-col max-h-[90vh] font-mono border-emerald-500/30">
        {/* Header */}
        <div className="chassis-header bg-[#0c1626] border-b border-[#1c3150] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                VENDA CONCLUÍDA COM SUCESSO
              </h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Faturação Digital Pronta para WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Digital Receipt Preview Card */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs space-y-3 relative overflow-hidden shadow-inner">
            <div className="text-center border-b border-dashed border-zinc-800 pb-3">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold mb-1">
                <Sparkles className="w-3 h-3" />
                TICONTA v2 DIGITAL
              </div>
              <h2 className="text-sm font-black uppercase text-white tracking-widest">
                TALÃO DIGITAL DE VENDA
              </h2>
              <p className="text-[10px] text-zinc-400">Maputo, Moçambique • NUIT: 400123456</p>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-400">Nº DOCUMENTO:</span>
                <span className="font-bold text-white">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">DATA / HORA:</span>
                <span className="text-zinc-300">{saleDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">PAGAMENTO:</span>
                <span className="font-bold text-emerald-400">{paymentMethodLabel}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="border-t border-b border-dashed border-zinc-800 py-2.5 space-y-1.5 text-[11px]">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-zinc-300 truncate max-w-[200px]">
                      {it.quantity}x {it.product_name || `Artigo #${it.product_id}`}
                    </span>
                    <span className="font-bold text-white">
                      {(it.quantity * it.unit_price).toFixed(2)} MT
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span className="text-zinc-300">Artigos Registados</span>
                  <span className="font-bold text-white">{totalAmount.toFixed(2)} MT</span>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal (Líquido):</span>
                <span>{(totalAmount - ivaAmount).toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>IVA (16% incluído):</span>
                <span className="text-emerald-400 font-bold">{ivaAmount.toFixed(2)} MT</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-2 border-t border-zinc-800 text-white">
                <span className="text-emerald-400">TOTAL PAGO:</span>
                <span className="text-emerald-400 text-base">{totalAmount.toFixed(2)} MT</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-dashed border-zinc-800 text-[10px] text-zinc-500">
              🌱 Faturação 100% Digital • Sem Papel • Ecológico & Moderno
            </div>
          </div>
        </div>

        {/* WhatsApp Delivery Action Section */}
        <div className="border-t border-zinc-800 p-4 space-y-3 bg-zinc-950/90 rounded-b-2xl">
          <form onSubmit={handleSendWhatsApp} className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              WhatsApp do Cliente (Opcional ou com DDD)
            </label>
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="Ex: 841234567 ou 861234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-10 text-xs bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 font-bold focus:border-emerald-500"
              />
              <Button
                type="submit"
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-950"
              >
                <Smartphone className="h-4 w-4" />
                Enviar WhatsApp
              </Button>
            </div>
          </form>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyToClipboard}
              className="h-10 border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-800"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {isCopied ? "Copiado!" : "Copiar Texto"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleNativeShare}
              className="h-10 border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-800"
            >
              <Share2 className="h-3.5 w-3.5" />
              Partilhar
            </Button>
          </div>

          <Button
            type="button"
            onClick={onClose}
            className="w-full h-11 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs uppercase tracking-widest rounded-xl"
          >
            NOVA VENDA ↵
          </Button>
        </div>
      </div>
    </div>
  );
}

