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
    <div className="brushed-steel-header px-4 py-1.5 border-b border-slate-300 flex items-center justify-between text-xs font-mono text-slate-600 select-none">
      {/* Left: Engine & Sync Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Database size={13} className="text-emerald-700" />
          <span className="font-semibold text-slate-800">{dbType}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-300" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Sincronização:</span>
          {pendingSyncCount > 0 ? (
            <button
              onClick={triggerSync}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] transition"
              title="Clique para sincronizar agora"
            >
              <RefreshCw size={10} className="animate-spin text-amber-600" />
              <span>{pendingSyncCount} pendentes</span>
            </button>
          ) : (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sincronizado ({lastSyncTime})
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-1 text-slate-500">
          <span>PGC-NIRF:</span>
          <span className="text-slate-700 font-semibold">16% IVA ATIVO</span>
        </div>
      </div>

      {/* Right: Network Toggle & Battery Hardware */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOnlineStatus(!isOnline)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-semibold transition ${
            isOnline
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200'
          }`}
          title="Alternar simulação de estado Online/Offline"
        >
          {isOnline ? (
            <>
              <Wifi size={12} className="text-emerald-600" />
              <span>ONLINE (Gateway)</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-amber-700" />
              <span>OFFLINE (IndexedDB)</span>
            </>
          )}
        </button>

        <div className="h-3 w-[1px] bg-slate-300" />

        <div className="flex items-center gap-1 text-slate-700">
          {isCharging ? (
            <BatteryCharging size={13} className="text-emerald-600" />
          ) : (
            <Battery size={13} className="text-slate-600" />
          )}
          <span>{batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
}
