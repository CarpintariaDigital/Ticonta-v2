"use client";

import React, { useEffect, useState } from "react";
import { Shield, Key, History, PlusCircle, RefreshCw, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LicenseStatusCard } from "@/components/LicenseStatus";
import { LicenseActivation } from "@/components/LicenseActivation";
import { licensingService } from "@/services/licensing";
import { LicenseAdminItem, LicensingStats } from "@/types/license";
import { useAuthStore } from "@/store/auth.store";

export default function LicenseSettingsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState<"status" | "activate" | "admin">("status");
  const [adminLicenses, setAdminLicenses] = useState<LicenseAdminItem[]>([]);
  const [adminStats, setAdminStats] = useState<LicensingStats | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [renewDays, setRenewDays] = useState<number>(365);
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setIsLoadingAdmin(true);
    try {
      const [lics, stats] = await Promise.all([
        licensingService.fetchAdminLicenses(),
        licensingService.fetchAdminStats(),
      ]);
      setAdminLicenses(lics);
      setAdminStats(stats);
    } catch (err: any) {
      console.error("Falha ao carregar dados admin de licença:", err);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  useEffect(() => {
    if (activeTab === "admin" && isAdmin) {
      loadAdminData();
    }
  }, [activeTab, isAdmin]);

  const handleRenew = async (licenseId: number) => {
    try {
      setRenewingId(licenseId);
      await licensingService.renewLicense(licenseId, renewDays);
      setMessage("✅ Licença renovada com sucesso!");
      await loadAdminData();
    } catch (err: any) {
      setMessage("❌ Erro ao renovar licença.");
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            Gestão de Licenciamento
          </h1>
          <p className="text-sm text-zinc-400">
            Controlo de subscrições, chaves criptográficas e ativação de módulos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
          <Button
            variant={activeTab === "status" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("status")}
            className={activeTab === "status" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}
          >
            Estado Atual
          </Button>
          <Button
            variant={activeTab === "activate" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("activate")}
            className={activeTab === "activate" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}
          >
            Nova Ativação
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("admin")}
              className={activeTab === "admin" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}
            >
              Auditoria de Licenças
            </Button>
          )}
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline">Fechar</button>
        </div>
      )}

      {/* Tab: Estado Atual */}
      {activeTab === "status" && (
        <div className="space-y-6">
          <LicenseStatusCard companyId={1} onRenewClick={() => setActiveTab("activate")} />
        </div>
      )}

      {/* Tab: Nova Ativação */}
      {activeTab === "activate" && (
        <div className="flex justify-center pt-4">
          <LicenseActivation companyId={1} onSuccess={() => setActiveTab("status")} />
        </div>
      )}

      {/* Tab: Painel Administrativo de Licenças */}
      {activeTab === "admin" && isAdmin && (
        <div className="space-y-6">
          {/* Métricas Globais */}
          {adminStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-zinc-800 bg-zinc-900/60 text-zinc-100">
                <CardContent className="pt-6">
                  <span className="text-xs font-medium text-zinc-400 uppercase">Total Emitidas</span>
                  <p className="text-2xl font-bold text-white mt-1">{adminStats.total_licenses}</p>
                </CardContent>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/60 text-zinc-100">
                <CardContent className="pt-6">
                  <span className="text-xs font-medium text-zinc-400 uppercase">Licenças Ativas</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{adminStats.active_licenses}</p>
                </CardContent>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/60 text-zinc-100">
                <CardContent className="pt-6">
                  <span className="text-xs font-medium text-zinc-400 uppercase">Expiradas</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{adminStats.expired_licenses}</p>
                </CardContent>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/60 text-zinc-100">
                <CardContent className="pt-6">
                  <span className="text-xs font-medium text-zinc-400 uppercase">Faturação Estimada</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                    {Number(adminStats.estimated_revenue_mzn).toLocaleString("pt-MZ")} MT
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabela de Licenças */}
          <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg font-bold text-white">Histórico de Licenças Emitidas</CardTitle>
                <CardDescription className="text-zinc-400">
                  Registo criptográfico de todas as subscrições TiConta v2
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAdminData}
                disabled={isLoadingAdmin}
                className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingAdmin ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Plano</th>
                      <th className="py-3 px-4">Chave de Licença</th>
                      <th className="py-3 px-4">Validade</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {adminLicenses.length > 0 ? (
                      adminLicenses.map((lic) => (
                        <tr key={lic.id} className="hover:bg-zinc-800/30">
                          <td className="py-3 px-4 font-medium text-white">{lic.customer_name}</td>
                          <td className="py-3 px-4 uppercase font-bold text-emerald-400">{lic.plan}</td>
                          <td className="py-3 px-4 font-mono text-xs text-zinc-400">{lic.license_key}</td>
                          <td className="py-3 px-4 text-xs">{new Date(lic.expires_at).toLocaleDateString("pt-MZ")}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                lic.status === "active"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {lic.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRenew(lic.id)}
                              disabled={renewingId === lic.id}
                              className="border-zinc-800 bg-zinc-950 text-xs hover:bg-emerald-600 hover:text-white"
                            >
                              {renewingId === lic.id ? "A renovar..." : "Renovar +1 Ano"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-zinc-500">
                          Nenhuma licença emitida registada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
