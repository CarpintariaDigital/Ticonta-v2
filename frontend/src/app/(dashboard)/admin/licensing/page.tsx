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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            Painel Administrativo Carpintaria Digital
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            Gestão & Emissão de Licenças
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Controlo criptográfico offline (HMAC-SHA256), telemetria e faturação de subscrições em Moçambique.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchLicenses()}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingLicenses ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              if (confirm('Deseja limpar as licenças de teste/demonstração e iniciar com uma lista limpa para produção?')) {
                AdminLicensingService.purgeMockLicenses();
                refetchLicenses();
                alert('✓ Dados de demonstração limpos com sucesso!');
              }
            }}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-500/50 text-slate-300 hover:text-red-400 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
            title="Limpar licenças de teste para produção"
          >
            🧹 Limpar Demos
          </button>

          <button
            onClick={() => setIsGenerateOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Emitir Nova Licença
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <StatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Gráficos de Faturação & Planos */}
      <RevenueChart stats={stats} isLoading={isLoadingStats} />

      {/* Tabela de Licenças */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-400" />
            Todas as Licenças Emitidas
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {total} subscritor(es) registado(s)
          </span>
        </div>

        <LicenseList
          licenses={licenses}
          total={total}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          search={search}
          setSearch={setSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          order={order}
          setOrder={setOrder}
          onOpenRenew={(lic) => setSelectedRenewLic(lic)}
          onOpenRevoke={(lic) => setSelectedRevokeLic(lic)}
          onResendEmail={resendEmail}
          isLoading={isLoadingLicenses}
        />
      </div>

      {/* Modal: Gerar Licença */}
      <GenerateLicenseModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onGenerate={generateLicense}
        isGenerating={isGenerating}
      />

      {/* Modal: Renovar Licença */}
      <RenewalForm
        license={selectedRenewLic}
        isOpen={Boolean(selectedRenewLic)}
        onClose={() => setSelectedRenewLic(null)}
        onRenew={renewLicense}
        isRenewing={isRenewing}
      />

      {/* Modal: Revogar Licença */}
      <RevokeModal
        license={selectedRevokeLic}
        isOpen={Boolean(selectedRevokeLic)}
        onClose={() => setSelectedRevokeLic(null)}
        onRevoke={revokeLicense}
        isRevoking={isRevoking}
      />
    </div>
  );
}
