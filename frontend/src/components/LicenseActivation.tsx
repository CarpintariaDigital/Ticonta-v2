"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, AlertCircle, Loader2, ArrowRight, Building2, UserCheck, CheckCircle2, Lock } from "lucide-react";
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
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [licenseKey, setLicenseKey] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { activateLicense, isLoading, error, clearError } = useLicenseStore();

  // Dados de Configuração Primária
  const [companyName, setCompanyName] = useState("");
  const [companyNuit, setCompanyNuit] = useState("");
  const [companyCity, setCompanyCity] = useState("Maputo");
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPin, setAdminPin] = useState("");
  const [posOperatorPin, setPosOperatorPin] = useState("");

  const handleActivateStep1 = async (e: React.FormEvent) => {
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
      setSuccessMsg("✅ Licença validada com sucesso!");
      setTimeout(() => {
        setStep(2);
      }, 700);
    } catch (err: any) {
      // Erro tratado pela store
    }
  };

  const handleFinishSetupStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !adminPin.trim()) {
      setValidationError("Por favor, preencha o Nome da Empresa e o PIN do Administrador.");
      return;
    }

    // Salvar Perfil da Empresa
    const companyProfile = {
      name: companyName.trim(),
      nuit: companyNuit.trim() || "400123456",
      city: companyCity.trim() || "Maputo",
      province: "Maputo Cidade",
      currency: "MZN",
      license_key: licenseKey.trim(),
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("ticonta_company_profile", JSON.stringify(companyProfile));

    // Salvar Utilizadores Primários
    const primaryUsers = [
      {
        id: "usr_admin",
        name: adminName.trim() || "Administrador Geral",
        username: adminUsername.trim() || "admin",
        pin: adminPin.trim(),
        role: "admin",
        active: true,
      },
      {
        id: "usr_pos",
        name: "Operador de Caixa",
        username: "operador",
        pin: posOperatorPin.trim() || "1234",
        role: "pos_operator",
        active: true,
      }
    ];
    localStorage.setItem("ticonta_users", JSON.stringify(primaryUsers));
    localStorage.setItem("ticonta_active_user", JSON.stringify(primaryUsers[0]));
    localStorage.setItem("token", "ticonta-local-token-" + Date.now());

    // Redirecionar para o Dashboard
    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900/95 text-zinc-100 shadow-2xl backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          {step === 1 ? <KeyRound className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          {step === 1 ? (
            <>Ativação de Licença <span className="text-emerald-500">TiConta v2</span></>
          ) : (
            <>Configuração Inicial da <span className="text-emerald-500">Empresa</span></>
          )}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {step === 1
            ? "Introduza a sua chave de licença oficial para desbloquear o sistema"
            : "Defina os dados da sua empresa e crie o utilizador administrador principal"}
        </CardDescription>
      </CardHeader>

      {step === 1 ? (
        <form onSubmit={handleActivateStep1}>
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
                Chave de Licença Oficial
              </label>
              <Input
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="TIC-XXXXX-COMPLETE-270815-XXXXXXXX"
                className="bg-zinc-950 border-zinc-800 font-mono tracking-wide text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                disabled={isLoading}
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                Exemplo: TIC-CLIEN-COMP-271231-9F8A
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
                  Validar Chave & Configurar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleFinishSetupStep2}>
          <CardContent className="space-y-3.5 text-xs">
            {validationError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="border-b border-zinc-800 pb-2">
              <span className="font-semibold uppercase tracking-wider text-emerald-400">1. Dados da Empresa</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1 col-span-2">
                <label className="text-zinc-400 font-medium">Nome da Empresa / Loja *</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Mercearia & Boutique Maputo"
                  className="bg-zinc-950 border-zinc-800 text-white h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">NUIT (9 Dígitos)</label>
                <Input
                  value={companyNuit}
                  onChange={(e) => setCompanyNuit(e.target.value)}
                  placeholder="400123456"
                  maxLength={9}
                  className="bg-zinc-950 border-zinc-800 text-white h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Cidade / Localização</label>
                <Input
                  value={companyCity}
                  onChange={(e) => setCompanyCity(e.target.value)}
                  placeholder="Maputo"
                  className="bg-zinc-950 border-zinc-800 text-white h-9 text-xs"
                />
              </div>
            </div>

            <div className="border-b border-zinc-800 pb-2 pt-2">
              <span className="font-semibold uppercase tracking-wider text-emerald-400">2. Administrador & Acesso</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1 col-span-2">
                <label className="text-zinc-400 font-medium">Nome do Responsável / Gerente</label>
                <Input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ex: Ildino Nunes"
                  className="bg-zinc-950 border-zinc-800 text-white h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Identificador (Username)</label>
                <Input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white h-9 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Senha ou PIN Admin *</label>
                <Input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="PIN numérico ou senha"
                  className="bg-zinc-950 border-zinc-800 text-white h-9 text-xs font-mono"
                  required
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-zinc-400 font-medium">PIN Rápido para Operador de Caixa (POS)</label>
                <Input
                  type="password"
                  value={posOperatorPin}
                  onChange={(e) => setPosOperatorPin(e.target.value)}
                  placeholder="Ex: 1234 (opcional)"
                  maxLength={6}
                  className="bg-zinc-950 border-zinc-800 text-white h-9 text-xs font-mono"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full bg-emerald-600 font-medium text-white hover:bg-emerald-500 h-10"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Concluir Configuração & Entrar no ERP
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};
