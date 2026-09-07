import { useCallback, useEffect } from "react";
import { usePremiumStore } from "@/store/premium.store";
import { FeatureName } from "@/types/premium";

export function usePremiumFeatures(companyId: number = 1) {
  const {
    features,
    costBreakdown,
    isLoading,
    actionLoading,
    error,
    fetchFeaturesAndCost,
    enableFeature,
    disableFeature,
    hasFeature,
    clearError,
  } = usePremiumStore();

  useEffect(() => {
    fetchFeaturesAndCost(companyId);
  }, [fetchFeaturesAndCost, companyId]);

  const checkFeature = useCallback(
    (featureName: FeatureName | string): boolean => {
      return hasFeature(featureName);
    },
    [hasFeature]
  );

  return {
    features,
    costBreakdown,
    isLoading,
    actionLoading,
    error,
    enableFeature: (name: string) => enableFeature(name, companyId),
    disableFeature: (name: string) => disableFeature(name, companyId),
    refetch: () => fetchFeaturesAndCost(companyId),
    checkFeature,
    clearError,
  };
}
