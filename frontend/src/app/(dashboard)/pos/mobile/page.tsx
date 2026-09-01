"use client";

import React, { useEffect, useState } from "react";
import { MobileShoppingCart } from "@/components/MobileShoppingCart";
import { Store, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MobilePOSPage() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-MZ", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 flex flex-col justify-between">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200 shadow-sm max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <Link href="/pos" className="p-1 text-zinc-600 hover:text-zinc-900 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5">
            <Store className="h-4 w-4 text-emerald-700" />
            <span className="font-bold text-sm tracking-tight text-zinc-900">TiConta POS Mobile</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-zinc-600 font-mono">
          <Clock className="h-3.5 w-3.5" />
          <span>{time}</span>
        </div>
      </header>

      {/* Main Cart and Scanner Content */}
      <main className="flex-1 max-w-md mx-auto w-full">
        <MobileShoppingCart />
      </main>
    </div>
  );
}
