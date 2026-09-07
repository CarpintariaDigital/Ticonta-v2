'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { TelemetryBar } from '@/components/layout/TelemetryBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Workstation Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TelemetryBar />
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
