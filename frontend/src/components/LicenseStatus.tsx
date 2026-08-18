"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, XCircle, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLicense } from "@/hooks/useLicense";
import { useAuthStore } from "@/store/auth.store";

interface LicenseStatusProps {
  companyId?: number;
  onRenewClick?: () => void;
}

export const LicenseStatusCard: React.FC<LicenseStatusProps> = ({ companyId = 1, onRenewClick }) => {
  const { status, plan, activeModules, licenseKey, expiresAt, daysRemaining, isLoading, fetchLicenseStatus } =
    useLicense(companyId);
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const getUrgencyColor = (days: number) => {
    if (days > 30) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (days >= 7) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  const getStatusBadge = () => {
    switch (status) {
      case "licensed":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Ativa & Verificada
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expirada
          </Badge>
        );
      default:
        return (
          <Badge className="bg-zinc-700/50 text-zinc-300 border-zinc-600 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Não Licenciado
          </Badge>
        );
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800/80">
        <div>
          <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Estado da Licença
            {getStatusBadge()}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Plano e módulos contratados para o TiConta v2 ERP
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLicenseStatus(companyId)}
          disabled={isLoading}
          className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-800"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Plano */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <span className="text-xs font-medium uppercase text-zinc-400">Plano Contratado</span>
            <p className="mt-1 text-2xl font-black uppercase text-emerald-400">
              {plan || "Nenhum"}
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-mono truncate">
              {licenseKey ? `Chave: ${licenseKey.slice(0, 16)}...` : "Sem chave associada"}
            </p>
          </div>

          {/* Card Expiração */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            <span className="text-xs font-medium uppercase text-zinc-400">Validade</span>
            <p className="mt-1 text-2xl font-bold text-white">
              {expiresAt ? new Date(expiresAt).toLocaleDateString("pt-MZ") : "N/D"}
            </p>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expiração automática
            </p>
          </div>

          {/* Card Dias Restantes */}
          <div className={`rounded-xl border p-4 ${getUrgencyColor(daysRemaining)}`}>
            <span className="text-xs font-medium uppercase opacity-80">Dias Restantes</span>
            <p className="mt-1 text-2xl font-black">
              {daysRemaining > 0 ? `${daysRemaining} dias` : "0 dias"}
            </p>
            <p className="text-xs opacity-80 mt-1">
              {daysRemaining <= 7 && daysRemaining > 0
                ? "⚠️ Renove com urgência"
                : daysRemaining === 0
                ? "Licença expirada"
                : "Licença em conformidade"}
            </p>
          </div>
        </div>

        {/* Módulos Habilitados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-zinc-300">
              Módulos Habilitados na Subscrição ({activeModules.length})
            </h4>
            {status === "licensed" && (
              <span className="text-xs text-emerald-400 font-medium">✓ Todos os Módulos Desbloqueados</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {activeModules.length > 0 ? (
              activeModules.map((mod) => {
                const MODULE_NAMES: Record<string, { label: string; desc: string }> = {
                  pos: { label: "Ponto de Venda (POS)", desc: "Caixa, Faturas VD/FT & IVA" },
                  auto_services: { label: "Oficina & Serviços Auto", desc: "Mecânica, Bate-Chapa, OBD-II & Tuning" },
                  restaurant: { label: "Restaurante & Bares", desc: "Mesas, KDS Cozinha & Divisão" },
                  takeaway: { label: "Takeaway & Entregas", desc: "Estafetas & Rastreamento" },
                  informal: { label: "Vendas Informais / Fiado", desc: "Caderno Digital & Score Crédito" },
                  poultry: { label: "Produção Avícola & Ovos", desc: "Lotes, Postura & Zootécnico" },
                  pricing: { label: "Cotações & Precificação", desc: "Custos de Produção & Margens" },
                  accounting: { label: "Contabilidade PGC-NIRF", desc: "Diários, Razão & Balancetes" },
                  crm: { label: "Clientes & CRM", desc: "Contactos & Saldos Devedores" },
                  hr: { label: "Recursos Humanos & Salários", desc: "Folha, INSS (3%+4%) & IRPS" },
                  manufacturing: { label: "Fabrico & Marcenaria", desc: "Ordens & Corte de Material" },
                  projects: { label: "Obras & Projetos", desc: "Centros de Custo & Tarefas" },
                  reports: { label: "Relatórios Fiscais & BI", desc: "DRE, IVA & Mapas Oficiais" },
                  document_delivery: { label: "Envio de Documentos", desc: "WhatsApp & Email Automático" },
                  barcode: { label: "Código de Barras", desc: "Leitura & Etiquetas" },
                  licensing: { label: "Licenciamento Criptográfico", desc: "Validação Offline HMAC" },
                  "*": { label: "Acesso Total (*)", desc: "Todos os módulos liberados" },
                };

                const info = MODULE_NAMES[mod.toLowerCase()] || {
                  label: mod.toUpperCase(),
                  desc: "Módulo do Sistema",
                };

                return (
                  <div
                    key={mod}
                    className="flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-white">{info.label}</p>
                      <p className="text-[11px] text-zinc-400 leading-tight">{info.desc}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 text-center">
                <p className="text-sm text-zinc-400">Nenhum módulo ativo. Ative uma chave de licença na aba 'Nova Ativação'.</p>
              </div>
            )}
          </div>
        </div>

        {/* Botão de Renovação para Admin */}
        {isAdmin && onRenewClick && (
          <div className="flex justify-end pt-4 border-t border-zinc-800/80">
            <Button
              onClick={onRenewClick}
              className="bg-emerald-600 font-medium text-white hover:bg-emerald-500"
            >
              Renovar / Estender Licença
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
