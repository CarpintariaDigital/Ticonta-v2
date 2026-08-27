"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import {
  Building2,
  Image as ImageIcon,
  Upload,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Percent,
  Sparkles,
  RefreshCw,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";

export default function CompanySettingsPage() {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [isSaved, setIsSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("/logo-ticonta.png");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticonta_company_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile(parsed);
          if (parsed.logo_url) setLogoPreview(parsed.logo_url);
        } catch {}
      }
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setProfile((prev) => ({ ...prev, logo_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("ticonta_company_profile", JSON.stringify(profile));
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardNavbar />

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Dados da Empresa & Logótipo
                </h1>
                <p className="text-xs text-slate-400">
                  Configure o logótipo oficial, NUIT e cabeçalhos para recibos, faturas e pró-formas.
                </p>
              </div>
            </div>

            {isSaved && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Guardado com sucesso!
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Logo & Visual Preview */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Logótipo para Recibos & Faturas
                </label>

                <div className="relative mx-auto w-36 h-36 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-2 overflow-hidden shadow-inner group">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logótipo da Empresa"
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  ) : (
                    <div className="text-center text-slate-500">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px]">Sem logótipo</span>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-emerald-400 font-bold text-xs cursor-pointer">
                    <Upload className="w-5 h-5 mb-1" />
                    Alterar Logótipo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[11px] text-slate-500">
                  Recomendado: PNG ou JPG com fundo transparente (quadrado ou retangular).
                </p>

                <label className="block">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer transition-colors border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    Carregar Imagem do Dispositivo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Receipt Visual Preview Mini Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 text-xs space-y-2 text-zinc-400 font-mono shadow-inner">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block border-b border-zinc-800 pb-1 font-sans">
                  Pré-visualização no Recibo Digital
                </span>
                <div className="text-center py-2 space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 p-0.5">
                    {logoPreview && <img src={logoPreview} className="w-full h-full object-contain" />}
                  </div>
                  <div className="font-bold text-white text-[11px]">{profile.name}</div>
                  <div className="text-[9px]">NUIT: {profile.nuit} • {profile.city}</div>
                </div>
                <div className="border-t border-dashed border-zinc-800 pt-1 text-[9px] text-center text-zinc-500 font-sans">
                  {profile.receipt_footer_note}
                </div>
              </div>
            </div>

            {/* Right Column: Company Form Inputs */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Store className="w-4 h-4 text-emerald-400" />
                Informações Fiscais & Comerciais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Nome Comercial da Loja / Estabelecimento *
                  </label>
                  <Input
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Razão Social / Denominação Legal
                  </label>
                  <Input
                    value={profile.legal_name}
                    onChange={(e) => setProfile({ ...profile, legal_name: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    NUIT (Número Único de Identificação Tributária) *
                  </label>
                  <Input
                    required
                    maxLength={9}
                    value={profile.nuit}
                    onChange={(e) => setProfile({ ...profile, nuit: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Contacto Telefónico Principal *
                  </label>
                  <Input
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Número de WhatsApp Comercial
                  </label>
                  <Input
                    value={profile.whatsapp}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Email de Contacto / Faturação
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Endereço Físico (Rua, Bairro, Nº) *
                  </label>
                  <Input
                    required
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Cidade *</label>
                  <Input
                    required
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Província *</label>
                  <select
                    value={profile.province}
                    onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                    className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-md text-white"
                  >
                    <option value="Maputo Cidade">Maputo Cidade</option>
                    <option value="Maputo Província">Maputo Província</option>
                    <option value="Gaza">Gaza</option>
                    <option value="Inhambane">Inhambane</option>
                    <option value="Sofala">Sofala</option>
                    <option value="Manica">Manica</option>
                    <option value="Tete">Tete</option>
                    <option value="Zambézia">Zambézia</option>
                    <option value="Nampula">Nampula</option>
                    <option value="Cabo Delgado">Cabo Delgado</option>
                    <option value="Niassa">Niassa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Taxa de IVA Padrão (%)
                  </label>
                  <Input
                    type="number"
                    value={profile.default_vat_rate}
                    onChange={(e) => setProfile({ ...profile, default_vat_rate: Number(e.target.value) })}
                    className="bg-slate-950 border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Moeda Padrão
                  </label>
                  <Input
                    value={profile.currency}
                    onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white font-mono font-bold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Mensagem de Rodapé dos Recibos & Faturas
                  </label>
                  <Input
                    value={profile.receipt_footer_note}
                    onChange={(e) => setProfile({ ...profile, receipt_footer_note: e.target.value })}
                    className="bg-slate-950 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950"
                >
                  <Save className="w-4 h-4" />
                  Guardar Dados da Empresa
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
