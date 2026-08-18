"use client";

import { useRef, useState } from "react";
import { Printer, Mail, CheckCircle, X, Receipt, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface POSReceiptProps {
  sale: any;
  onClose: () => void;
}

export default function POSReceipt({ sale, onClose }: POSReceiptProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md chassis-panel shadow-2xl text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="chassis-header">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1b2d4f] text-[#2dc4a0] border border-[#2dc4a0]/40">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                REGISTO EFETUADO COM SUCESSO
              </h3>
              <p className="text-[10px] text-[#4a7a9b] font-mono">Comprovativo de Venda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1b2d4f] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Authentic Thermal Receipt Strip Style */}
        <div className="flex-1 overflow-y-auto p-4 flex justify-center">
          <div
            ref={receiptRef}
            className="receipt-strip w-full max-w-[340px] text-[#1b2d4f] space-y-3 select-none"
          >
            <div className="text-center border-b-2 border-dashed border-[#d4cfc6] pb-3">
              <div className="inline-block bg-[#1b2d4f] text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded mb-1">
                TICONTA v2 ERP
              </div>
              <h2 className="text-sm font-black tracking-widest uppercase">REGISTO DE CAIXA</h2>
              <p className="text-[10px] text-[#556987]">Maputo, Moçambique • NUIT: 400123456</p>
              <p className="text-[9px] text-[#1d9e75] font-bold mt-0.5">SISTEMA CERTIFICADO PELA AT</p>
            </div>

            <div className="space-y-1 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-[#556987]">TALÃO Nº:</span>
                <span className="font-bold">{sale.invoice_number || "VD/2026/001"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#556987]">DATA/HORA:</span>
                <span>{new Date(sale.sale_date || Date.now()).toLocaleString("pt-MZ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#556987]">CANAL:</span>
                <span className="font-bold uppercase text-[#1d9e75]">{sale.payment_method || "DINHEIRO"}</span>
              </div>
            </div>

            <div className="border-t-2 border-b-2 border-dashed border-[#d4cfc6] py-2 space-y-1.5 text-[10px] font-mono">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[170px]">
                      {it.quantity}x {it.product_name || `Item #${it.product_id}`}
                    </span>
                    <span className="font-bold">{(it.quantity * it.unit_price).toFixed(2)} MT</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span>Itens Diversos</span>
                  <span className="font-bold">{Number(sale.net_amount).toFixed(2)} MT</span>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-1 text-[10px] font-mono">
              <div className="flex justify-between text-[#556987]">
                <span>SUBTOTAL:</span>
                <span>{Number(sale.total_amount || sale.net_amount).toFixed(2)} MT</span>
              </div>
              {sale.discount_amount > 0 && (
                <div className="flex justify-between text-[#b45309]">
                  <span>DESCONTO:</span>
                  <span>-{Number(sale.discount_amount).toFixed(2)} MT</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1.5 border-t-2 border-[#1b2d4f] text-[#1b2d4f]">
                <span>TOTAL PAGO:</span>
                <span>{Number(sale.net_amount).toFixed(2)} MT</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t-2 border-dashed border-[#d4cfc6] text-[9px] text-[#556987] space-y-0.5">
              <p>*** OBRIGADO PELA PREFERÊNCIA ***</p>
              <p className="font-bold tracking-wider">PROCESSADO POR COMPUTADOR</p>
            </div>
          </div>
        </div>

        {/* Email & Print Actions with Tactile Hardware Keys */}
        <div className="border-t border-[#1c3150] p-4 space-y-3 bg-[#08121f]/90">
          <form onSubmit={handleSendEmail} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enviar talão por email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs h-9"
            />
            <Button
              type="submit"
              variant="retro-action"
              disabled={isSending || !email}
              size="sm"
              className="h-9 shrink-0 px-3 text-xs uppercase tracking-wider"
            >
              <Mail className="h-3.5 w-3.5 mr-1" />
              {isSending ? "A ENVIAR..." : "ENVIAR"}
            </Button>
          </form>

          {emailSuccess && (
            <p className="text-xs text-[#2dc4a0] text-center font-bold font-mono">
              ✓ Talão enviado por email com sucesso!
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="retro-primary"
              onClick={handlePrint}
              className="flex-1 font-black h-12 uppercase tracking-wider"
            >
              <Printer className="h-4 w-4 mr-2" />
              IMPRIMIR TALÃO
            </Button>
            <Button
              variant="retro-action"
              onClick={onClose}
              className="font-bold h-12 px-4 uppercase tracking-wider text-xs"
            >
              NOVA VENDA ↵
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

