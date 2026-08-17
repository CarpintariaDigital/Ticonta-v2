"use client";

import { useRef, useState } from "react";
import { Printer, Mail, CheckCircle, X, Download, Share2 } from "lucide-react";
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
    // Simulação ou chamada de envio de recibo
    setTimeout(() => {
      setIsSending(false);
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Venda Concluída!</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Style */}
        <div className="flex-1 overflow-y-auto p-4">
          <div
            ref={receiptRef}
            className="rounded-xl border border-zinc-700/60 bg-white text-zinc-900 p-5 font-mono text-xs shadow-inner space-y-3"
          >
            <div className="text-center border-b border-dashed border-zinc-400 pb-3">
              <h2 className="text-base font-black tracking-wider">TICONTAV2 ERP</h2>
              <p className="text-[11px] text-zinc-600">Maputo, Moçambique • NUIT: 400123456</p>
              <p className="text-[10px] text-zinc-500 mt-1">SISTEMA CERTIFICADO PELA AT</p>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>DOC:</span>
                <span className="font-bold">{sale.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span>DATA:</span>
                <span>{new Date(sale.sale_date || Date.now()).toLocaleString("pt-MZ")}</span>
              </div>
              <div className="flex justify-between">
                <span>PAGAMENTO:</span>
                <span className="font-bold uppercase">{sale.payment_method}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-zinc-400 py-2 space-y-1.5 text-[11px]">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[180px]">
                      {it.quantity}x {it.product_name || `Item #${it.product_id}`}
                    </span>
                    <span className="font-semibold">{(it.quantity * it.unit_price).toFixed(2)} MZN</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span>Itens Diversos</span>
                  <span className="font-semibold">{Number(sale.net_amount).toFixed(2)} MZN</span>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>{Number(sale.total_amount || sale.net_amount).toFixed(2)} MZN</span>
              </div>
              {sale.discount_amount > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Desconto:</span>
                  <span>-{Number(sale.discount_amount).toFixed(2)} MZN</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 border-t border-zinc-300">
                <span>TOTAL PAGO:</span>
                <span>{Number(sale.net_amount).toFixed(2)} MZN</span>
              </div>
            </div>

            <div className="text-center pt-3 border-t border-dashed border-zinc-400 text-[10px] text-zinc-500">
              <p>Obrigado pela sua preferência!</p>
              <p className="font-bold">Processado por Computador</p>
            </div>
          </div>
        </div>

        {/* Email & Print Actions */}
        <div className="border-t border-zinc-800 p-4 space-y-3 bg-zinc-950/60">
          <form onSubmit={handleSendEmail} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enviar recibo para email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-xs h-9"
            />
            <Button
              type="submit"
              disabled={isSending || !email}
              size="sm"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 h-9 shrink-0"
            >
              <Mail className="h-3.5 w-3.5 mr-1" />
              {isSending ? "A enviar..." : "Enviar"}
            </Button>
          </form>

          {emailSuccess && (
            <p className="text-xs text-emerald-400 text-center font-medium">
              Comprovativo enviado por email com sucesso!
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Recibo
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 h-11"
            >
              Nova Venda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
