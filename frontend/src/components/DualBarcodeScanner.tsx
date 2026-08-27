"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Camera,
  Flashlight,
  X,
  AlertCircle,
  CheckCircle2,
  PackagePlus,
  ShoppingCart,
  QrCode,
  Keyboard,
  Plus,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/pos";
import { posService } from "@/services/pos";

interface DualBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSold?: (product: Product) => void;
  onStockUpdated?: (product: Product) => void;
  initialMode?: "venda" | "stock";
}

export const DualBarcodeScanner: React.FC<DualBarcodeScannerProps> = ({
  isOpen,
  onClose,
  onProductSold,
  onStockUpdated,
  initialMode = "venda",
}) => {
  const [mode, setMode] = useState<"venda" | "stock">(initialMode);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // Stock Entry Form State
  const [stockQty, setStockQty] = useState<number>(1);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Geral");
  const [newSellingPrice, setNewSellingPrice] = useState<number>(100);
  const [newCostPrice, setNewCostPrice] = useState<number>(70);
  const [isRegistering, setIsRegistering] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isBlockedRef = useRef(false);
  const readerElementId = "dual-camera-barcode-reader";

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetScanState();
      return;
    }

    let isMounted = true;

    const startCamera = async () => {
      try {
        setStatusMessage(null);
        const scanner = new Html5Qrcode(readerElementId);
        scannerRef.current = scanner;

        const config = {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted && !isBlockedRef.current) {
              handleCodeDetected(decodedText);
            }
          },
          () => {}
        );

        if (isMounted) setIsScanning(true);
      } catch (err) {
        if (isMounted) {
          setIsScanning(false);
          setStatusMessage({
            text: "Câmara não disponível ou permissão pendente. Use o teclado manual abaixo.",
            type: "info",
          });
          setShowManualInput(true);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      setIsScanning(false);
      scannerRef.current = null;
    }
  };

  const resetScanState = () => {
    setLastScannedCode(null);
    setFoundProduct(null);
    setStatusMessage(null);
    setStockQty(1);
    setNewProductName("");
    setIsRegistering(false);
  };

  const handleCodeDetected = async (barcode: string) => {
    isBlockedRef.current = true;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }

    setLastScannedCode(barcode);

    try {
      const product = await posService.findProductByBarcode(barcode);

      if (mode === "venda") {
        if (product) {
          setFoundProduct(product);
          setStatusMessage({
            text: `✓ ${product.name} adicionado ao carrinho (${product.unit_price.toFixed(2)} MT)`,
            type: "success",
          });
          if (onProductSold) {
            onProductSold(product);
          }
        } else {
          setFoundProduct(null);
          setStatusMessage({
            text: `Artigo com código ${barcode} não encontrado. Alterne para Modo Stock para cadastrar.`,
            type: "error",
          });
        }
      } else {
        // Mode: Stock
        if (product) {
          setFoundProduct(product);
          setNewProductName(product.name);
          setNewSellingPrice(product.unit_price);
          setNewCostPrice(product.cost_price || 0);
          setStatusMessage({
            text: `Produto localizado: ${product.name} (Stock atual: ${product.quantity})`,
            type: "info",
          });
        } else {
          setFoundProduct(null);
          setNewProductName("");
          setIsRegistering(true);
          setStatusMessage({
            text: `Novo código detectado: ${barcode}. Preencha os dados para registar no inventário.`,
            type: "info",
          });
        }
      }
    } catch {
      setStatusMessage({ text: "Erro ao consultar produto.", type: "error" });
    }

    // Debounce to prevent repeated rapid scans
    setTimeout(() => {
      isBlockedRef.current = false;
    }, 1800);
  };

  const handleConfirmStockUpdate = async () => {
    if (!lastScannedCode) return;

    try {
      const result = await posService.addStockByBarcode(
        lastScannedCode,
        stockQty,
        newCostPrice,
        newSellingPrice,
        newProductName || undefined
      );

      setStatusMessage({
        text: `✓ Stock de ${result.product.name} atualizado para ${result.product.quantity} un.`,
        type: "success",
      });

      if (onStockUpdated) {
        onStockUpdated(result.product);
      }

      setFoundProduct(result.product);
      setIsRegistering(false);
      setStockQty(1);
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Erro ao atualizar stock.", type: "error" });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 text-zinc-100 p-4 backdrop-blur-md font-mono selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <QrCode className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-black text-xs uppercase tracking-wider text-white">
              Leitor Barcode & QR Code
            </h3>
            <p className="text-[10px] text-zinc-400">Câmara Traseira HD / Mobile</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isScanning && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2 rounded-lg border transition-all ${
                torchOn
                  ? "bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/30"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white"
              }`}
              title="Lanterna"
            >
              <Flashlight className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="w-full max-w-md my-2">
        <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setMode("venda");
              resetScanState();
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "venda"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Modo Venda (POS)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("stock");
              resetScanState();
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              mode === "stock"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-950"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Modo Stock / Entrada</span>
          </button>
        </div>
      </div>

      {/* Camera Viewport & Overlay */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center my-1 relative overflow-hidden">
        <div
          id={readerElementId}
          className="w-full max-w-[320px] aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/70 shadow-2xl bg-zinc-950 relative"
        />

        {/* Framing Guide */}
        <div className="absolute pointer-events-none w-64 h-32 border-2 border-dashed border-emerald-400 rounded-xl flex flex-col items-center justify-center bg-emerald-500/5">
          <div className="w-full h-0.5 bg-emerald-400/80 shadow-[0_0_10px_#10b981] animate-pulse mb-2" />
          <span className="text-[10px] font-mono text-emerald-300 bg-black/80 px-2 py-0.5 rounded border border-emerald-500/30">
            Aponte ao Código de Barras / QR Code
          </span>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          className={`w-full max-w-md p-2.5 rounded-xl border text-xs font-bold text-center my-2 transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : statusMessage.type === "error"
              ? "bg-red-950/80 border-red-500/50 text-red-300"
              : "bg-blue-950/80 border-blue-500/50 text-blue-300"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Stock Entry & Action Panel (when in Stock Mode or when a product is scanned) */}
      {mode === "stock" && lastScannedCode && (
        <div className="w-full max-w-md bg-zinc-900/95 border border-zinc-800 rounded-2xl p-3.5 space-y-3 mb-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Código Lido:</span>
              <p className="text-xs font-black text-emerald-400">{lastScannedCode}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {foundProduct ? `Stock Atual: ${foundProduct.quantity} un.` : "Novo Produto"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Qtd a Adicionar</label>
              <div className="flex items-center gap-1 mt-1">
                <Input
                  type="number"
                  min={1}
                  value={stockQty}
                  onChange={(e) => setStockQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-8 text-xs font-bold bg-zinc-950 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase">Preço Venda (MT)</label>
              <Input
                type="number"
                step="0.01"
                value={newSellingPrice}
                onChange={(e) => setNewSellingPrice(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs font-bold bg-zinc-950 border-zinc-700 text-emerald-400 mt-1"
              />
            </div>
          </div>

          {!foundProduct && (
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase">Nome do Produto</label>
                <Input
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ex: Arroz 25kg / Óleo 5L"
                  className="h-8 text-xs bg-zinc-950 border-zinc-700 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Preço Custo (MT)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs bg-zinc-950 border-zinc-700 text-zinc-300 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Categoria</label>
                  <Input
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="h-8 text-xs bg-zinc-950 border-zinc-700 text-zinc-300 mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleConfirmStockUpdate}
            className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-950"
          >
            <Check className="w-4 h-4 mr-1.5" />
            {foundProduct ? `Adicionar +${stockQty} ao Stock` : "Cadastrar Artigo & Criar Stock"}
          </Button>
        </div>
      )}

      {/* Manual Fallback & Keyboard Entry */}
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
            Digitação Manual
          </span>
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-[11px] text-emerald-400 hover:underline font-bold"
          >
            {showManualInput ? "Fechar Teclado" : "Digitar Código"}
          </button>
        </div>

        {showManualInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) {
                handleCodeDetected(manualCode.trim());
                setManualCode("");
              }
            }}
            className="flex gap-2 mt-2"
          >
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ex: 560123456789 ou SKU-CIM-01"
              className="h-9 text-xs bg-zinc-950 border-zinc-700 text-white"
              autoFocus
            />
            <Button
              type="submit"
              className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
            >
              Processar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
