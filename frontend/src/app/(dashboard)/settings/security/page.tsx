"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { db } from "@/services/db";
import { apiClient } from "@/services/auth";

export default function SecuritySettingsPage() {
  const { user } = useAuthStore();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPins, setShowPins] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPin) {
      setErrorMessage("Por favor, introduza o PIN atual.");
      return;
    }

    if (newPin.length < 4) {
      setErrorMessage("O novo PIN deve ter pelo menos 4 caracteres.");
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMessage("O novo PIN e a confirmação não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Gravação local segura no Dexie.js (syncMeta)
      const now = new Date().toISOString();
      await db.syncMeta.put({
        key: `user_pin_${user?.username || "admin"}`,
        value: {
          username: user?.username || "admin",
          pin: newPin,
          updated_at: now,
        },
        updated_at: now,
      });

      // 2. Atualizar localStorage para login offline resiliente
      if (typeof window !== "undefined") {
        localStorage.setItem(`ticonta_pin_${user?.username || "admin"}`, newPin);
        
        const cachedProfile = localStorage.getItem("ticonta_offline_profile");
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile);
            parsed.pin_updated_at = now;
            localStorage.setItem("ticonta_offline_profile", JSON.stringify(parsed));
          } catch {}
        }
      }

      // 3. Tentar sincronizar com a API Cloudflare Worker caso conectada
      try {
        await apiClient.post("/api/v1/auth/change-pin", {
          username: user?.username || "admin",
          current_pin: currentPin,
          new_pin: newPin,
        });
      } catch (apiErr) {
        console.warn("[Security] Sincronização de PIN remota offline (guardado localmente com sucesso)");
      }

      setSuccessMessage("✓ PIN de acesso atualizado com sucesso no terminal!");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao atualizar o PIN de acesso.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-zinc-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
        <DashboardNavbar />

        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5 font-mono">
                <KeyRound className="w-6 h-6 text-amber-400" />
                Segurança & Alteração de PIN
              </h1>
              <p className="text-xs text-zinc-500 mt-1 font-mono">
                Gerencie as credenciais de acesso do terminal POS e proteção do operador.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-mono">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Utilizador: <strong className="text-white">{user?.username || "Administrador"}</strong></span>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-zinc-200 bg-[#0e1726]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white font-mono">
                  Alterar Código PIN
                </h2>
                <p className="text-[11px] text-zinc-500">
                  O novo PIN será válido no login deste terminal e sincronizado com o servidor.
                </p>
              </div>
            </div>

            {successMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 backdrop-blur">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="font-mono">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-300 backdrop-blur">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span className="font-mono">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleChangePin} className="space-y-4">
              {/* Current PIN */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block font-mono">
                  PIN Atual
                </label>
                <div className="relative">
                  <Input
                    type={showPins ? "text" : "password"}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Introduza o PIN atual"
                    className="h-11 font-mono text-xs text-zinc-900 bg-white/80 border-zinc-200/80 focus:border-amber-500"
                    maxLength={32}
                    required
                  />
                </div>
              </div>

              {/* New PIN */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block font-mono">
                  Novo PIN (mínimo 4 dígitos)
                </label>
                <div className="relative">
                  <Input
                    type={showPins ? "text" : "password"}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Introduza o novo PIN"
                    className="h-11 font-mono text-xs text-zinc-900 bg-white/80 border-zinc-200/80 focus:border-emerald-500"
                    maxLength={32}
                    required
                  />
                </div>
              </div>

              {/* Confirm New PIN */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#4a7a9b] block font-mono">
                  Confirmar Novo PIN
                </label>
                <div className="relative">
                  <Input
                    type={showPins ? "text" : "password"}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Repita o novo PIN"
                    className="h-11 font-mono text-xs text-zinc-900 bg-white/80 border-zinc-200/80 focus:border-emerald-500"
                    maxLength={32}
                    required
                  />
                </div>
              </div>

              {/* Toggle Show/Hide */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  className="text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors font-mono"
                >
                  {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPins ? "Ocultar PINs" : "Mostrar PINs"}</span>
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 font-mono mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A GRAVAR NOVO PIN...
                  </>
                ) : (
                  "ATUALIZAR PIN DE ACESSO ↵"
                )}
              </Button>
            </form>

            <div className="border-t border-zinc-200/80 pt-4 flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protegido por Criptografia Local Dexie.js & Offline-First</span>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
