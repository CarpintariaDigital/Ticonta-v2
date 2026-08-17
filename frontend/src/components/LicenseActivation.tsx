"use client";

import React, { useState } from "react";
import { KeyRound, ShieldCheck, AlertCircle, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useLicenseStore } from "@/store/license.store";
import { licensingService } from "@/services/licensing";

interface LicenseActivationProps {
  companyId?: number;
  onSuccess?: () => void;
}

export const LicenseActivation: React.FC<LicenseActivationProps> = ({ companyId = 1, onSuccess }) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { activateLicense, isLoading, error, clearError } = useLicenseStore();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMsg(null);
    clearError();

    const trimmedKey = licenseKey.trim();

    if (!licensingService.validateLicenseFormat(trimmedKey)) {
      setValidationError("Formato inválido. Use o formato oficial: TIC-XXXXX-PLAN-YYMMDD-SIGNATURE");
      return;
    }

    try {
      await activateLicense(trimmedKey, companyId);
      setSuccessMsg("✅ Licença ativada com sucesso no TiConta v2!");
      if (onSuccess) {
        setTimeout(onSuccess, 1200);
      }
    } catch (err: any) {
      // Erro tratado pela store
    }
  };

  return (
    <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-2xl backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Ativação de Licença <span className="text-emerald-500">TiConta v2</span>
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Introduza a sua chave de licença oficial para desbloquear as funcionalidades do sistema
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleActivate}>
        <CardContent className="space-y-4">
          {(validationError || error) && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Chave de Licença
            </label>
            <div className="relative">
              <Input
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="TIC-XXXXX-COMPLETE-270815-XXXXXXXX"
                className="bg-zinc-950 border-zinc-800 font-mono tracking-wide text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Exemplo: TIC-A8B9C-COMPLETE-271231-9F8A1B2C
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading || !licenseKey.trim()}
            className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A validar chave...
              </>
            ) : (
              <>
                Ativar Licença
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-between text-xs text-zinc-500 w-full pt-2 border-t border-zinc-800/80">
            <span>Não possui uma licença?</span>
            <a
              href="mailto:licencas@carpintaria.digital?subject=Pedido de Licenca TiConta v2"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              target="_blank"
              rel="noreferrer"
            >
              Comprar Plano
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
