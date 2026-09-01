"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  QrCode,
  ShieldCheck,
  Building,
  Save,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentIntegrationsModal: React.FC<PaymentIntegrationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"mpesa" | "emola" | "pos">("mpesa");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // M-Pesa state
  const [mpesaShortcode, setMpesaShortcode] = useState("171717");
  const [mpesaApiKey, setMpesaApiKey] = useState("live_sec_mpesa_mz_2026");
  const [mpesaInitiatorName, setMpesaInitiatorName] = useState("TICONTA_MERCHANT");
  const [mpesaSecurityCredential, setMpesaSecurityCredential] = useState("••••••••••••••••");
  const [mpesaAutoPrompt, setMpesaAutoPrompt] = useState(true);

  // e-Mola state
  const [emolaMerchantCode, setEmolaMerchantCode] = useState("861234567");
  const [emolaApiToken, setEmolaApiToken] = useState("emola_tok_991823");
  const [emolaAutoPrompt, setEmolaAutoPrompt] = useState(true);

  // Bank POS (TPA) State
  const [bankProvider, setBankProvider] = useState("SIMOrede");
  const [terminalSerialNumber, setTerminalSerialNumber] = useState("POS-TPA-98214");
  const [requireAuthCode, setRequireAuthCode] = useState(true);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                Integração de Pagamentos Moçambique
              </h2>
              <p className="text-xs text-zinc-500">
                M-Pesa (Vodacom), e-Mola (Movitel) e Terminais Bancários POS TPA (SIMOrede / Bancos)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-700 rounded-full hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <button
            onClick={() => setActiveTab("mpesa")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === "mpesa"
                ? "bg-red-50 border-red-300 text-red-700 font-bold shadow-xs"
                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <Smartphone className="w-5 h-5 text-red-600" />
            <span className="text-xs">M-Pesa (Vodacom)</span>
          </button>

          <button
            onClick={() => setActiveTab("emola")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === "emola"
                ? "bg-amber-50 border-amber-300 text-amber-700 font-bold shadow-xs"
                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <Smartphone className="w-5 h-5 text-amber-600" />
            <span className="text-xs">e-Mola (Movitel)</span>
          </button>

          <button
            onClick={() => setActiveTab("pos")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === "pos"
                ? "bg-blue-50 border-blue-300 text-blue-700 font-bold shadow-xs"
                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-xs">POS TPA / Cartão</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {savedSuccess && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configurações de pagamento atualizadas e validadas com sucesso!</span>
            </div>
          )}

          {activeTab === "mpesa" && (
            <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900">API C2B & STK Push M-Pesa Vodacom MZ</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Ligação Ativa
                </span>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Shortcode / Número de Negócio *</label>
                <Input
                  value={mpesaShortcode}
                  onChange={(e) => setMpesaShortcode(e.target.value)}
                  className="bg-white border-zinc-300 font-mono text-zinc-900"
                  placeholder="ex: 171717"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">API Key / Consumer Secret</label>
                <Input
                  type="password"
                  value={mpesaApiKey}
                  onChange={(e) => setMpesaApiKey(e.target.value)}
                  className="bg-white border-zinc-300 font-mono text-zinc-900"
                  placeholder="live_sec_..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Nome do Iniciador</label>
                  <Input
                    value={mpesaInitiatorName}
                    onChange={(e) => setMpesaInitiatorName(e.target.value)}
                    className="bg-white border-zinc-300 font-mono text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-semibold mb-1">Senha de Segurança</label>
                  <Input
                    type="password"
                    value={mpesaSecurityCredential}
                    onChange={(e) => setMpesaSecurityCredential(e.target.value)}
                    className="bg-white border-zinc-300 font-mono text-zinc-900"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={mpesaAutoPrompt}
                  onChange={(e) => setMpesaAutoPrompt(e.target.checked)}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-zinc-700">
                  Enviar notificação automática de PIN no telemóvel do cliente (STK Push) ao fechar venda
                </span>
              </label>
            </div>
          )}

          {activeTab === "emola" && (
            <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900">Integração Direta e-Mola Movitel</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  Ligação Ativa
                </span>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Código de Comerciante / Agente *</label>
                <Input
                  value={emolaMerchantCode}
                  onChange={(e) => setEmolaMerchantCode(e.target.value)}
                  className="bg-white border-zinc-300 font-mono text-zinc-900"
                  placeholder="ex: 861234567"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Token de Acesso / Bearer Key</label>
                <Input
                  type="password"
                  value={emolaApiToken}
                  onChange={(e) => setEmolaApiToken(e.target.value)}
                  className="bg-white border-zinc-300 font-mono text-zinc-900"
                  placeholder="emola_tok_..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={emolaAutoPrompt}
                  onChange={(e) => setEmolaAutoPrompt(e.target.checked)}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-zinc-700">
                  Validar confirmação instantânea via webhook e-Mola
                </span>
              </label>
            </div>
          )}

          {activeTab === "pos" && (
            <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900">Terminais TPA / SIMOrede Moçambique</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">
                  Pronto
                </span>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Rede Bancária / Fornecedor</label>
                <select
                  value={bankProvider}
                  onChange={(e) => setBankProvider(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 text-xs"
                >
                  <option value="SIMOrede">SIMOrede (BIM / Standard Bank / BCI / Moza)</option>
                  <option value="Absa">Absa Bank POS Direct</option>
                  <option value="FNB">FNB Speedpoint</option>
                  <option value="Manual">Lançamento de TPA Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-semibold mb-1">Número de Série do Terminal</label>
                <Input
                  value={terminalSerialNumber}
                  onChange={(e) => setTerminalSerialNumber(e.target.value)}
                  className="bg-white border-zinc-300 font-mono text-zinc-900"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={requireAuthCode}
                  onChange={(e) => setRequireAuthCode(e.target.checked)}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-zinc-700">
                  Exigir código de autorização do talão para conciliação no fecho de caixa
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={onClose} className="border-zinc-300">
              Fechar
            </Button>
            <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 rounded-xl shadow-xs">
              <Save className="w-4 h-4" />
              <span>Guardar Configurações</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
