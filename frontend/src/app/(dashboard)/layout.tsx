"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <DashboardNavbar />
        <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
