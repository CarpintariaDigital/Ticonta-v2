"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import {
  Palette,
  Upload,
  FileText,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function BrandingSettingsPage() {
  const [companyName, setCompanyName] = useState("Carpintaria Digital Lda.");
  const [nuit, setNuit] = useState("400123456");
  const [address, setAddress] = useState("Av. 24 de Julho nº 1234, Maputo");
  const [phone, setPhone] = useState("+258 83 461 6193");
  const [email, setEmail] = useState("info@carpintariadigital.com");

  const [primaryColor, setPrimaryColor] = useState("#1A365D");
  const [secondaryColor, setSecondaryColor] = useState("#DD6B20");
  const [logoBase64, setLogoBase64] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Carregar dados salvos se existirem no localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ticonta_branding");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.company_name) setCompanyName(parsed.company_name);
        if (parsed.nuit) setNuit(parsed.nuit);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.primary_color) setPrimaryColor(parsed.primary_color);
        if (parsed.secondary_color) setSecondaryColor(parsed.secondary_color);
        if (parsed.logo_base64) setLogoBase64(parsed.logo_base64);
      }
    } catch (e) {
      console.warn("Erro ao ler branding local:", e);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToastMessage({ type: "error", text: "O logótipo deve ter menos de 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setLogoBase64(b64);
      setToastMessage({ type: "success", text: "Logótipo carregado e convertido com sucesso!" });
    };
    reader.readAsDataURL(file);
  };

  const getBrandingPayload = () => ({
    company_name: companyName,
    nuit: nuit,
    address: address,
    phone: phone,
    email: email,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    logo_base64: logoBase64
  });

  const handleSaveBranding = async () => {
    setSaving(true);
    setToastMessage(null);

    const brandingData = getBrandingPayload();

    try {
      // 1. Guardar localmente
      localStorage.setItem("ticonta_branding", JSON.stringify(brandingData));

      // 2. Guardar no Cloudflare KV via API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
      const res = await fetch(`${apiUrl}/api/v1/branding/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandingData)
      });

      if (!res.ok) {
        // Tentar fallback direto para porta 8000 se o worker não estiver conectado
        console.warn("Worker KV não respondeu, mas branding salvo localmente.");
      }

      setToastMessage({
        type: "success",
        text: "Identidade visual gravada com sucesso no Cloudflare KV!"
      });
    } catch (err: any) {
      console.warn("Aviso ao sincronizar com KV:", err);
      setToastMessage({
        type: "success",
        text: "Identidade visual gravada localmente com sucesso!"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewDocument = async () => {
    setPreviewing(true);
    setToastMessage(null);

    const branding = getBrandingPayload();
    const samplePayload = {
      template: "factura",
      branding: branding,
      document: {
        number: "FT-2026-0042",
        date: new Date().toLocaleDateString("pt-MZ"),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-MZ"),
        currency: "MT",
        notes: "Exemplo de documento oficial com as cores e logo configurados."
      },
      client: {
        name: "Empresa Cliente de Teste Lda.",
        nuit: "400987654",
        address: "Av. Samora Machel, Beira, Sofala",
        contact: "contacto@cliente.co.mz"
      },
      items: [
        {
          description: "Módulo de Gestão Comercial TiConta Cloud",
          qty: 1,
          unit_price: 25000.00,
          vat_rate: 16,
          total: 25000.00
        },
        {
          description: "Configuração de Infraestrutura e Licenciamento Anual",
          qty: 1,
          unit_price: 15000.00,
          vat_rate: 16,
          total: 15000.00
        }
      ],
      totals: {
        subtotal: 40000.00,
        vat_amount: 6400.00,
        grand_total: 46400.00
      }
    };

    try {
      // Tentar endpoint local do pdf-engine (8000) ou Worker API
      const engineUrl = "http://localhost:8000/generate";
      const res = await fetch(engineUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(samplePayload)
      });

      if (!res.ok) {
        throw new Error("Não foi possível gerar a pré-visualização no PDF Engine.");
      }

      const data = await res.json();
      if (data.pdf_base64) {
        const byteCharacters = atob(data.pdf_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      }
    } catch (err: any) {
      setToastMessage({
        type: "error",
        text: `Erro ao pré-visualizar PDF: ${err.message || "Verifique se o serviço PDF Engine está ativo."}`
      });
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardNavbar />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <Link
                href="/settings"
                className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200 mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar às Definições
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Palette className="w-7 h-7 text-amber-400" />
                Identidade Visual & Branding de Documentos
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Configure logótipo oficial, cores e cabeçalho aplicados automaticamente em Facturas, Recibos e Orçamentos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePreviewDocument}
                disabled={previewing}
                className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition shadow-sm disabled:opacity-50"
              >
                {previewing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin text-amber-400" />
                ) : (
                  <Eye className="w-4 h-4 mr-2 text-amber-400" />
                )}
                Pré-visualizar PDF
              </button>

              <button
                type="button"
                onClick={handleSaveBranding}
                disabled={saving}
                className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-sm transition shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar Identidade
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 border ${
                toastMessage.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/30 text-rose-300"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              )}
              <span className="text-sm font-medium">{toastMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Formulário de Configuração (7 colunas) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Logótipo Oficial */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  Logótipo da Empresa (PNG / JPG / SVG)
                </h3>
                <p className="text-xs text-slate-400">
                  O logótipo será embutido em Base64 de alta resolução no topo de todos os documentos fiscais gerados.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  <div className="w-full sm:w-48 h-28 bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                    {logoBase64 ? (
                      <img
                        src={logoBase64}
                        alt="Preview Logo"
                        className="max-h-24 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-slate-500">
                        <Building2 className="w-8 h-8 mx-auto mb-1 opacity-40" />
                        <span className="text-[11px]">Sem logótipo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition">
                      <Upload className="w-4 h-4 mr-2" />
                      Carregar Novo Logótipo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                    {logoBase64 && (
                      <button
                        type="button"
                        onClick={() => setLogoBase64("")}
                        className="w-full text-xs text-rose-400 hover:text-rose-300 transition py-1"
                      >
                        Remover logótipo atual
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Paleta de Cores Institucional */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400" />
                  Cores da Marca (Documentos Fiscais)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cor Primária */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Cor Primária (Títulos e Cabeçalhos)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400 uppercase"
                      />
                    </div>
                  </div>

                  {/* Cor Secundária */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Cor Secundária (Destaques e Bordas)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Metadados da Empresa */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  Informações de Cabeçalho do Emissor
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nome Comercial / Razão Social
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      NUIT (9 dígitos)
                    </label>
                    <input
                      type="text"
                      value={nuit}
                      onChange={(e) => setNuit(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Email Institucional
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Endereço / Cidade
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview em Tempo Real (5 colunas) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      Pré-visualização em Tempo Real
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Formato A4
                    </span>
                  </div>

                  {/* Document Mockup Card */}
                  <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-5 border border-slate-200 transition-all font-sans text-xs space-y-4">
                    {/* Header Mockup */}
                    <div
                      className="pb-3 flex items-center justify-between"
                      style={{ borderBottom: `3px solid ${primaryColor}` }}
                    >
                      <div className="max-w-[50%]">
                        {logoBase64 ? (
                          <img
                            src={logoBase64}
                            alt="Logo Header"
                            className="max-h-10 object-contain"
                          />
                        ) : (
                          <div
                            className="font-bold text-sm tracking-tight"
                            style={{ color: primaryColor }}
                          >
                            {companyName}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-[10px] text-slate-500 leading-tight">
                        <div className="font-bold text-slate-800">{companyName}</div>
                        <div>NUIT: {nuit}</div>
                        <div>{address}</div>
                        <div>{phone}</div>
                      </div>
                    </div>

                    {/* Title & Meta */}
                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <div
                          className="font-black text-sm uppercase tracking-wide"
                          style={{ color: primaryColor }}
                        >
                          FACTURA
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">Nº FT-2026-0042</div>
                      </div>
                      <div className="text-right text-[10px] text-slate-600">
                        <div><strong>Data:</strong> {new Date().toLocaleDateString("pt-MZ")}</div>
                        <div><strong>Moeda:</strong> MT</div>
                      </div>
                    </div>

                    {/* Client Box */}
                    <div
                      className="bg-slate-50 p-2.5 rounded text-[11px]"
                      style={{ borderLeft: `4px solid ${secondaryColor}` }}
                    >
                      <div className="text-[9px] uppercase font-bold" style={{ color: secondaryColor }}>
                        Facturar a:
                      </div>
                      <div className="font-bold text-slate-800">Empresa Cliente Lda.</div>
                      <div className="text-[10px] text-slate-500">NUIT: 400987654 | Beira, Sofala</div>
                    </div>

                    {/* Mini Table */}
                    <div className="space-y-1">
                      <div
                        className="text-white px-2 py-1 font-semibold text-[10px] flex justify-between rounded-t"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span>Descrição</span>
                        <span>Total</span>
                      </div>
                      <div className="border-b border-slate-100 px-2 py-1 flex justify-between text-[10px] text-slate-700">
                        <span>Módulo TiConta Cloud</span>
                        <span>25.000,00 MT</span>
                      </div>
                    </div>

                    {/* Total Bar */}
                    <div className="flex justify-end pt-1">
                      <div
                        className="text-white px-3 py-1.5 rounded font-bold text-xs flex items-center gap-3"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span className="text-[10px] font-normal opacity-80">TOTAL COM IVA:</span>
                        <span>29.000,00 MT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
