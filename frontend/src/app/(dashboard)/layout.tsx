"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/layout/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPos = pathname?.startsWith("/pos");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {!isPos && <DashboardNavbar />}
        <div className={isPos ? "flex-1 w-full h-screen overflow-hidden" : "flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full"}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
