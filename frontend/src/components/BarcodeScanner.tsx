"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, Flashlight, X, AlertCircle, CheckCircle2, RefreshCw, Keyboard, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, isOpen, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const readerElementId = "html5-barcode-reader";

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setErrorMessage(null);
        const scanner = new Html5Qrcode(readerElementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted && decodedText) {
              onScan(decodedText);
            }
          },
          () => {
            // Callback silencioso por frame não detectado
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err: any) {
        if (isMounted) {
          setIsScanning(false);
          setErrorMessage("Câmara indisponível ou permissão negada. Utilize o código manual.");
          setShowManual(true);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen, onScan]);

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      setIsScanning(false);
      scannerRef.current = null;
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await (scannerRef.current as any).applyVideoConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } catch {}
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 text-white animate-in fade-in duration-200 p-4">
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-emerald-400" />
          <span className="font-bold text-sm tracking-wide">LEITOR DE CÓDIGO DE BARRAS</span>
        </div>

        <div className="flex items-center gap-2">
          {isScanning && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-full border transition-all ${
                torchOn ? "bg-amber-400 text-black border-amber-400" : "bg-zinc-900 border-zinc-700 text-zinc-300"
              }`}
              title="Ligar Lanterna"
            >
              <Flashlight className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center my-4 relative">
        <div
          id={readerElementId}
          className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-zinc-950 relative"
        />

        {/* Guia de Enquadramento */}
        <div className="absolute pointer-events-none w-64 h-36 border-2 border-dashed border-emerald-400/90 rounded-xl flex items-center justify-center">
          <span className="text-[11px] font-mono text-emerald-400/80 bg-black/60 px-2 py-0.5 rounded">
            Alinhe o Código aqui
          </span>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg max-w-xs text-center">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Bottom Controls / Manual Fallback */}
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Teclado Manual</span>
          <button
            onClick={() => setShowManual(!showManual)}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Keyboard className="h-3.5 w-3.5" />
            {showManual ? "Ocultar Teclado" : "Digitar Código"}
          </button>
        </div>

        {showManual && (
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ex: 560123456789 ou SKU-PORTA-01"
              className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600 h-9 text-xs"
              autoFocus
            />
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 px-4 text-xs font-semibold">
              Adicionar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
