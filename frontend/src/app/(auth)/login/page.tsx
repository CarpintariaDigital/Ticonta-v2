"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, User, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  username: z.string().min(1, "Identificador obrigatório"),
  pin: z.string().min(1, "Senha ou PIN obrigatório"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      {/* POS Terminal Frame */}
      <div className="relative w-full max-w-md bg-[#0e1726]/90 border-2 border-[#1c3150] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl">
        
        {/* Terminal Header with Clickable Link to Home */}
        <div className="flex items-center justify-between border-b border-[#1c3150] pb-5 mb-6">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer" title="Voltar à página inicial">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-500/10 border border-emerald-500/30 p-1.5 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
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
                <span className="text-base font-black tracking-widest text-white uppercase font-mono group-hover:text-emerald-400 transition-colors">
                  TiConta
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-[#2dc4a0] px-1.5 py-0.5 rounded border border-[#2dc4a0]/30 font-mono">
                  v2 ERP
                </span>
              </div>
              <p className="text-[9px] text-[#4a7a9b] font-mono tracking-wider uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Terminal Autenticado & Fiscal MZ
              </p>
            </div>
          </Link>

          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500/60 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#1c3150]" />
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {(authError || error) && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300 backdrop-blur">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span>{authError || error}</span>
              </div>
            </div>
          )}

          {/* Identifier Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block font-mono">
              Identificador (Utilizador ou Email)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-[#4a7a9b]" />
              <Input
                {...form.register("username")}
                placeholder="Ex: admin ou operador_pos"
                className="pl-9 h-11 font-mono text-xs text-zinc-100 bg-zinc-900/80 border-zinc-700/80 focus:border-emerald-500 focus:ring-emerald-500/20"
                autoComplete="username"
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-[11px] text-red-400">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          {/* PIN / Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block font-mono">
                Senha ou Código PIN
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
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-[#4a7a9b]" />
              <Input
                {...form.register("pin")}
                type={showPassword ? "text" : "password"}
                maxLength={64}
                placeholder="Palavra-passe ou PIN numérico"
                className="pl-9 pr-10 h-11 font-mono text-xs text-zinc-100 bg-zinc-900/80 border-zinc-700/80 focus:border-emerald-500 focus:ring-emerald-500/20"
                autoComplete="current-password"
              />
            </div>
            {form.formState.errors.pin && (
              <p className="text-[11px] text-red-400">
                {form.formState.errors.pin.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-xs font-black uppercase tracking-widest mt-4 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all duration-200"
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
              className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-900/30 transition-all text-xs text-emerald-400 group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Tem uma Chave de Licença TiConta?</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                Ativar Aqui →
              </span>
            </Link>
          </div>


          {/* Footer Branding */}
          <div className="text-center pt-4 border-t border-[#1c3150]/60 text-[9px] text-[#4a7a9b] tracking-wider uppercase font-mono">
            TiConta v2 ERP • Máquina Registradora & Gestão Moçambique
          </div>
        </form>
      </div>
    </div>
  );
}
