"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, User, Lock, Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

const registerSchema = z.object({
  username: z.string().min(3, "Nome de utilizador deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  pin: z.string().min(4, "O PIN deve ter pelo menos 4 dígitos").max(10, "Máximo de 10 dígitos"),
  role: z.string(),
});

type RegisterFormValues = {
  username: string;
  email?: string;
  pin: string;
  role: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      pin: "",
      role: "operator",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setRegError(null);
    clearError();
    try {
      await registerUser(
        values.username,
        values.pin,
        values.role,
        values.email || undefined
      );
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setRegError(err.message || "Erro ao registrar utilizador");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5] px-4 font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-100/50 via-[#FAF8F5] to-[#FAF8F5] pointer-events-none" />

      <Card className="w-full max-w-md border-emerald-900/10 bg-white/90 backdrop-blur text-zinc-900 shadow-xl rounded-3xl relative">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-emerald-950">
            Criar Utilizador
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            Registe um novo operador ou administrador no TiConta v2 ERP
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4 text-center py-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-bounce" />
            </div>
            <p className="text-sm font-semibold text-emerald-800">
              Utilizador registado com sucesso! A redirecionar para login...
            </p>
          </CardContent>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {(regError || error) && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{regError || error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 font-mono">
                  Nome de Utilizador
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    {...form.register("username")}
                    placeholder="Ex: joao.silva"
                    className="bg-white border-zinc-300 pl-9 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-600 rounded-xl"
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 font-mono">
                  Email (Opcional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="joao@empresa.co.mz"
                    className="bg-white border-zinc-300 pl-9 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-600 rounded-xl"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 font-mono">
                  Código PIN de Acesso
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    {...form.register("pin")}
                    type="password"
                    maxLength={10}
                    placeholder="••••"
                    className="bg-white border-zinc-300 pl-9 tracking-widest text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-600 rounded-xl font-mono"
                  />
                </div>
                {form.formState.errors.pin && (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.pin.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md font-mono"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A criar conta...
                  </>
                ) : (
                  "Concluir Registo"
                )}
              </Button>
              <div className="text-center text-xs text-zinc-500">
                Já tem conta?{" "}
                <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                  Entrar no Terminal
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
