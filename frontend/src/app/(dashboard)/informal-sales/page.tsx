"use client";

import React, { useState } from "react";
import { useInformalSales } from "@/hooks/useInformalSales";
import { QuickCustomerSearch } from "@/components/informal-sales/QuickCustomerSearch";
import { FastCheckout } from "@/components/informal-sales/FastCheckout";
import { CustomerDebitList } from "@/components/informal-sales/CustomerDebitList";
import { CollectionForm } from "@/components/informal-sales/CollectionForm";
import { DebitHistory } from "@/components/informal-sales/DebitHistory";
import { OverdueAlerts } from "@/components/informal-sales/OverdueAlerts";
import { NewCustomerModal } from "@/components/informal-sales/NewCustomerModal";
import { ReceiptModal } from "@/components/informal-sales/ReceiptModal";
import { CashFlowForecastView } from "@/components/informal-sales/CashFlowForecastView";
import { InformalCustomer, Debit } from "@/types/informal_sales";
import { XitiqueModule } from "@/components/informal-sales/XitiqueModule";
import { SavingsGroupModule } from "@/components/informal-sales/SavingsGroupModule";
import {
  Store,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  PiggyBank,
  Coins,
} from "lucide-react";

export default function InformalSalesPage() {
  const [masterTab, setMasterTab] = useState<"fiado" | "xitique" | "savings">("fiado");

  const {
    customers,
    selectedCustomer,
    customerDebits,
    overdueDebits,
    cartItems,
    cartSubtotal,
    amountPaidNow,
    amountOwed,
    isCreditLimitExceeded,
    dueDate,
    paymentMethod,
    saleNotes,
    activeTab,
    customerFilter,
    isCollectionModalOpen,
    selectedDebitForCollection,
    isHistoryModalOpen,
    isNewCustomerModalOpen,
    isReceiptModalOpen,
    lastSaleReceipt,
    cashFlowForecast,
    revenueBreakdown,
    creditRiskReport,
    isLoading,
    setSelectedCustomer,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearCart,
    setAmountPaidNow,
    setDueDate,
    setPaymentMethod,
    setSaleNotes,
    setActiveTab,
    setCustomerFilter,
    openCollectionModal,
    closeCollectionModal,
    setIsHistoryModalOpen,
    setIsNewCustomerModalOpen,
    setIsReceiptModalOpen,
    fetchCustomerDebits,
    createCustomerQuick,
    createSaleWithDebit,
    recordPartialPayment,
    sendReminder,
  } = useInformalSales();

  const [historyTargetCustomer, setHistoryTargetCustomer] = useState<InformalCustomer | null>(null);

  const handleOpenHistory = async (customer: InformalCustomer) => {
    setHistoryTargetCustomer(customer);
    await fetchCustomerDebits(customer.id);
    setIsHistoryModalOpen(true);
  };

  const handleOpenCollectionForCustomer = (customer: InformalCustomer) => {
    setSelectedCustomer(customer);
    openCollectionModal({
      id: customer.id,
      company_id: customer.company_id,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      total_amount: customer.total_owed,
      initial_paid: 0,
      amount_owed: customer.total_owed,
      amount_paid: 0,
      status: "active",
      reminder_count: 0,
      is_overdue: false,
      days_overdue: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      partial_payments: [],
    });
  };

  const handleSendWhatsAppQuick = (phone: string, name: string, owed: number) => {
    const text = `Olá *${name}*, tudo bem? Passando para lembrar da sua conta fiada de *${owed.toLocaleString(
      "pt-MZ"
    )} MT* em TiConta. Caso precise pagar via M-Pesa ou E-Mola, avise-nos. Muito obrigado!`;
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // KPIs
  const totalStreetDebt = customers.reduce((a, b) => a + b.total_owed, 0);
  const overdueCount = overdueDebits.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Master Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMasterTab("fiado")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              masterTab === "fiado"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Store className="w-4 h-4 text-indigo-300" />
            <span>Vendas & Fiado (Caderno)</span>
          </button>

          <button
            onClick={() => setMasterTab("xitique")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              masterTab === "xitique"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>Xitique (Rotativo & Comercial)</span>
          </button>

          <button
            onClick={() => setMasterTab("savings")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              masterTab === "savings"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-950"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <PiggyBank className="w-4 h-4 text-amber-300" />
            <span>Poupança & Crédito (ASCAS)</span>
          </button>
        </div>
      </div>

      {/* RENDER MASTER TAB 2: XITIQUES */}
      {masterTab === "xitique" && <XitiqueModule />}

      {/* RENDER MASTER TAB 3: SAVINGS */}
      {masterTab === "savings" && <SavingsGroupModule />}

      {/* RENDER MASTER TAB 1: FIADO / INFORMAL SALES */}
      {masterTab === "fiado" && (
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950/50">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Vendas Informais & Gestão de Fiado
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Caderno Digital
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Checkout ultra-rápido, amortizações parciais e cobrança via WhatsApp
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto shadow-inner">
              <button
                onClick={() => setActiveTab("checkout")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "checkout"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Vender / Checkout
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "customers"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Clientes & Fiados ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab("overdue")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "overdue"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Atrasados ({overdueCount})
              </button>
              <button
                onClick={() => setActiveTab("cashflow")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "cashflow"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Fluxo de Caixa
              </button>
            </div>
          </div>

          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 block mb-1">Clientes Cadastrados</span>
              <span className="text-lg md:text-xl font-extrabold text-white">{customers.length}</span>
            </div>

            <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 block mb-1">Total a Receber na Praça</span>
              <span className="text-lg md:text-xl font-extrabold text-rose-400">
                {totalStreetDebt.toLocaleString("pt-MZ")} MT
              </span>
            </div>

            <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 block mb-1">Dívidas Vencidas</span>
              <span className="text-lg md:text-xl font-extrabold text-amber-400">{overdueCount} contas</span>
            </div>

            <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 block mb-1">Taxa de Recuperação</span>
              <span className="text-lg md:text-xl font-extrabold text-emerald-400">
                {revenueBreakdown?.debit_recovery_rate_percent || 100}%
              </span>
            </div>
          </div>

          {/* VIEW 1: FAST CHECKOUT */}
          {activeTab === "checkout" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-lg">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Passo 1: Selecionar Cliente Informal
                </span>
                <QuickCustomerSearch
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={setSelectedCustomer}
                  onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
                />
              </div>

              <FastCheckout
                selectedCustomer={selectedCustomer}
                cartItems={cartItems}
                cartSubtotal={cartSubtotal}
                amountPaidNow={amountPaidNow}
                amountOwed={amountOwed}
                isCreditLimitExceeded={isCreditLimitExceeded}
                dueDate={dueDate}
                paymentMethod={paymentMethod}
                saleNotes={saleNotes}
                isLoading={isLoading}
                onAddItem={addItemToCart}
                onUpdateQuantity={updateCartItemQuantity}
                onRemoveItem={removeItemFromCart}
                onClearCart={clearCart}
                onSetAmountPaidNow={setAmountPaidNow}
                onSetDueDate={setDueDate}
                onSetPaymentMethod={setPaymentMethod}
                onSetSaleNotes={setSaleNotes}
                onSubmitSale={createSaleWithDebit}
              />
            </div>
          )}

          {/* VIEW 2: CUSTOMERS & DEBITS LIST */}
          {activeTab === "customers" && (
            <CustomerDebitList
              customers={customers}
              selectedCustomer={selectedCustomer}
              customerFilter={customerFilter}
              onSelectCustomer={setSelectedCustomer}
              onFilterChange={setCustomerFilter}
              onOpenCollection={handleOpenCollectionForCustomer}
              onOpenHistory={handleOpenHistory}
              onOpenNewCustomer={() => setIsNewCustomerModalOpen(true)}
              onSendWhatsApp={handleSendWhatsAppQuick}
            />
          )}

          {/* VIEW 3: OVERDUE ALERTS */}
          {activeTab === "overdue" && (
            <OverdueAlerts
              overdueDebits={overdueDebits}
              onSendReminder={(debitId, channel, customMessage) =>
                sendReminder(debitId, { channel, custom_message: customMessage })
              }
              onOpenCollection={openCollectionModal}
            />
          )}

          {/* VIEW 4: CASH FLOW FORECAST */}
          {activeTab === "cashflow" && (
            <CashFlowForecastView
              cashFlow={cashFlowForecast}
              revenueBreakdown={revenueBreakdown}
              creditRisk={creditRiskReport}
            />
          )}
        </div>
      )}

      {/* MODAL 1: Collection / Partial Payment */}
      {isCollectionModalOpen && selectedDebitForCollection && (
        <CollectionForm
          customer={
            selectedCustomer ||
            customers.find((c) => c.id === selectedDebitForCollection.customer_id) ||
            customers[0]
          }
          debit={selectedDebitForCollection}
          isLoading={isLoading}
          onClose={closeCollectionModal}
          onSubmitPayment={recordPartialPayment}
        />
      )}

      {/* MODAL 2: Debit History Timeline */}
      {isHistoryModalOpen && historyTargetCustomer && (
        <DebitHistory
          customer={historyTargetCustomer}
          debits={customerDebits}
          isLoading={isLoading}
          onClose={() => setIsHistoryModalOpen(false)}
          onOpenCollection={(debit) => {
            setIsHistoryModalOpen(false);
            openCollectionModal(debit);
          }}
        />
      )}

      {/* MODAL 3: New Customer */}
      {isNewCustomerModalOpen && (
        <NewCustomerModal
          isLoading={isLoading}
          onClose={() => setIsNewCustomerModalOpen(false)}
          onSubmit={createCustomerQuick}
        />
      )}

      {/* MODAL 4: Receipt & WhatsApp Share */}
      {isReceiptModalOpen && lastSaleReceipt && (
        <ReceiptModal
          receipt={lastSaleReceipt}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </div>
  );
}
