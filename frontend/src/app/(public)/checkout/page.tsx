"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, CheckCircle, ArrowLeft, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PRICING_PLANS } from "@/lib/pricing-data";
import { BillingCycle, PricingPlan } from "@/types/pricing";
import { paymentService } from "@/services/payment";
import { useLicenseStore } from "@/store/license.store";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planId = searchParams.get("plan") || "professional";
  const cycle = (searchParams.get("cycle") as BillingCycle) || "annual";

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1]
  );
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(cycle);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa" | "emola">("mpesa");

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [companyNuit, setCompanyNuit] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<{
    licenseKey: string;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { activateLicense } = useLicenseStore();

  const pricing = paymentService.calculatePrice(selectedPlan.monthlyPrice, billingCycle);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const result = await paymentService.processSubscriptionCheckout({
        planId: selectedPlan.id,
        billingCycle,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        companyNuit: companyNuit.trim(),
        paymentMethod,
      });

      if (result.success && result.licenseKey) {
        setCheckoutSuccess({
          licenseKey: result.licenseKey,
          message: result.message || "Pagamento aprovado!",
        });

        // Ativar automaticamente no navegador
        try {
          await activateLicense(result.licenseKey, 1);
        } catch {
          // Ignorar se falhar localmente no checkout
        }
      } else {
        setErrorMsg(result.message || "Erro no processamento.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro no pagamento.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Planos
          </Link>
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Pagamento Seguro & Encriptado
          </div>
        </div>

        {checkoutSuccess ? (
          /* Success Screen */
          <Card className="border-emerald-500/40 bg-zinc-900/90 text-center text-zinc-100 shadow-2xl p-8 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white">
                Subscrição Ativada com Sucesso!
              </CardTitle>
              <CardDescription className="text-zinc-400">
                O seu pagamento foi processado e a chave de licença foi emitida.
              </CardDescription>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 max-w-lg mx-auto text-left space-y-2">
              <span className="text-xs font-semibold uppercase text-zinc-400">A Sua Chave de Licença:</span>
              <p className="font-mono text-sm text-emerald-400 font-bold break-all bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                {checkoutSuccess.licenseKey}
              </p>
              <p className="text-[11px] text-zinc-500">
                Guarde esta chave. Uma cópia foi associada à sua conta TiConta v2.
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button className="bg-emerald-600 font-semibold text-white hover:bg-emerald-500 px-6">
                  Aceder ao Dashboard
                </Button>
              </Link>
              <Link href="/settings/license">
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
                  Ver Detalhes da Licença
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Checkout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">
                    Dados de Faturação & Pagamento
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-xs">
                    Preencha os dados da sua empresa para emissão da licença
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleCheckout}>
                  <CardContent className="space-y-4">
                    {errorMsg && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                        {errorMsg}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300 uppercase">
                        Nome da Empresa / Cliente *
                      </label>
                      <Input
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Carpintaria Moderna Lda"
                        className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300 uppercase">
                          Email para Recibos *
                        </label>
                        <Input
                          required
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="financeiro@empresa.co.mz"
                          className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300 uppercase">
                          NUIT (Opcional)
                        </label>
                        <Input
                          value={companyNuit}
                          onChange={(e) => setCompanyNuit(e.target.value)}
                          placeholder="400123456"
                          maxLength={9}
                          className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                        />
                      </div>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-medium text-zinc-300 uppercase">
                        Método de Pagamento
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("mpesa")}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                            paymentMethod === "mpesa"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Smartphone className="h-5 w-5 mb-1 text-red-500" />
                          M-Pesa
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("emola")}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                            paymentMethod === "emola"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Smartphone className="h-5 w-5 mb-1 text-amber-500" />
                          E-Mola
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                            paymentMethod === "card"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                              : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <CreditCard className="h-5 w-5 mb-1 text-blue-400" />
                          Cartão / Visa
                        </button>
                      </div>
                    </div>

                    {(paymentMethod === "mpesa" || paymentMethod === "emola") && (
                      <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-medium text-zinc-300 uppercase">
                          Número {paymentMethod === "mpesa" ? "M-Pesa (84/85)" : "E-Mola (86/87)"}
                        </label>
                        <Input
                          value={mpesaNumber}
                          onChange={(e) => setMpesaNumber(e.target.value)}
                          placeholder="+258 84 123 4567"
                          className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
                        />
                        <p className="text-[11px] text-zinc-500">
                          Receberá um pedido de confirmação com o PIN no seu telemóvel.
                        </p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500 py-2.5"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A processar pagamento...
                        </>
                      ) : (
                        `Pagar ${pricing.total.toLocaleString("pt-MZ")} MT`
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-xl">
                <CardHeader className="border-b border-zinc-800 pb-4">
                  <CardTitle className="text-base font-bold text-white">Resumo da Encomenda</CardTitle>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white text-sm uppercase">Plano {selectedPlan.name}</p>
                      <p className="text-zinc-500">
                        {billingCycle === "annual" ? "Subscrição Anual (-10%)" : "Subscrição Mensal"}
                      </p>
                    </div>
                    <span className="font-mono text-sm text-white font-bold">
                      {pricing.total.toLocaleString("pt-MZ")} MT
                    </span>
                  </div>

                  {pricing.savings > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <span>Desconto Anual Aplicado:</span>
                      <span className="font-bold">-{pricing.savings.toLocaleString("pt-MZ")} MT</span>
                    </div>
                  )}

                  <div className="border-t border-zinc-800 pt-4 space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span>{pricing.total.toLocaleString("pt-MZ")} MT</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>IVA (16% incluído)</span>
                      <span>{Math.round(pricing.total * (16 / 116)).toLocaleString("pt-MZ")} MT</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-bold text-white pt-2 border-t border-zinc-800">
                      <span>Total a Pagar</span>
                      <span className="text-emerald-400 font-mono text-lg">
                        {pricing.total.toLocaleString("pt-MZ")} MT
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Carregando checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
