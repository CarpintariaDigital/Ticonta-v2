"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, User, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, Server, Globe } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z
    .string()
    .min(3, "O nome de utilizador ou email deve ter pelo menos 3 caracteres")
    .max(50, "Máximo de 50 caracteres"),
  pin: z
    .string()
    .min(4, "A senha ou PIN deve ter pelo menos 4 caracteres")
    .max(64, "Máximo de 64 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState("");
  const [serverSavedMsg, setServerSavedMsg] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      pin: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticonta_custom_api_url") || "";
      setCustomApiUrl(saved);
    }
  }, []);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (customApiUrl.trim()) {
        localStorage.setItem("ticonta_custom_api_url", customApiUrl.trim());
        setServerSavedMsg("Servidor API configurado com sucesso!");
      } else {
        localStorage.removeItem("ticonta_custom_api_url");
        setServerSavedMsg("Restaurado servidor padrão!");
      }
      setTimeout(() => setServerSavedMsg(""), 3000);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    clearError();
    try {
      await login(values.username.trim(), values.pin);
      router.push(redirectUrl);
    } catch (err: any) {
      setAuthError(err.message || "Credenciais inválidas. Verifique os dados.");
    }
  };

  const handleQuickFillAndLogin = async (username: string, pin: string, targetPath: string) => {
    form.setValue("username", username, { shouldValidate: true, shouldDirty: true });
    form.setValue("pin", pin, { shouldValidate: true, shouldDirty: true });
    form.clearErrors();
    setAuthError(null);
    clearError();

    try {
      await login(username, pin);
      router.push(targetPath);
    } catch (e: any) {
      setAuthError(e.message || "Erro na validação do terminal");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md chassis-panel p-6 shadow-2xl font-mono">
        {/* Hardware Header with Screws */}
        <div className="chassis-header mb-6">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-[#1b2d4f] to-[#101c2e] border-2 border-[#2dc4a0]/40 p-1.5 shadow-md shadow-[#2dc4a0]/20">
              <img
                src="/logo-ticonta.png"
                alt="TiConta Logo"
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-widest text-white uppercase font-mono">
                  TiConta
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-[#2dc4a0] px-1.5 py-0.5 rounded border border-[#2dc4a0]/30 font-mono">
                  v2 ERP
                </span>
              </div>
              <p className="text-[9px] text-[#4a7a9b] font-mono tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Terminal Autenticado & Fiscal MZ
              </p>
            </div>
          </div>

          <div className="screws-cluster">
            <div className="screw" />
            <div className="screw" />
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {(authError || error) && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300 backdrop-blur">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span>{authError || error}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block">
              IDENTIFICADOR (UTILIZADOR OU EMAIL)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-[#4a7a9b]" />
              <Input
                {...form.register("username")}
                placeholder="Ex: admin_user ou operador_pos"
                className="pl-9 font-mono text-xs text-zinc-100 bg-zinc-900/80 border-zinc-700/80 focus:border-emerald-500"
                autoComplete="username"
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-[11px] text-red-400">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block">
                SENHA OU CÓDIGO PIN
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-[#4a7a9b]" />
              <Input
                {...form.register("pin")}
                type={showPassword ? "text" : "password"}
                maxLength={64}
                placeholder="Palavra-passe ou PIN numérico"
                className="pl-9 pr-10 font-mono text-xs text-zinc-100 bg-zinc-900/80 border-zinc-700/80 focus:border-emerald-500"
                autoComplete="current-password"
              />
            </div>
            {form.formState.errors.pin && (
              <p className="text-[11px] text-red-400">
                {form.formState.errors.pin.message}
              </p>
            )}
          </div>

          {/* Action Enter Key */}
          <Button
            type="submit"
            variant="retro-primary"
            disabled={isLoading}
            className="w-full h-12 text-sm font-black uppercase tracking-widest mt-2 shadow-lg shadow-emerald-950"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A VALIDAR CREDENCIAIS...
              </>
            ) : (
              "ENTRAR NO TERMINAL ↵"
            )}
          </Button>

          {/* Quick Demo Access Buttons */}
          <div className="w-full space-y-2 pt-3 border-t border-[#1c3150] mt-4">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4a7a9b] block text-center">
              /// ACESSO RÁPIDO PARA TESTE / DEMO
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFillAndLogin("admin_user", "1234", "/dashboard")}
                className="key-mechanical key-action p-2 rounded-lg text-center hover:scale-[1.02] transition-transform"
              >
                <span className="text-[10px] font-black uppercase text-zinc-100 block">👤 ADMIN</span>
                <span className="text-[9px] text-[#4a7a9b] font-mono block">admin_user • 1234</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillAndLogin("operador_pos", "4321", "/pos")}
                className="key-mechanical key-op p-2 rounded-lg text-center hover:scale-[1.02] transition-transform"
              >
                <span className="text-[10px] font-black uppercase text-[#2dc4a0] block">🛒 POS CAIXA</span>
                <span className="text-[9px] text-[#2dc4a0]/80 font-mono block">operador_pos • 4321</span>
              </button>
            </div>
          </div>

          {/* Server Config Accordion */}
          <div className="pt-2 border-t border-zinc-800/60 text-center">
            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <Server className="w-3 h-3" />
              <span>{showServerConfig ? "Ocultar Configuração de Servidor" : "Configurar API Backend / Servidor"}</span>
            </button>

            {showServerConfig && (
              <div className="mt-2 p-3 rounded-lg border border-zinc-800 bg-zinc-950/80 text-left space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  URL da API Backend
                </label>
                <div className="flex gap-1.5">
                  <Input
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    placeholder="https://api.ticonta.co.mz"
                    className="text-xs h-8 bg-zinc-900 border-zinc-700"
                  />
                  <Button
                    type="button"
                    onClick={handleSaveApiUrl}
                    className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-500"
                  >
                    Guardar
                  </Button>
                </div>
                {serverSavedMsg && (
                  <p className="text-[10px] text-emerald-400">{serverSavedMsg}</p>
                )}
                <p className="text-[9px] text-zinc-500">
                  Deixe vazio para usar a API padrão ou o modo local/offline automático.
                </p>
              </div>
            )}
          </div>

          <div className="text-center pt-1 text-[9px] text-[#4a7a9b] tracking-wider uppercase">
            TiConta v2 ERP • Máquina Registradora & Gestão Moçambique
          </div>
        </form>
      </div>
    </div>
  );
}

