"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import { SavingsGroupModule } from "@/components/informal-sales/SavingsGroupModule";

export default function SavingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <SavingsGroupModule />
        </main>
      </div>
    </ProtectedRoute>
  );
}
