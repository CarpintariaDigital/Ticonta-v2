"use client";

import { useState } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { useSync } from "@/hooks/useSync";
import { Button } from "@/components/ui/button";

export default function SyncStatus() {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTimestamp,
    lastError,
    recentLogs,
    syncNow,
    clearQueue,
  } = useSync();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Mini Status Badge / Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
          isOnline
            ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40"
            : "border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40"
        }`}
      >
        {isOnline ? (
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 text-amber-400" />
        )}

        <span>{isOnline ? "Online" : "Offline"}</span>

        {pendingCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
            {pendingCount}
          </span>
        )}

        {isSyncing ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400 ml-1" />
        ) : isOpen ? (
          <ChevronUp className="h-3 w-3 text-zinc-400" />
        ) : (
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        )}
      </button>

      {/* Expanded Sync Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <h4 className="text-xs font-bold text-white">SyncEngine TiConta v2</h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {pendingCount} pendente(s)
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1 text-xs text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-400">Estado de Rede:</span>
              <span className={isOnline ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {isOnline ? "Conectado ao Servidor Central" : "Sem Internet (Modo Local)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Última Sincronização:</span>
              <span className="font-mono text-zinc-200">
                {lastSyncTimestamp
                  ? new Date(lastSyncTimestamp).toLocaleTimeString("pt-MZ")
                  : "Nunca"}
              </span>
            </div>
          </div>

          {lastError && (
            <div className="flex items-start gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-[11px] text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="truncate">{lastError}</span>
            </div>
          )}

          {/* Activity Logs */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Histórico Recente
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-950 p-2 text-[11px] font-mono">
              {recentLogs.length === 0 ? (
                <div className="text-center text-zinc-600 text-[10px] py-1">
                  Nenhuma atividade registrada
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-zinc-400">
                    <div className="flex items-center gap-1 truncate pr-2">
                      {log.status === "success" ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="h-3 w-3 text-zinc-500 shrink-0" />
                      )}
                      <span className="truncate text-zinc-300">{log.message}</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 shrink-0">{log.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1 gap-2">
            {pendingCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearQueue}
                className="text-zinc-500 hover:text-red-400 hover:bg-zinc-800 text-[11px] h-7 px-2"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}

            <Button
              size="sm"
              disabled={isSyncing || !isOnline}
              onClick={syncNow}
              className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-7"
            >
              <RefreshCw className={`h-3 w-3 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "A sincronizar..." : "Sincronizar Agora"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
