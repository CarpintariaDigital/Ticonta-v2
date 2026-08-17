"use client";

import React from "react";
import { Lock, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface LockedFeatureProps {
  featureName: string;
  requiredPlan?: string;
  description?: string;
}

export const LockedFeature: React.FC<LockedFeatureProps> = ({
  featureName,
  requiredPlan = "PROFESSIONAL",
  description = "Esta funcionalidade avançada não está disponível no plano atualmente ativado na sua empresa.",
}) => {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-6">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/90 text-center text-zinc-100 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <Lock className="h-7 w-7" />
          </div>
          <div className="flex justify-center">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 uppercase tracking-wider text-[11px]">
              Requer Plano {requiredPlan}
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-white">
            {featureName} Bloqueado
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs text-zinc-400">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-left space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Desbloqueie com o upgrade:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
              <li>Acesso completo e ilimitado ao módulo {featureName}</li>
              <li>Sincronização em tempo real e relatórios automáticos</li>
              <li>Suporte técnico prioritário TiConta</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Link href="/settings/license" className="w-full">
            <Button className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-500">
              Ver e Atualizar Licença
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a
            href="mailto:comercial@carpintaria.digital?subject=Upgrade de Licença TiConta"
            className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors pt-1"
            target="_blank"
            rel="noreferrer"
          >
            Falar com a equipa comercial
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};
