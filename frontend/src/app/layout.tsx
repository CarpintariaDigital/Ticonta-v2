import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "TiConta v2 ERP — Gestão & POS Moçambique",
  description: "ERP modular offline-first com compliance fiscal Moçambique (IVA 16%, PGC-NIRF).",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/logo-ticonta.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png" },
    ],
    shortcut: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TiConta",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="light">
      <body className="font-sans antialiased bg-zinc-950 text-zinc-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
