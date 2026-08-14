import { CheckCircle2, Shield, Wifi, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            TiConta <span className="text-emerald-500">v2</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-400">
            ERP Modular, Offline-First, com Compliance Fiscal para Moçambique.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <Zap className="h-8 w-8 text-emerald-500" />
            <h3 className="font-semibold text-white">Next.js 14</h3>
            <p className="text-sm text-zinc-400">App Router, TypeScript & Server Components.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <Wifi className="h-8 w-8 text-blue-500" />
            <h3 className="font-semibold text-white">Offline-First</h3>
            <p className="text-sm text-zinc-400">Pronto para IndexedDB e Dexie.js sync.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <Shield className="h-8 w-8 text-purple-500" />
            <h3 className="font-semibold text-white">Compliance</h3>
            <p className="text-sm text-zinc-400">Suporte a regulamento de impostos e NUIT.</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Estrutura inicial do frontend configurada com sucesso.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
