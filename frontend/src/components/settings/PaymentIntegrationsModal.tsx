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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Integração de Pagamentos Moçambique
              </h2>
              <p className="text-xs text-slate-400">
                M-Pesa (Vodacom), e-Mola (Movitel) e Terminais Bancários POS TPA (SIMOrede / Bancos)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <button
            onClick={() => setActiveTab("mpesa")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === "mpesa"
                ? "bg-red-500/10 border-red-500/50 text-red-400 font-bold shadow-md"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-5 h-5 text-red-400" />
            <span className="text-xs">M-Pesa (Vodacom)</span>
          </button>

          <button
            onClick={() => setActiveTab("emola")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === "emola"
                ? "bg-amber-500/10 border-amber-500/50 text-amber-400 font-bold shadow-md"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-5 h-5 text-amber-400" />
            <span className="text-xs">e-Mola (Movitel)</span>
          </button>

          <button
            onClick={() => setActiveTab("pos")}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === "pos"
                ? "bg-blue-500/10 border-blue-500/50 text-blue-400 font-bold shadow-md"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-5 h-5 text-blue-400" />
            <span className="text-xs">Terminais POS TPA</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Configurações de pagamento guardadas com sucesso!
          </div>
        )}

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 text-xs">
          {/* M-PESA TAB */}
          {activeTab === "mpesa" && (
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-200">
                <span className="font-bold block text-sm">Como funciona o M-Pesa no TiConta:</span>
                <p className="text-[11px] text-slate-300 mt-1">
                  1. **STK Push Automático**: Ao selecionar M-Pesa no POS, o cliente recebe uma notificação instantânea no telemóvel para inserir o seu PIN M-Pesa.<br />
                  2. **QR Code Estático**: O POS gera o QR Code no ecrã para o cliente ler com a App M-Pesa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shortcode / Número de Negócio *</label>
                  <Input
                    required
                    value={mpesaShortcode}
                    onChange={(e) => setMpesaShortcode(e.target.value)}
                    placeholder="ex: 171717"
                    className="bg-slate-900 border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome do Iniciador *</label>
                  <Input
                    required
                    value={mpesaInitiatorName}
                    onChange={(e) => setMpesaInitiatorName(e.target.value)}
                    placeholder="ex: TICONTA_MERCHANT"
                    className="bg-slate-900 border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">API Key / Chave Secreta Vodacom Open API</label>
                <Input
                  type="password"
                  value={mpesaApiKey}
                  onChange={(e) => setMpesaApiKey(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white font-mono"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={mpesaAutoPrompt}
                  onChange={(e) => setMpesaAutoPrompt(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <span>Enviar Notificação Push USSD direta para o telemóvel do cliente ao fechar a venda</span>
              </label>
            </div>
          )}

          {/* E-MOLA TAB */}
          {activeTab === "emola" && (
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
                <span className="font-bold block text-sm">Como funciona o e-Mola (Movitel):</span>
                <p className="text-[11px] text-slate-300 mt-1">
                  Permite pagamentos diretos da carteira móvel e-Mola através do Merchant Code da sua loja ou por push no telemóvel do comprador.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Código de Comerciante / Telefone e-Mola *</label>
                  <Input
                    required
                    value={emolaMerchantCode}
                    onChange={(e) => setEmolaMerchantCode(e.target.value)}
                    placeholder="ex: 861234567 ou 99012"
                    className="bg-slate-900 border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Token de API Movitel</label>
                  <Input
                    type="password"
                    value={emolaApiToken}
                    onChange={(e) => setEmolaApiToken(e.target.value)}
                    placeholder="Token secreto"
                    className="bg-slate-900 border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={emolaAutoPrompt}
                  onChange={(e) => setEmolaAutoPrompt(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <span>Habilitar conciliação instantânea de pagamentos e-Mola</span>
              </label>
            </div>
          )}

          {/* POS TPA TAB */}
          {activeTab === "pos" && (
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-200">
                <span className="font-bold block text-sm">Terminais Físicos de Cartão (SIMO / Bancos):</span>
                <p className="text-[11px] text-slate-300 mt-1">
                  Ao cobrar com a maquineta do banco (BIM, BCI, Standard Bank, Moza, Absa), o operador pode introduzir o **Nº de Autorização / Referência do Talão** do TPA para a conciliação bancária no fecho de caixa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rede / Banco Provedor do TPA</label>
                  <select
                    value={bankProvider}
                    onChange={(e) => setBankProvider(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
                  >
                    <option value="SIMOrede">SIMOrede (Multi-Banco Moçambique)</option>
                    <option value="Millennium BIM">Millennium BIM</option>
                    <option value="BCI">BCI</option>
                    <option value="Standard Bank">Standard Bank MZ</option>
                    <option value="Moza Banco">Moza Banco</option>
                    <option value="Absa Bank">Absa Bank Moçambique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nº de Série do Terminal / TID</label>
                  <Input
                    value={terminalSerialNumber}
                    onChange={(e) => setTerminalSerialNumber(e.target.value)}
                    placeholder="ex: TID-BIM-88412"
                    className="bg-slate-900 border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={requireAuthCode}
                  onChange={(e) => setRequireAuthCode(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500"
                />
                <span>Solicitar código de autorização do talão para conciliação no fecho de turno</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
              Fechar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950">
              <Save className="w-4 h-4" />
              Guardar Configurações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
