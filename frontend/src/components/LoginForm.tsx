"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, User, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!username.trim() || username.length < 3) {
      setLocalError("Nome de utilizador deve ter pelo menos 3 caracteres.");
      return;
    }
    if (!pin || pin.length < 4) {
      setLocalError("PIN deve ter pelo menos 4 dígitos.");
      return;
    }

    try {
      await login(username, pin);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setLocalError(err.message || "Credenciais inválidas.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(localError || error) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Utilizador
        </label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ex: operador1"
            className="bg-zinc-950 border-zinc-800 pl-9 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
            autoComplete="username"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Código PIN
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="password"
            maxLength={10}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="bg-zinc-950 border-zinc-800 pl-9 tracking-widest text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500"
            autoComplete="current-password"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-950"
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
    </form>
  );
}
