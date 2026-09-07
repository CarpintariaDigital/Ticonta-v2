import { useEffect } from "react";
import { useLicenseStore } from "@/store/license.store";

export function useLicense(companyId: number = 1) {
  const {
    status,
    plan,
    activeModules,
    licenseKey,
    expiresAt,
    daysRemaining,
    isLoading,
    error,
    fetchLicenseStatus,
    activateLicense,
    hasModule,
    clearError,
  } = useLicenseStore();

  useEffect(() => {
    fetchLicenseStatus(companyId);
  }, [companyId, fetchLicenseStatus]);

  const isLicensed = status === "licensed";
  const isExpired = status === "expired" || daysRemaining <= 0;

  return {
    status,
    plan,
    activeModules,
    licenseKey,
    expiresAt,
    daysRemaining,
    isLicensed,
    isExpired,
    isLoading,
    error,
    hasModule,
    fetchLicenseStatus,
    activateLicense,
    clearError,
  };
}
