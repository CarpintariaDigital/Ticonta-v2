"use client";

import React from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import {
  Building2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Settings,
} from "lucide-react";

export default function SettingsHubPage() {
  const settingsSections = [
    {
      title: "Dados da Empresa & Logótipo",
      desc: "Configure nome comercial, NUIT moçambicano, endereço, taxas de IVA e logótipo impresso.",
      href: "/settings/company",
      icon: Building2,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
    },
    {
      title: "Segurança & Alteração de PIN",
      desc: "Altere o código PIN de acesso do operador e bloqueio mestre do terminal de gestão.",
      href: "/settings/security",
      icon: KeyRound,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
    {
      title: "Gestão de Licenciamento",
      desc: "Consulte o estado da licença TiConta ERP, validade e ativação de chaves oficiais.",
      href: "/settings/license",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
    },
    {
      title: "Recursos Premium",
      desc: "Desbloqueie módulos avançados: restauração, KDS de cozinha, takeaway, avicultura e CRM.",
      href: "/settings/premium",
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <DashboardNavbar />

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="border-b border-zinc-800 pb-5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5 font-mono">
              <Settings className="w-6 h-6 text-emerald-400" />
              Definições & Configuração do Terminal
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Central de personalização do TiConta v2 ERP para Moçambique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingsSections.map((sec) => {
              const Icon = sec.icon;
              return (
                <Link
                  key={sec.href}
                  href={sec.href}
                  className={`p-6 rounded-2xl border ${sec.border} bg-[#0e1726]/70 hover:bg-[#0e1726] transition-all group backdrop-blur flex items-start justify-between shadow-lg`}
                >
                  <div className="space-y-2">
                    <div className={`p-3 w-fit rounded-xl ${sec.bg} ${sec.color} border ${sec.border} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-sm font-bold text-white font-mono group-hover:text-emerald-400 transition-colors">
                      {sec.title}
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                      {sec.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all mt-2" />
                </Link>
              );
            })}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
