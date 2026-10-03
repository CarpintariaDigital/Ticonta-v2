'use client';

import React from 'react';
import { Wifi, WifiOff, Database, Battery, BatteryCharging, RefreshCw } from 'lucide-react';
import { useSyncStore } from '@/store/syncStore';

export function TelemetryBar() {
  const {
    isOnline,
    dbType,
    pendingSyncCount,
    lastSyncTime,
    batteryLevel,
    isCharging,
    triggerSync,
    setOnlineStatus,
  } = useSyncStore();

  return (
    <div className="brushed-steel-header px-3 sm:px-4 py-1 border-b border-slate-300 flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-600 select-none gap-2 overflow-x-auto no-scrollbar">
      {/* Left: Engine & Sync Status */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5" title={`Motor Local: ${dbType}`}>
          <Database size={13} className="text-emerald-700 shrink-0" />
          <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">{dbType}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-300" />

        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-slate-500 hidden sm:inline">Sincronização:</span>
          {pendingSyncCount > 0 ? (
            <button
              onClick={triggerSync}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] sm:text-[11px] transition"
              title="Clique para sincronizar agora"
            >
              <RefreshCw size={10} className="animate-spin text-amber-600 shrink-0" />
              <span>{pendingSyncCount} <span className="hidden xs:inline">pendentes</span></span>
            </button>
          ) : (
            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[10px] sm:text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>Sync <span className="hidden sm:inline">({lastSyncTime})</span></span>
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-1 text-slate-500">
          <span>PGC-NIRF:</span>
          <span className="text-slate-700 font-semibold">16% IVA ATIVO</span>
        </div>
      </div>

      {/* Right: Network Toggle & Battery Hardware */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={() => setOnlineStatus(!isOnline)}
          className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded border text-[10px] sm:text-[11px] font-semibold transition ${
            isOnline
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200'
          }`}
          title="Alternar simulação de estado Online/Offline"
        >
          {isOnline ? (
            <>
              <Wifi size={12} className="text-emerald-600 shrink-0" />
              <span>ONLINE <span className="hidden sm:inline">(Gateway)</span></span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-amber-700 shrink-0" />
              <span>OFFLINE <span className="hidden sm:inline">(IndexedDB)</span></span>
            </>
          )}
        </button>

        <div className="h-3 w-[1px] bg-slate-300" />

        <div className="flex items-center gap-1 text-slate-700">
          {isCharging ? (
            <BatteryCharging size={13} className="text-emerald-600 shrink-0" />
          ) : (
            <Battery size={13} className="text-slate-600 shrink-0" />
          )}
          <span>{batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
}
