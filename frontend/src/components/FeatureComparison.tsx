"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FEATURE_COMPARISON_DATA } from "@/lib/pricing-data";

export const FeatureComparison: React.FC = () => {
  const renderValue = (val: boolean | string) => {
    if (typeof val === "boolean") {
      return val ? (
        <Check className="mx-auto h-4 w-4 text-emerald-400" />
      ) : (
        <X className="mx-auto h-4 w-4 text-zinc-600" />
      );
    }
    return <span className="text-xs text-zinc-700 font-medium">{val}</span>;
  };

  return (
    <Card className="border-zinc-200 bg-white/90 text-zinc-900 shadow-2xl backdrop-blur overflow-hidden">
      <CardHeader className="border-b border-zinc-200 pb-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Comparação Detalhada de Funcionalidades
        </CardTitle>
        <CardDescription className="text-zinc-500">
          Descubra qual o plano que melhor responde às necessidades operacionais da sua empresa
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase text-zinc-500">
                <th className="py-4 px-6 w-2/5">Funcionalidade</th>
                <th className="py-4 px-4 text-center w-3/20">Básico</th>
                <th className="py-4 px-4 text-center w-3/20 text-emerald-400">Profissional</th>
                <th className="py-4 px-4 text-center w-3/20">Completo</th>
                <th className="py-4 px-4 text-center w-3/20">Enterprise</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/50">
              {FEATURE_COMPARISON_DATA.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  {/* Category Row */}
                  <tr className="bg-white/80">
                    <td
                      colSpan={5}
                      className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-emerald-400"
                    >
                      {cat.category}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {cat.features.map((feat, featIdx) => (
                    <tr key={featIdx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="font-medium text-white text-xs">{feat.name}</p>
                        {feat.description && (
                          <p className="text-[11px] text-zinc-500 mt-0.5">{feat.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">{renderValue(feat.basic)}</td>
                      <td className="py-3.5 px-4 text-center bg-emerald-500/5">
                        {renderValue(feat.professional)}
                      </td>
                      <td className="py-3.5 px-4 text-center">{renderValue(feat.complete)}</td>
                      <td className="py-3.5 px-4 text-center">{renderValue(feat.enterprise)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
