import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AdminLicensingService,
  GenerateLicensePayload,
  LicenseListResponse,
  AdminStatsResponse,
  AdminUsageResponse,
} from '@/services/admin_licensing';

export function useAdminLicensing() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [planFilter, setPlanFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('issued_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // 1. Query: Listagem de Licenças
  const licensesQuery = useQuery<LicenseListResponse>({
    queryKey: ['admin_licenses', page, limit, planFilter, statusFilter, search, sortBy, order],
    queryFn: () =>
      AdminLicensingService.getLicenses({
        page,
        limit,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        sort_by: sortBy,
        order,
      }),
  });

  // 2. Query: Estatísticas Globais
  const statsQuery = useQuery<AdminStatsResponse>({
    queryKey: ['admin_licensing_stats'],
    queryFn: () => AdminLicensingService.getStats(),
  });

  // 3. Query: Telemetria e Utilização
  const usageQuery = useQuery<AdminUsageResponse>({
    queryKey: ['admin_licensing_usage'],
    queryFn: () => AdminLicensingService.getUsage(),
  });

  // 4. Mutation: Gerar Licença
  const generateMutation = useMutation({
    mutationFn: (data: GenerateLicensePayload) => AdminLicensingService.generateLicense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_licenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin_licensing_stats'] });
    },
  });

  // 5. Mutation: Renovar Licença
  const renewMutation = useMutation({
    mutationFn: ({ id, days }: { id: number; days: number }) => AdminLicensingService.renewLicense(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_licenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin_licensing_stats'] });
    },
  });

  // 6. Mutation: Revogar Licença
  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => AdminLicensingService.revokeLicense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_licenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin_licensing_stats'] });
    },
  });

  // 7. Mutation: Reenviar Email
  const resendEmailMutation = useMutation({
    mutationFn: ({ id, email }: { id: number; email?: string }) => AdminLicensingService.resendLicenseEmail(id, email),
  });

  return {
    // Estados e Filtros
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

    // Dados
    licenses: licensesQuery.data?.items || [],
    total: licensesQuery.data?.total || 0,
    totalPages: licensesQuery.data?.total_pages || 1,
    isLoadingLicenses: licensesQuery.isLoading,
    isRefetchingLicenses: licensesQuery.isRefetching,
    refetchLicenses: licensesQuery.refetch,

    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,

    usage: usageQuery.data?.customers_usage || [],
    isLoadingUsage: usageQuery.isLoading,

    // Ações
    generateLicense: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,

    renewLicense: (id: number, days: number) => renewMutation.mutateAsync({ id, days }),
    isRenewing: renewMutation.isPending,

    revokeLicense: (id: number, reason: string) => revokeMutation.mutateAsync({ id, reason }),
    isRevoking: revokeMutation.isPending,

    resendEmail: (id: number, email?: string) => resendEmailMutation.mutateAsync({ id, email }),
    isResendingEmail: resendEmailMutation.isPending,
  };
}
