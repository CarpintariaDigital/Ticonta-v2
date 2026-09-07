"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, User, KeyRound, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "O identificador é obrigatório"),
  pin: z.string().min(1, "A senha ou PIN é obrigatório"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      pin: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError(null);
      await login(values.username, values.pin);
      
      const normalized = values.username.toLowerCase();
      if (normalized.includes("pos") || normalized.includes("operador")) {
        router.push("/pos");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Credenciais inválidas. Verifique o identificador e a senha.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF8F5] font-sans selection:bg-emerald-600 selection:text-white relative">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-100/50 via-[#FAF8F5] to-[#FAF8F5] pointer-events-none" />

      {/* POS Terminal Frame (Ivory Glassmorphic Card) */}
      <div className="relative w-full max-w-md bg-white/85 border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-950/5 backdrop-blur-xl">
        
        {/* Terminal Header with Clickable Link to Home */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-5 mb-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer" title="Voltar à página inicial">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-600/30 p-1.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Image
                src="/LOGO-TICONTA.png"
                alt="TiConta Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-widest text-emerald-950 uppercase font-mono group-hover:text-emerald-700 transition-colors">
                  TiConta
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300 font-mono">
                  v2 ERP
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Terminal Autenticado & Fiscal MZ
              </p>
            </div>
          </Link>

          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {(authError || error) && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span>{authError || error}</span>
              </div>
            </div>
          )}

          {/* Identifier Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 block font-mono">
              Identificador (Utilizador ou Email)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                {...form.register("username")}
                placeholder="Ex: admin ou operador_pos"
                className="pl-9 h-11 font-mono text-xs text-zinc-900 bg-white border-zinc-300 focus:border-emerald-600 focus:ring-emerald-600/20 rounded-xl"
                autoComplete="username"
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-[11px] text-red-600">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          {/* PIN / Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 block font-mono">
                Senha ou Código PIN
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-zinc-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                {...form.register("pin")}
                type={showPassword ? "text" : "password"}
                maxLength={64}
                placeholder="Palavra-passe ou PIN numérico"
                className="pl-9 pr-10 h-11 font-mono text-xs text-zinc-900 bg-white border-zinc-300 focus:border-emerald-600 focus:ring-emerald-600/20 rounded-xl"
                autoComplete="current-password"
              />
            </div>
            {form.formState.errors.pin && (
              <p className="text-[11px] text-red-600">
                {form.formState.errors.pin.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-xs font-black uppercase tracking-widest mt-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all duration-200 font-mono"
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

          {/* Link para Ativação de Licença */}
          <div className="pt-2">
            <Link
              href="/license-activation"
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60 transition-all text-xs text-emerald-900 group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-semibold text-emerald-950">Tem uma Chave de Licença TiConta?</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-lg group-hover:bg-emerald-800 transition-colors">
                Ativar Aqui →
              </span>
            </Link>
          </div>

          {/* Footer Branding */}
          <div className="text-center pt-4 border-t border-emerald-900/10 text-[9px] text-zinc-500 tracking-wider uppercase font-mono">
            TiConta v2 ERP • Máquina Registradora & Gestão Moçambique
          </div>
        </form>
      </div>
    </div>
  );
}
