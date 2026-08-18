"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, User, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z.string().min(3, "O nome de utilizador deve ter pelo menos 3 caracteres"),
  pin: z.string().min(4, "O PIN deve ter pelo menos 4 dígitos").max(10, "Máximo de 10 dígitos"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      pin: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    clearError();
    try {
      await login(values.username, values.pin);
      router.push("/dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Credenciais inválidas");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
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
              <p className="text-[9px] text-[#4a7a9b] font-mono tracking-wider uppercase">
                Terminal de Operador MZ
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
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{authError || error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block">
              IDENTIFICADOR DE OPERADOR
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-[#4a7a9b]" />
              <Input
                {...form.register("username")}
                placeholder="Ex: operador_pos"
                className="pl-9 font-mono text-xs text-zinc-100"
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block">
              CÓDIGO PIN (4 DÍGITOS)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-[#4a7a9b]" />
              <Input
                {...form.register("pin")}
                type="password"
                maxLength={10}
                placeholder="••••"
                className="pl-9 tracking-widest font-mono text-xs text-zinc-100"
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
            className="w-full h-12 text-sm font-black uppercase tracking-widest mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A VALIDAR TERMINAL...
              </>
            ) : (
              "ENTRAR NO TERMINAL ↵"
            )}
          </Button>

          {/* Quick Demo Access Buttons */}
          <div className="w-full space-y-2 pt-3 border-t border-[#1c3150] mt-4">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#4a7a9b] block text-center">
              /// ACESSO RÁPIDO PARA TESTE
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  form.setValue("username", "admin_user");
                  form.setValue("pin", "1234");
                  setAuthError(null);
                  clearError();
                  try {
                    await login("admin_user", "1234");
                    router.push("/dashboard");
                  } catch (e: any) {
                    setAuthError(e.message || "Erro no login de teste");
                  }
                }}
                className="key-mechanical key-action p-2 rounded-lg text-center"
              >
                <span className="text-[10px] font-black uppercase text-zinc-100 block">👤 ADMIN</span>
                <span className="text-[9px] text-[#4a7a9b] font-mono block">admin_user • 1234</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  form.setValue("username", "operador_pos");
                  form.setValue("pin", "4321");
                  setAuthError(null);
                  clearError();
                  try {
                    await login("operador_pos", "4321");
                    router.push("/pos");
                  } catch (e: any) {
                    setAuthError(e.message || "Erro no login de teste");
                  }
                }}
                className="key-mechanical key-op p-2 rounded-lg text-center"
              >
                <span className="text-[10px] font-black uppercase text-[#2dc4a0] block">🛒 POS CAIXA</span>
                <span className="text-[9px] text-[#2dc4a0]/80 font-mono block">operador_pos • 4321</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-[9px] text-[#4a7a9b] tracking-wider uppercase">
            TiConta v2 ERP • Máquina Registradora & Gestão Moçambique
          </div>
        </form>
      </div>
    </div>
  );
}

