"use client";

import React from "react";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BillingCycle, PricingPlan } from "@/types/pricing";
import { paymentService } from "@/services/payment";
import Link from "next/link";

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, billingCycle }) => {
  const pricing = paymentService.calculatePrice(plan.monthlyPrice, billingCycle);

  return (
    <Card
      className={`relative flex flex-col justify-between border transition-all duration-200 ${
        plan.popular
          ? "border-emerald-500 bg-zinc-50 shadow-2xl shadow-emerald-950/40 lg:-translate-y-2"
          : "border-zinc-200 bg-white/80 hover:border-zinc-200"
      } text-zinc-900 backdrop-blur`}
    >
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-500 text-zinc-950 font-bold uppercase tracking-wider text-xs px-3 py-1 flex items-center gap-1 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Mais Popular
          </Badge>
        </div>
      )}

      <div>
        <CardHeader className="space-y-2 pt-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {plan.name}
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs min-h-[32px]">
            {plan.tagline}
          </CardDescription>

          <div className="pt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight text-white">
                {pricing.monthlyEquivalent.toLocaleString("pt-MZ")}
              </span>
              <span className="text-sm font-semibold text-emerald-400">MT</span>
              <span className="text-xs text-zinc-500">/mês</span>
            </div>
            {billingCycle === "annual" && (
              <p className="text-xs text-emerald-400 font-medium mt-1">
                Faturado anualmente ({pricing.total.toLocaleString("pt-MZ")} MT/ano)
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            O que está incluído:
          </p>
          <ul className="space-y-2.5 text-xs text-zinc-700">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                {feature.included ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <X className="h-4 w-4 shrink-0 text-zinc-600 mt-0.5" />
                )}
                <span className={feature.included ? "text-zinc-800" : "text-zinc-500 line-through"}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>

      <CardFooter className="pt-6">
        {plan.ctaHref ? (
          <a href={plan.ctaHref} className="w-full">
            <Button
              variant="outline"
              className="w-full border-zinc-200 bg-zinc-800/80 font-medium text-white hover:bg-zinc-700 hover:text-white"
            >
              {plan.ctaText}
            </Button>
          </a>
        ) : (
          <Link
            href={`/checkout?plan=${plan.id}&cycle=${billingCycle}`}
            className="w-full"
          >
            <Button
              className={`w-full font-semibold transition-all ${
                plan.popular
                  ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {plan.ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};
