"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 text-sm">
      A redirecionar para o painel principal...
    </div>
  );
}
