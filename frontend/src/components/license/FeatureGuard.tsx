"use client";

import React from "react";
import { useLicenseStore } from "@/store/license.store";

export type TiContaModule =
  | "pos"
  | "invoicing"
  | "scanner"
  | "inventory"
  | "reports"
  | "multi_user"
  | "api_integrations"
  | "admin"
  | string;

interface FeatureGuardProps {
  module: TiContaModule;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Se true, oculta 100% da visualização no DOM sem deixar vestígios visuais */
  hidden?: boolean;
}

/**
  * Guardião de Licenciamento do TiConta ERP.
  * Bloqueia completamente a visualização de qualquer módulo, botão ou rota
  * não coberto pela licença ativa da empresa.
  */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  module,
  children,
  fallback = null,
  hidden = true,
}) => {
  const { status, activeModules, hasModule } = useLicenseStore();

  const isLicensed = status === "licensed" || status === "active";
  const hasAccess = isLicensed && hasModule(module);

  if (!hasAccess) {
    if (hidden) {
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
  * Hook utilitário para verificar acesso a funcionalidades na lógica dos componentes.
  */
export function useFeatureAccess(module: TiContaModule) {
  const { status, plan, activeModules, hasModule, daysRemaining } = useLicenseStore();

  const isLicensed = status === "licensed" || status === "active";
  const hasAccess = isLicensed && hasModule(module);

  return {
    hasAccess,
    isBlocked: !hasAccess,
    plan,
    daysRemaining,
    activeModules,
  };
}

export default FeatureGuard;
