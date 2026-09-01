"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Smartphone, Mail, CheckCircle2, AlertCircle, Loader2, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useDocumentDelivery } from "@/hooks/useDocumentDelivery";
import { DeliveryMethod } from "@/services/document_delivery";

interface DocumentDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  documentType?: "invoice" | "receipt" | "quote" | "purchase_order";
  documentNumber?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  customerKey?: string;
}

export const DocumentDeliveryModal: React.FC<DocumentDeliveryModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentType = "receipt",
  documentNumber,
  defaultPhone = "",
  defaultEmail = "",
  customerKey,
}) => {
  const { savedContact, sendViaWhatsApp, sendViaSMS, sendViaEmail, saveContact, isLoading, error, clearError } =
    useDocumentDelivery(customerKey);

  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod>("whatsapp");
  const [phone, setPhone] = useState(savedContact?.phone || defaultPhone);
  const [email, setEmail] = useState(savedContact?.email || defaultEmail);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (savedContact) {
      if (savedContact.phone) setPhone(savedContact.phone);
      if (savedContact.email) setEmail(savedContact.email);
    }
  }, [savedContact]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    try {
      if (selectedMethod === "whatsapp") {
        if (!phone) return;
        await sendViaWhatsApp(documentId, phone.trim(), documentType);
        setSuccessMessage("✅ Enviado com sucesso via WhatsApp!");
      } else if (selectedMethod === "sms") {
        if (!phone) return;
        await sendViaSMS(documentId, phone.trim(), documentType);
        setSuccessMessage("✅ Link enviado com sucesso via SMS!");
      } else if (selectedMethod === "email") {
        if (!email) return;
        await sendViaEmail(documentId, email.trim(), documentType);
        setSuccessMessage("✅ Documento enviado com sucesso por Email!");
      }

      if (saveForFuture && customerKey) {
        saveContact(customerKey, { phone: phone.trim(), email: email.trim() });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Erro manipulado pela store
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md border-zinc-200 bg-zinc-50 text-zinc-900 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="space-y-1.5 pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-400" />
            Enviar {documentType === "receipt" ? "Recibo" : documentType === "invoice" ? "Fatura" : "Documento"}?
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            {documentNumber ? `Documento: ${documentNumber}` : "Envie a 2ª via digital diretamente ao cliente"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSend}>
          <CardContent className="space-y-4">
            {/* Método de Envio */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod("whatsapp")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedMethod === "whatsapp"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-200 bg-white text-zinc-500 hover:text-white"
                }`}
              >
                <MessageSquare className="h-5 w-5 mb-1 text-emerald-400" />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("sms")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedMethod === "sms"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-200 bg-white text-zinc-500 hover:text-white"
                }`}
              >
                <Smartphone className="h-5 w-5 mb-1 text-blue-400" />
                SMS
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("email")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedMethod === "email"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-200 bg-white text-zinc-500 hover:text-white"
                }`}
              >
                <Mail className="h-5 w-5 mb-1 text-amber-400" />
                Email
              </button>
            </div>

            {/* Input Dinâmico */}
            {selectedMethod !== "email" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 uppercase">
                  Número de Telemóvel (+258)
                </label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 84 123 4567"
                  className="bg-white border-zinc-200 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 uppercase">
                  Endereço de Email
                </label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@empresa.co.mz"
                  className="bg-white border-zinc-200 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Checkbox Salvar Contacto */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="saveContact"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-200 bg-white text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="saveContact" className="text-xs text-zinc-500 cursor-pointer">
                Guardar contacto para próximas vendas
              </label>
            </div>

            {/* Mensagens de Feedback */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2 pt-2 border-t border-zinc-200/80">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-200 bg-white text-zinc-700 hover:text-white"
            >
              Agora Não
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (selectedMethod !== "email" ? !phone.trim() : !email.trim())}
              className="bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                "Enviar Documento"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
