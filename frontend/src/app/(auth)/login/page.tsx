"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, User, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/90 backdrop-blur text-zinc-100 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-emerald-500/30 p-1.5 shadow-xl shadow-emerald-500/20">
            <img
              src="/logo-ticonta.png"
              alt="TiConta Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-black tracking-tight text-white">
              TiConta <span className="text-emerald-400">v2 ERP</span>
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">
              Plataforma Integrada de Gestão & Contabilidade PGC Moçambique
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {(authError || error) && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError || error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Utilizador
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  {...form.register("username")}
                  placeholder="Ex: operador1"
                  className="bg-zinc-950 border-zinc-800 pl-9 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  autoComplete="username"
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Código PIN
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  {...form.register("pin")}
                  type="password"
                  maxLength={10}
                  placeholder="••••"
                  className="bg-zinc-950 border-zinc-800 pl-9 tracking-widest text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                  autoComplete="current-password"
                />
              </div>
              {form.formState.errors.pin && (
                <p className="text-xs text-red-400">
                  {form.formState.errors.pin.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 shadow-lg shadow-emerald-900/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A autenticar...
                </>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>

            {/* Quick Demo Logins for Testing */}
            <div className="w-full space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block text-center">
                ⚡ Acesso Rápido para Demonstração & Teste
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
                  className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs py-2 h-auto flex flex-col items-center gap-0.5 rounded-xl"
                >
                  <span className="font-bold">👤 Administrador</span>
                  <span className="text-[10px] text-zinc-400 font-mono">admin_user • 1234</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
                  className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs py-2 h-auto flex flex-col items-center gap-0.5 rounded-xl"
                >
                  <span className="font-bold">🛒 Operador POS</span>
                  <span className="text-[10px] text-zinc-400 font-mono">operador_pos • 4321</span>
                </Button>
              </div>
            </div>

            <p className="text-center text-[11px] text-zinc-500 pt-1">
              TiConta v2 ERP • Offline-First Moçambique
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
