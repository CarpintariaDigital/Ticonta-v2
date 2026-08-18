"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useLicensedModules } from "@/hooks/useLicensedModules";

const ROUTE_MODULE_MAP: Record<string, { module: string; name: string; plan: "Pro" | "Enterprise" }> = {
  "/restaurant": { module: "restaurant", name: "Restaurante & Mesas", plan: "Pro" },
  "/takeaway": { module: "restaurant", name: "Takeaway & Entregas", plan: "Pro" },
  "/accounting": { module: "accounting", name: "Contabilidade PGC", plan: "Pro" },
  "/hr": { module: "hr", name: "Recursos Humanos & INSS", plan: "Pro" },
  "/crm": { module: "crm", name: "CRM & Funil de Vendas", plan: "Enterprise" },
  "/poultry": { module: "poultry", name: "Produção Avícola & Ovos", plan: "Enterprise" },
  "/projects": { module: "projects", name: "Obras & Projectos", plan: "Enterprise" },
  "/manufacturing": { module: "projects", name: "Fabrico & Marcenaria", plan: "Enterprise" },
  "/auto-services": { module: "auto_services", name: "Oficina & Auto Services", plan: "Enterprise" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { hasModule } = useLicensedModules();
  const isPos = pathname?.startsWith("/pos");

  // Verificar se a rota actual requer um módulo não licenciado
  const matchedRoute = Object.entries(ROUTE_MODULE_MAP).find(([routePrefix]) =>
    pathname?.startsWith(routePrefix)
  );

  const isBlocked = matchedRoute && !hasModule(matchedRoute[1].module);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {!isPos && <DashboardNavbar />}
        <div className={isPos ? "flex-1 w-full h-screen overflow-hidden" : "flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full"}>
          {isBlocked ? (
            <div className="py-8 md:py-16">
              <UpgradePrompt
                moduleName={matchedRoute[1].name}
                requiredPlan={matchedRoute[1].plan}
              />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
