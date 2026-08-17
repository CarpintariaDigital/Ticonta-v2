"use client";

import { useState } from "react";
import { Scissors, Plus, Trash2, LayoutGrid, CheckCircle2, AlertTriangle } from "lucide-react";
import { CuttingPlanInput, CuttingPlanResult, PieceInput } from "@/types/manufacturing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CuttingPlannerProps {
  onCalculate: (input: CuttingPlanInput) => Promise<CuttingPlanResult>;
}

export default function CuttingPlanner({ onCalculate }: CuttingPlannerProps) {
  const [sheetLength, setSheetLength] = useState("2750");
  const [sheetWidth, setSheetWidth] = useState("1830");
  const [bladeThickness, setBladeThickness] = useState("4");
  const [pieces, setPieces] = useState<PieceInput[]>([
    { name: "Tampo Superior", length: 1200, width: 600, quantity: 2 },
    { name: "Lateral Esquerda", length: 800, width: 600, quantity: 2 },
    { name: "Lateral Direita", length: 800, width: 600, quantity: 2 },
    { name: "Prateleira Interna", length: 1164, width: 550, quantity: 4 },
  ]);

  const [pieceName, setPieceName] = useState("");
  const [pieceLen, setPieceLen] = useState("");
  const [pieceWid, setPieceWid] = useState("");
  const [pieceQty, setPieceQty] = useState("1");
  const [planResult, setPlanResult] = useState<CuttingPlanResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAddPiece = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseFloat(pieceLen);
    const w = parseFloat(pieceWid);
    const q = parseInt(pieceQty, 10);
    if (!pieceName.trim() || isNaN(l) || isNaN(w) || isNaN(q) || l <= 0 || w <= 0 || q <= 0) return;

    setPieces([...pieces, { name: pieceName.trim(), length: l, width: w, quantity: q }]);
    setPieceName("");
    setPieceLen("");
    setPieceWid("");
    setPieceQty("1");
  };

  const handleRemovePiece = (index: number) => {
    setPieces(pieces.filter((_, idx) => idx !== index));
  };

  const handleOptimize = async () => {
    if (pieces.length === 0) return;
    setIsCalculating(true);
    try {
      const res = await onCalculate({
        sheet_length: parseFloat(sheetLength) || 2750,
        sheet_width: parseFloat(sheetWidth) || 1830,
        blade_thickness: parseFloat(bladeThickness) || 4,
        pieces,
      });
      setPlanResult(res);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Configuration & Pieces Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sheet Dimensions */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-purple-400" />
            Dimensões da Chapa MDF / Madeira
          </h4>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Comprimento (mm)</label>
              <Input
                type="number"
                value={sheetLength}
                onChange={(e) => setSheetLength(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs font-mono"
              />
              <span className="text-[10px] text-zinc-500">Padrão MDF: 2750 mm</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Largura (mm)</label>
              <Input
                type="number"
                value={sheetWidth}
                onChange={(e) => setSheetWidth(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs font-mono"
              />
              <span className="text-[10px] text-zinc-500">Padrão MDF: 1830 mm</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Espessura da Serra (mm)</label>
              <Input
                type="number"
                value={bladeThickness}
                onChange={(e) => setBladeThickness(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-xs font-mono"
              />
              <span className="text-[10px] text-zinc-500">Espaço do corte / kerf (3 a 4mm)</span>
            </div>

            <Button
              onClick={handleOptimize}
              disabled={isCalculating || pieces.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold mt-2"
            >
              <Scissors className="h-3.5 w-3.5 mr-1.5" />
              {isCalculating ? "A otimizar corte..." : "Otimizar Plano de Corte 2D"}
            </Button>
          </div>
        </div>

        {/* Pieces List & Add Form */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Lista de Peças do Móvel / Estrutura ({pieces.reduce((acc, p) => acc + p.quantity, 0)} peças)
            </h4>
          </div>

          {/* Inline Add Form */}
          <form onSubmit={handleAddPiece} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <input
              type="text"
              placeholder="Nome da peça"
              value={pieceName}
              onChange={(e) => setPieceName(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Comp (mm)"
              value={pieceLen}
              onChange={(e) => setPieceLen(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Larg (mm)"
              value={pieceWid}
              onChange={(e) => setPieceWid(e.target.value)}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="flex gap-1.5">
              <input
                type="number"
                min="1"
                placeholder="Qtd"
                value={pieceQty}
                onChange={(e) => setPieceQty(e.target.value)}
                className="w-16 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-white font-mono focus:outline-none text-center"
              />
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-auto flex-1">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>

          {/* Table */}
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full text-left font-sans text-xs text-zinc-300">
              <thead className="text-[10px] uppercase text-zinc-500 font-mono sticky top-0 bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="py-2">Identificação</th>
                  <th className="py-2">Dimensões (mm)</th>
                  <th className="py-2 text-center">Quantidade</th>
                  <th className="py-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {pieces.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40">
                    <td className="py-2 font-medium text-white">{p.name}</td>
                    <td className="py-2 font-mono text-zinc-400">
                      {p.length} × {p.width} mm
                    </td>
                    <td className="py-2 text-center font-mono font-bold text-white">{p.quantity}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleRemovePiece(idx)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cutting Plan Results & Visual 2D Layout */}
      {planResult && (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Resultado da Otimização de Corte 2D
              </h4>
              <span className="text-xs text-zinc-400">
                Total de Chapas Necessárias: <b className="text-white">{planResult.total_sheets_needed} chapa(s)</b>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Aproveitamento: {planResult.efficiency_percentage}%
              </span>
              <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
                Desperdício: {planResult.waste_percentage}%
              </span>
            </div>
          </div>

          {/* SVG Canvas 2D Representation */}
          <div className="space-y-4">
            {Array.from({ length: planResult.total_sheets_needed }).map((_, sheetIdx) => {
              const sheetPieces = planResult.placed_pieces.filter((p) => p.sheet_index === sheetIdx);

              // Aspect ratio calculation for responsive SVG viewBox
              const viewBoxWidth = planResult.sheet_length;
              const viewBoxHeight = planResult.sheet_width;

              return (
                <div key={sheetIdx} className="space-y-2">
                  <span className="text-xs font-bold text-purple-400 block font-mono">
                    Chapa #{sheetIdx + 1} ({planResult.sheet_length} × {planResult.sheet_width} mm)
                  </span>

                  <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 overflow-hidden shadow-inner">
                    <svg
                      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                      className="w-full h-auto max-h-[300px] border border-dashed border-zinc-800 bg-zinc-900/40"
                    >
                      {/* Base sheet background */}
                      <rect
                        x="0"
                        y="0"
                        width={viewBoxWidth}
                        height={viewBoxHeight}
                        fill="#18181b"
                        stroke="#27272a"
                        strokeWidth="2"
                      />

                      {/* Render placed pieces */}
                      {sheetPieces.map((p, pIdx) => (
                        <g key={pIdx}>
                          <rect
                            x={p.x}
                            y={p.y}
                            width={p.length}
                            height={p.width}
                            fill="#0284c7"
                            fillOpacity="0.35"
                            stroke="#38bdf8"
                            strokeWidth="2"
                            rx="4"
                          />
                          <text
                            x={p.x + p.length / 2}
                            y={p.y + p.width / 2}
                            fill="#ffffff"
                            fontSize={viewBoxWidth * 0.016}
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {p.name} ({p.length}×{p.width})
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
