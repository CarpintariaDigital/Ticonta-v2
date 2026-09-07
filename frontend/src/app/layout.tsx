import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TiConta v2 ERP — Workstation Industrial & Faturação 100% Digital',
  description: 'Sistema ERP industrial de alta precisão para Moçambique. Zero papel, faturação WhatsApp/SMS, PGC-NIRF e IVA 16% em modo offline-first.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-slate-100 text-slate-900 min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
