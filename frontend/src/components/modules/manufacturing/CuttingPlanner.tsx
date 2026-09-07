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
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 shadow-xs">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider border-b border-zinc-200 pb-2 flex items-center gap-2 font-mono">
            <LayoutGrid className="h-4 w-4 text-purple-600" />
            Dimensões da Chapa MDF / Madeira
          </h4>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Comprimento (mm)</label>
              <Input
                type="number"
                value={sheetLength}
                onChange={(e) => setSheetLength(e.target.value)}
                className="bg-white border-zinc-300 text-xs font-mono rounded-xl text-zinc-900"
              />
              <span className="text-[10px] text-zinc-500">Padrão MDF: 2750 mm</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Largura (mm)</label>
              <Input
                type="number"
                value={sheetWidth}
                onChange={(e) => setSheetWidth(e.target.value)}
                className="bg-white border-zinc-300 text-xs font-mono rounded-xl text-zinc-900"
              />
              <span className="text-[10px] text-zinc-500">Padrão MDF: 1830 mm</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Espessura da Serra (mm)</label>
              <Input
                type="number"
                value={bladeThickness}
                onChange={(e) => setBladeThickness(e.target.value)}
                className="bg-white border-zinc-300 text-xs font-mono rounded-xl text-zinc-900"
              />
              <span className="text-[10px] text-zinc-500">Espaço do corte / kerf (3 a 4mm)</span>
            </div>

            <Button
              onClick={handleOptimize}
              disabled={isCalculating || pieces.length === 0}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold mt-2 rounded-xl shadow-xs font-mono"
            >
              <Scissors className="h-3.5 w-3.5 mr-1.5" />
              {isCalculating ? "A otimizar corte..." : "Otimizar Plano de Corte 2D"}
            </Button>
          </div>
        </div>

        {/* Pieces List & Add Form */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
              Lista de Peças do Móvel / Estrutura ({pieces.reduce((acc, p) => acc + p.quantity, 0)} peças)
            </h4>
          </div>

          {/* Inline Add Form */}
          <form onSubmit={handleAddPiece} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
            <Input
              type="text"
              placeholder="Nome da peça"
              value={pieceName}
              onChange={(e) => setPieceName(e.target.value)}
              className="bg-white border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-500 rounded-xl"
            />
            <Input
              type="number"
              placeholder="Comp (mm)"
              value={pieceLen}
              onChange={(e) => setPieceLen(e.target.value)}
              className="bg-white border-zinc-300 text-xs text-zinc-900 font-mono placeholder:text-zinc-500 rounded-xl"
            />
            <Input
              type="number"
              placeholder="Larg (mm)"
              value={pieceWid}
              onChange={(e) => setPieceWid(e.target.value)}
              className="bg-white border-zinc-300 text-xs text-zinc-900 font-mono placeholder:text-zinc-500 rounded-xl"
            />
            <div className="flex gap-1.5">
              <Input
                type="number"
                min="1"
                placeholder="Qtd"
                value={pieceQty}
                onChange={(e) => setPieceQty(e.target.value)}
                className="w-16 bg-white border-zinc-300 text-xs text-zinc-900 font-mono text-center rounded-xl"
              />
              <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-auto flex-1 rounded-xl">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>

          {/* Table */}
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full text-left font-sans text-xs text-zinc-800">
              <thead className="text-[10px] uppercase text-zinc-500 font-mono font-bold sticky top-0 bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="py-2 px-2">Identificação</th>
                  <th className="py-2 px-2">Dimensões (mm)</th>
                  <th className="py-2 px-2 text-center">Quantidade</th>
                  <th className="py-2 px-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {pieces.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50">
                    <td className="py-2 px-2 font-bold text-zinc-900">{p.name}</td>
                    <td className="py-2 px-2 font-mono text-zinc-600">
                      {p.length} × {p.width} mm
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-black text-zinc-900">{p.quantity}</td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => handleRemovePiece(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
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
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
                Resultado da Otimização de Corte 2D
              </h4>
              <span className="text-xs text-zinc-500">
                Total de Chapas Necessárias: <b className="text-zinc-900 font-mono">{planResult.total_sheets_needed} chapa(s)</b>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 font-mono">
                Aproveitamento: {planResult.efficiency_percentage}%
              </span>
              <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full font-mono">
                Desperdício: {planResult.waste_percentage}%
              </span>
            </div>
          </div>

          {/* SVG Canvas 2D Representation */}
          <div className="space-y-4">
            {Array.from({ length: planResult.total_sheets_needed }).map((_, sheetIdx) => {
              const sheetPieces = planResult.placed_pieces.filter((p) => p.sheet_index === sheetIdx);

              const sL = parseFloat(sheetLength) || 2750;
              const sW = parseFloat(sheetWidth) || 1830;

              return (
                <div key={sheetIdx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                    <span>Chapa #{sheetIdx + 1} ({sL}mm × {sW}mm)</span>
                    <span className="text-zinc-500">{sheetPieces.length} peças nesta chapa</span>
                  </div>

                  <div className="border border-zinc-300 bg-zinc-100 rounded-2xl p-2 overflow-x-auto shadow-inner">
                    <svg
                      viewBox={`0 0 ${sL} ${sW}`}
                      className="w-full max-h-[360px] bg-amber-50/50 rounded-xl"
                      style={{ minWidth: "500px" }}
                    >
                      {/* Outer Sheet Border */}
                      <rect
                        x="0"
                        y="0"
                        width={sL}
                        height={sW}
                        fill="#faf5ee"
                        stroke="#d97706"
                        strokeWidth="4"
                      />

                      {/* Placed Pieces */}
                      {sheetPieces.map((p, pIdx) => {
                        const colors = [
                          { fill: "rgba(16, 185, 129, 0.25)", stroke: "#059669" },
                          { fill: "rgba(59, 130, 246, 0.25)", stroke: "#2563eb" },
                          { fill: "rgba(245, 158, 11, 0.25)", stroke: "#d97706" },
                          { fill: "rgba(168, 85, 247, 0.25)", stroke: "#9333ea" },
                          { fill: "rgba(236, 72, 153, 0.25)", stroke: "#db2777" },
                        ];
                        const c = colors[pIdx % colors.length];

                        return (
                          <g key={pIdx}>
                            <rect
                              x={p.x}
                              y={p.y}
                              width={p.width}
                              height={p.length}
                              fill={c.fill}
                              stroke={c.stroke}
                              strokeWidth="3"
                              rx="4"
                            />
                            <text
                              x={p.x + p.width / 2}
                              y={p.y + p.length / 2}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#1e293b"
                              fontSize={Math.max(16, Math.min(p.width, p.length) / 8)}
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {p.name} ({p.width}×{p.length})
                            </text>
                          </g>
                        );
                      })}
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
