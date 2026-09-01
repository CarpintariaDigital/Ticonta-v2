"use client";

import { SalesReportData } from "@/types/reports";
import { DollarSign, ShoppingCart, Tag, UserCheck, TrendingUp } from "lucide-react";

interface SalesReportViewProps {
  data: SalesReportData;
}

export default function SalesReportView({ data }: SalesReportViewProps) {
  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
          <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
            Faturação Total (Receita)
          </span>
          <p className="text-xl font-black text-white mt-1">
            {Number(data.total_revenue).toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
          <span className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">
            Volume de Vendas (Recibos)
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShoppingCart className="h-5 w-5" />
            {data.total_sales_count} vendas
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
          <span className="text-[11px] text-blue-400 font-medium uppercase tracking-wider">Ticket Médio</span>
          <p className="text-xl font-black text-white mt-1">
            {Number(data.average_ticket).toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
          <span className="text-[11px] text-purple-400 font-medium uppercase tracking-wider">IVA Apurado</span>
          <p className="text-xl font-black text-white mt-1">
            {Number(data.total_tax_collected).toLocaleString("pt-MZ")}{" "}
            <span className="text-xs font-normal text-zinc-500">MZN</span>
          </p>
        </div>
      </div>

      {/* Payment Methods & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-200 pb-2">
            Vendas por Método de Pagamento
          </h4>
          <div className="space-y-3">
            {Object.entries(data.payment_methods_breakdown).map(([method, amt]) => {
              const pct = data.total_revenue > 0 ? (Number(amt) / Number(data.total_revenue)) * 100 : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-700 uppercase font-semibold">{method}</span>
                    <span className="text-white font-bold">
                      {Number(amt).toLocaleString("pt-MZ")} MZN ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 Products */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-200 pb-2">
            Produtos Mais Vendidos (Top Faturamento)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs text-zinc-700">
              <thead className="text-[10px] uppercase text-zinc-500 font-mono">
                <tr>
                  <th className="py-1.5">Produto</th>
                  <th className="py-1.5 text-center">Qtd</th>
                  <th className="py-1.5 text-right">Receita Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {data.top_products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-zinc-50/40">
                    <td className="py-2 font-medium text-white line-clamp-1">{p.name}</td>
                    <td className="py-2 text-center font-mono">{p.quantity}</td>
                    <td className="py-2 text-right font-mono font-bold text-emerald-400">
                      {Number(p.revenue).toLocaleString("pt-MZ")} MZN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
