import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'TiConta v2 ERP — Workstation Industrial & Faturação 100% Digital',
  description: 'Sistema ERP industrial de alta precisão para Moçambique. Zero papel, faturação WhatsApp/SMS, PGC-NIRF e IVA 16% em modo offline-first.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TiConta v2',
  },
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="bg-slate-100 text-slate-900 min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
