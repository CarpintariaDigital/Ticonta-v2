'use client';

import React, { useState } from 'react';
import { KeyRound, Plus, Sparkles, RefreshCw, ShieldCheck, Activity } from 'lucide-react';
import { useAdminLicensing } from '@/hooks/useAdminLicensing';
import { StatsCards } from '@/components/admin/StatsCards';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { LicenseList } from '@/components/admin/LicenseList';
import { GenerateLicenseModal } from '@/components/admin/GenerateLicenseModal';
import { RenewalForm } from '@/components/admin/RenewalForm';
import { RevokeModal } from '@/components/admin/RevokeModal';
import { AdminLicensingService, AdminLicenseItem } from '@/services/admin_licensing';

export default function AdminLicensingDashboardPage() {
  const {
    page,
    setPage,
    limit,
    setLimit,
    planFilter,
    setPlanFilter,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    sortBy,
    setSortBy,
    order,
    setOrder,

    licenses,
    total,
    totalPages,
    isLoadingLicenses,
    refetchLicenses,

    stats,
    isLoadingStats,

    generateLicense,
    isGenerating,

    renewLicense,
    isRenewing,

    revokeLicense,
    isRevoking,

    resendEmail,
  } = useAdminLicensing();

  // Modais
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedRenewLic, setSelectedRenewLic] = useState<AdminLicenseItem | null>(null);
  const [selectedRevokeLic, setSelectedRevokeLic] = useState<AdminLicenseItem | null>(null);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              Gestão de Licenças & Subscrições
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Super Admin
              </span>
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Controlo de chaves criptográficas (HMAC-SHA256), planos em MZN, clientes e status de ativação
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => refetchLicenses()}
            title="Recarregar dados"
            className="p-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingLicenses ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={async () => {
              if (confirm('Deseja executar a verificação e revogação em massa de licenças expiradas?')) {
                const res = await AdminLicensingService.checkExpired();
                alert(`Verificação concluída: ${res.revoked_count} licenças revogadas.`);
                refetchLicenses();
              }
            }}
            className="px-3.5 py-2.5 bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-300 text-zinc-700 hover:text-red-700 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            Auditar Expiradas
          </button>

          <button
            onClick={() => setIsGenerateOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Licença
          </button>
        </div>
      </div>

      {/* 1. KPIs Cards */}
      <StatsCards stats={stats} isLoading={isLoadingStats} />

      {/* 2. Gráfico de Faturação e Distribuição de Planos */}
      <RevenueChart stats={stats} isLoading={isLoadingStats} />

      {/* 3. Tabela Filtrada de Licenças */}
      <LicenseList
        licenses={licenses}
        total={total}
        page={page}
        totalPages={totalPages}
        isLoading={isLoadingLicenses}
        planFilter={planFilter}
        statusFilter={statusFilter}
        search={search}
        sortBy={sortBy}
        order={order}
        setPage={setPage}
        setPlanFilter={setPlanFilter}
        setStatusFilter={setStatusFilter}
        setSearch={setSearch}
        setSortBy={setSortBy}
        setOrder={setOrder}
        onOpenRenew={(lic) => setSelectedRenewLic(lic)}
        onOpenRevoke={(lic) => setSelectedRevokeLic(lic)}
        onResendEmail={resendEmail}
      />

      {/* MODAIS */}
      {isGenerateOpen && (
        <GenerateLicenseModal
          isOpen={isGenerateOpen}
          onClose={() => setIsGenerateOpen(false)}
          onGenerate={async (payload) => {
            await generateLicense(payload);
            setIsGenerateOpen(false);
          }}
          isGenerating={isGenerating}
        />
      )}

      {selectedRenewLic && (
        <RenewalForm
          isOpen={Boolean(selectedRenewLic)}
          license={selectedRenewLic}
          onClose={() => setSelectedRenewLic(null)}
          onRenew={async (id: number, days: number) => {
            await renewLicense(id, days);
            setSelectedRenewLic(null);
          }}
          isRenewing={isRenewing}
        />
      )}

      {selectedRevokeLic && (
        <RevokeModal
          isOpen={Boolean(selectedRevokeLic)}
          license={selectedRevokeLic}
          onClose={() => setSelectedRevokeLic(null)}
          onRevoke={async (id: number, reason: string) => {
            await revokeLicense(id, reason);
            setSelectedRevokeLic(null);
          }}
          isRevoking={isRevoking}
        />
      )}
    </div>
  );
}
