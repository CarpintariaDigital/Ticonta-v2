"use client";

import React, { useState } from "react";
import {
  X,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  Building,
  Mail,
  Calendar,
  ShieldCheck,
  Send,
  Sliders,
  DollarSign,
} from "lucide-react";
import { GenerateLicensePayload } from "@/services/admin_licensing";

interface GenerateLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: GenerateLicensePayload) => Promise<any>;
  isGenerating?: boolean;
}

const AVAILABLE_MODULE_OPTIONS = [
  { id: "pos", name: "Ponto de Venda (POS & WhatsApp)", defaultPrice: 500 },
  { id: "informal", name: "Vendas Informais & Fiado", defaultPrice: 300 },
  { id: "xitique", name: "Xitique (Rotativo & Mercadorias)", defaultPrice: 350 },
  { id: "savings", name: "Poupança Comunitária (ASCAS)", defaultPrice: 350 },
  { id: "accounting", name: "Contabilidade PGC-NIRF", defaultPrice: 1000 },
  { id: "restaurant", name: "Restaurante, Mesas & KDS", defaultPrice: 800 },
  { id: "takeaway", name: "Takeaway & Entregas", defaultPrice: 400 },
  { id: "auto_services", name: "Oficina & Serviços Auto", defaultPrice: 800 },
  { id: "poultry", name: "Produção Avícola & Ovos", defaultPrice: 500 },
  { id: "manufacturing", name: "Fabrico & Marcenaria", defaultPrice: 700 },
  { id: "projects", name: "Obras & Gestão de Projetos", defaultPrice: 900 },
  { id: "crm", name: "Gestão de Clientes (CRM)", defaultPrice: 300 },
  { id: "hr", name: "Recursos Humanos & INSS", defaultPrice: 500 },
  { id: "reports", name: "Relatórios Avançados & BI", defaultPrice: 400 },
];

export const GenerateLicenseModal: React.FC<GenerateLicenseModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [planMode, setPlanMode] = useState<"preset" | "custom">("preset");
  const [plan, setPlan] = useState("complete");
  const [days, setDays] = useState(365);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Custom Modular Selection & Pricing
  const [selectedModules, setSelectedModules] = useState<string[]>([
    "pos",
    "informal",
    "xitique",
    "savings",
    "accounting",
  ]);
  const [modulePrices, setModulePrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    AVAILABLE_MODULE_OPTIONS.forEach((m) => {
      initial[m.id] = m.defaultPrice;
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleToggleModule = (modId: string) => {
    if (selectedModules.includes(modId)) {
      setSelectedModules(selectedModules.filter((id) => id !== modId));
    } else {
      setSelectedModules([...selectedModules, modId]);
    }
  };

  const handleModulePriceChange = (modId: string, price: number) => {
    setModulePrices({ ...modulePrices, [modId]: price });
  };

  // Calculate total monthly custom price
  const customMonthlyTotal = selectedModules.reduce(
    (sum, id) => sum + (modulePrices[id] || 0),
    0
  );
  const months = Math.max(1, Math.round(days / 30));
  const customTotalPeriodPrice = customMonthlyTotal * months;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const payload: GenerateLicensePayload = {
        customer_name: customerName,
        customer_email: customerEmail || undefined,
        plan: planMode === "custom" ? "custom" : plan,
        days: Number(days),
        modules: planMode === "custom" ? selectedModules : undefined,
        custom_price_mzn: planMode === "custom" ? customMonthlyTotal : undefined,
      };

      const res = await onGenerate(payload);
      setGeneratedResult(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Erro ao gerar chave de licença.");
    }
  };

  const handleCopy = () => {
    if (generatedResult?.license_key) {
      navigator.clipboard.writeText(generatedResult.license_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!generatedResult) return "";
    const key = generatedResult.license_key;
    const clientName = customerName || "Estimado(a) Cliente";
    const validDays = days;
    const planName =
      planMode === "custom"
        ? `Personalizado (${selectedModules.length} módulos)`
        : plan === "basic"
        ? "BÁSICO"
        : plan === "professional"
        ? "PROFISSIONAL"
        : "COMPLETO";

    const modulesListText =
      generatedResult.modules && generatedResult.modules.length > 0
        ? generatedResult.modules.map((m: string) => `  ✓ ${m.toUpperCase()}`).join("\n")
        : "  ✓ Todos os Módulos Oficiais TiConta";

    const priceText =
      planMode === "custom"
        ? `${customTotalPeriodPrice.toLocaleString("pt-MZ")} MT (${customMonthlyTotal.toLocaleString("pt-MZ")} MT/mês)`
        : plan === "basic"
        ? `${(500 * months).toLocaleString("pt-MZ")} MT`
        : plan === "professional"
        ? `${(1500 * months).toLocaleString("pt-MZ")} MT`
        : `${(3500 * months).toLocaleString("pt-MZ")} MT`;

    return `🔑 *TICONTA v2 ERP — CHAVE OFICIAL DE ATIVAÇÃO*
━━━━━━━━━━━━━━━━━━━━
🏢 *Empresa:* ${clientName}
📦 *Plano:* ${planName}
📅 *Validade:* ${validDays} Dias (${months} Mês/Meses)
💰 *Valor Contratado:* ${priceText}
━━━━━━━━━━━━━━━━━━━━
🧩 *MÓDULOS LIBERADOS:*
${modulesListText}
━━━━━━━━━━━━━━━━━━━━
🔐 *CHAVE DE ATIVAÇÃO:*
\`${key}\`
━━━━━━━━━━━━━━━━━━━━
📋 *Instruções de Ativação:*
1. Abra o TiConta ERP no navegador ou App PWA
2. Aceda a *Definições > Licenciamento* (ou no aviso inicial)
3. Cole a sua chave no campo e clique em *Ativar Licença*

Suporte Carpintaria Digital: +258 84 000 0000`;
  };

  const handleSendWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("258")
      ? cleanPhone
      : cleanPhone.length === 9
      ? `258${cleanPhone}`
      : cleanPhone;

    const url = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setPlan("complete");
    setDays(365);
    setGeneratedResult(null);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Emitir Chave de Licença Comercial</h2>
              <p className="text-xs text-slate-400">Planos predefinidos ou módulos selecionados com preços à medida</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-medium shrink-0">
            {errorMsg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-3">
          {!generatedResult ? (
            /* Formulário de Emissão */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Nome da Empresa / Cliente *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="ex: Mercearia Boa Esperança Lda"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    WhatsApp do Cliente (Para Envio da Chave)
                  </label>
                  <input
                    type="tel"
                    placeholder="ex: 841234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email do Cliente (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@empresa.co.mz"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              {/* Mode Switcher: Preset Tier vs Custom Modular Pricing */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block font-semibold text-slate-300 uppercase tracking-wider">
                  Modalidade de Licenciamento & Preços
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanMode("preset")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      planMode === "preset"
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Planos Predefinidos (Básico / Pro / Completo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanMode("custom")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                      planMode === "custom"
                        ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Módulos à Escolha & Preço por Módulo
                  </button>
                </div>
              </div>

              {planMode === "preset" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Plano Fixo *
                    </label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100"
                    >
                      <option value="basic">BÁSICO (500 MT/mês) — POS & Informal</option>
                      <option value="professional">PROFISSIONAL (1.500 MT/mês) — POS, PGC, CRM, BI</option>
                      <option value="complete">COMPLETO (3.500 MT/mês) — Todos os Módulos</option>
                      <option value="enterprise">ENTERPRISE (7.500 MT/mês) — Multi-lojas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Validade do Contrato *
                    </label>
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100"
                    >
                      <option value={30}>30 Dias (1 Mês)</option>
                      <option value={90}>90 Dias (3 Meses)</option>
                      <option value={180}>180 Dias (Semestral)</option>
                      <option value={365}>365 Dias (1 Ano)</option>
                      <option value={730}>730 Dias (2 Anos)</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* Custom Modular Checklist & Price Inputs */
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-400 block text-xs">
                        Selecione os Módulos & Defina o Preço de Cada Módulo (MT/mês):
                      </span>
                      <p className="text-[10px] text-slate-400">
                        O valor total é somado e calculado proporcionalmente ao período escolhido.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Subtotal Mensal:</span>
                      <div className="text-sm font-black text-emerald-400 font-mono">
                        {customMonthlyTotal.toLocaleString("pt-MZ")} MT/mês
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {AVAILABLE_MODULE_OPTIONS.map((mod) => {
                      const isSelected = selectedModules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                              : "bg-slate-900/80 border-slate-800 text-slate-400"
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleModule(mod.id)}
                              className="rounded border-slate-700 bg-slate-950 text-emerald-500"
                            />
                            <span className="truncate text-[11px] font-bold">{mod.name}</span>
                          </label>

                          <div className="w-20 shrink-0">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={modulePrices[mod.id] || 0}
                              onChange={(e) => handleModulePriceChange(mod.id, Number(e.target.value))}
                              disabled={!isSelected}
                              className="w-full px-1.5 py-1 text-[11px] bg-slate-950 border border-slate-700 rounded text-right text-white font-mono disabled:opacity-30"
                              title="Preço mensal em MT"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <label className="text-slate-400 text-xs">Período:</label>
                      <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                      >
                        <option value={30}>1 Mês (30 dias)</option>
                        <option value={90}>3 Meses (90 dias)</option>
                        <option value={180}>6 Meses (180 dias)</option>
                        <option value={365}>1 Ano (365 dias)</option>
                      </select>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Total a Cobrar ao Cliente:</span>
                      <div className="text-base font-black text-white font-mono">
                        {customTotalPeriodPrice.toLocaleString("pt-MZ")}{" "}
                        <span className="text-xs text-emerald-400">MT</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? "A gerar..." : "Gerar Chave de Licença"}
                </button>
              </div>
            </form>
          ) : (
            /* Resultado da Emissão */
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <ShieldCheck className="w-5 h-5" />
                  Chave Criptográfica Gerada com Sucesso!
                </div>
                <p className="text-[11px] text-slate-400">
                  Licença configurada e registada com os módulos escolhidos.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                  Chave de Ativação (HMAC-SHA256)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedResult.license_key}
                    className="w-full px-3 py-2.5 bg-slate-950 font-mono text-sm text-emerald-300 font-bold border border-slate-700 rounded-xl select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl shrink-0"
                    title="Copiar Chave"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Finish */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                  Envio Imediato ao Cliente
                </span>
                <p className="text-[11px] text-slate-300">
                  Envie a mensagem oficial pré-formatada com as credenciais e a lista de módulos licenciados diretamente para o WhatsApp do cliente.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Chave via WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
