"use client";

import React from "react";
import { MessageSquare, Smartphone, Mail, QrCode, BarChart3, Globe, Headphones, Download, CheckCircle, Lock, Info, Sparkles, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumFeature } from "@/types/premium";

interface PremiumFeatureCardProps {
  feature: PremiumFeature;
  onToggle: (featureName: string, enable: boolean) => void;
  onOpenDetails: (feature: PremiumFeature) => void;
  isLoading?: boolean;
}

export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  feature,
  onToggle,
  onOpenDetails,
  isLoading = false,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "whatsapp_delivery":
        return <MessageSquare className="h-6 w-6 text-emerald-400" />;
      case "sms_delivery":
        return <Smartphone className="h-6 w-6 text-blue-400" />;
      case "email_delivery":
        return <Mail className="h-6 w-6 text-amber-400" />;
      case "barcode_scanner":
        return <QrCode className="h-6 w-6 text-purple-400" />;
      case "advanced_analytics":
        return <BarChart3 className="h-6 w-6 text-cyan-400" />;
      case "api_access":
        return <Globe className="h-6 w-6 text-emerald-300" />;
      case "phone_support":
        return <Headphones className="h-6 w-6 text-pink-400" />;
      default:
        return <Sparkles className="h-6 w-6 text-emerald-400" />;
    }
  };

  return (
    <Card className={`relative flex flex-col justify-between border transition-all duration-200 ${
      feature.enabled
        ? "border-emerald-500/50 bg-white/90 shadow-lg shadow-emerald-950/20"
        : "border-zinc-200 bg-white/80 hover:border-zinc-200"
    }`}>
      {feature.popular && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-[10px] px-2 py-0.5 shadow-md flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Mais Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 shrink-0">
            {getIcon(feature.name)}
          </div>

          <div className="flex flex-col items-end">
            <span className="text-lg font-bold text-white font-mono">
              +{feature.monthly_cost_mzn.toLocaleString("pt-MZ")} <span className="text-xs text-zinc-500 font-normal">MT/mês</span>
            </span>
            <span className="text-[11px] text-zinc-500 capitalize">{feature.category}</span>
          </div>
        </div>

        <CardTitle className="text-base font-bold text-white mt-2 flex items-center gap-2">
          {feature.name.replace(/_/g, " ").toUpperCase()}
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500 line-clamp-2">
          {feature.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80">
          <div className="flex items-center gap-1.5">
            {feature.enabled ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[11px] flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Ativo
              </Badge>
            ) : (
              <Badge className="bg-zinc-800 text-zinc-500 border-zinc-200 text-[11px] flex items-center gap-1">
                <Lock className="h-3 w-3" /> Inativo
              </Badge>
            )}
          </div>

          <button
            onClick={() => onOpenDetails(feature)}
            className="text-xs text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <Info className="h-3.5 w-3.5" /> Saiba Mais
          </button>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-zinc-200/80">
        <Button
          onClick={() => onToggle(feature.name, !feature.enabled)}
          disabled={isLoading}
          variant={feature.enabled ? "outline" : "default"}
          className={`w-full text-xs font-semibold h-9 ${
            feature.enabled
              ? "border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : feature.enabled ? (
            "Desativar Módulo"
          ) : (
            "Ativar por +" + feature.monthly_cost_mzn + " MT"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
