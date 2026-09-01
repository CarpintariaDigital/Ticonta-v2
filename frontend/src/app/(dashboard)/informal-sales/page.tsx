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
    createCustomerQuick,
    createSaleWithDebit,
    recordPartialPayment,
    sendReminder,
    openCollectionModal,
    closeCollectionModal,
    setIsHistoryModalOpen,
    setIsNewCustomerModalOpen,
    setIsReceiptModalOpen,
    fetchCustomerDebits,
  } = useInformalSales();

  const [historyTargetCustomer, setHistoryTargetCustomer] = useState<InformalCustomer | null>(null);

  const handleOpenHistory = async (customer: InformalCustomer) => {
    setHistoryTargetCustomer(customer);
    if (fetchCustomerDebits) {
      await fetchCustomerDebits(customer.id);
    }
    setIsHistoryModalOpen(true);
  };

  const handleOpenCollectionForCustomer = (customer: InformalCustomer) => {
    setSelectedCustomer(customer);
    const activeDebits = customerDebits.filter(
      (d) => d.customer_id === customer.id && d.status !== "paid"
    );
    if (activeDebits.length > 0) {
      openCollectionModal(activeDebits[0]);
    } else {
      openCollectionModal({
        id: 0,
        company_id: customer.company_id || 1,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        total_amount: customer.total_owed,
        initial_paid: 0,
        amount_owed: customer.total_owed,
        amount_paid: 0,
        due_date: new Date().toISOString().split("T")[0],
        status: "active",
        reminder_count: 0,
        is_overdue: false,
        days_overdue: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        partial_payments: [],
      });
    }
  };

  const handleSendWhatsAppQuick = async (phone: string, name: string, owed: number) => {
    const msg = encodeURIComponent(
      `Olá ${name}, relembramos que possui um saldo devedor de ${owed.toLocaleString(
        "pt-MZ"
      )} MT no TiConta.`
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
  };

  const totalStreetDebt = customers.reduce((sum, c) => sum + (c.total_owed || 0), 0);
  const overdueCount = overdueDebits.length;

  return (
    <div className="space-y-6">
      {/* Master Top Level Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-emerald-900/10 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setMasterTab("fiado")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              masterTab === "fiado"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <Store className="w-4 h-4" />
            Caderno de Fiado & Vendas
          </button>
          <button
            onClick={() => setMasterTab("xitique")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              masterTab === "xitique"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <Coins className="w-4 h-4 text-amber-500" />
            Xitique Rotativo & Mútuo
          </button>
          <button
            onClick={() => setMasterTab("savings")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              masterTab === "savings"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <PiggyBank className="w-4 h-4 text-emerald-500" />
            Grupos de Poupança & Crédito
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          Economia Informal & Comunitária
        </div>
      </div>

      {masterTab === "xitique" && <XitiqueModule />}
      {masterTab === "savings" && <SavingsGroupModule />}

      {masterTab === "fiado" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Sub-Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                  Vendas Informais & Gestão de Fiado
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Caderno Digital
                  </span>
                </h1>
                <p className="text-xs text-zinc-500">
                  Checkout ultra-rápido, amortizações parciais e cobrança via WhatsApp
                </p>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 self-start md:self-auto shadow-inner">
              <button
                onClick={() => setActiveTab("checkout")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "checkout"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" /> Vender / Checkout
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "customers"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Clientes & Fiados ({customers.length})
              </button>
              <button
                onClick={() => setActiveTab("overdue")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "overdue"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Atrasados ({overdueCount})
              </button>
              <button
                onClick={() => setActiveTab("cashflow")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "cashflow"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Fluxo de Caixa
              </button>
            </div>
          </div>

          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
              <span className="text-[11px] text-zinc-500 block mb-1 font-medium">Clientes Cadastrados</span>
              <span className="text-lg md:text-xl font-extrabold text-zinc-900">{customers.length}</span>
            </div>

            <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
              <span className="text-[11px] text-zinc-500 block mb-1 font-medium">Total a Receber na Praça</span>
              <span className="text-lg md:text-xl font-extrabold text-rose-600">
                {totalStreetDebt.toLocaleString("pt-MZ")} MT
              </span>
            </div>

            <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
              <span className="text-[11px] text-zinc-500 block mb-1 font-medium">Dívidas Vencidas</span>
              <span className="text-lg md:text-xl font-extrabold text-amber-600">{overdueCount} contas</span>
            </div>

            <div className="p-3.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
              <span className="text-[11px] text-zinc-500 block mb-1 font-medium">Taxa de Recuperação</span>
              <span className="text-lg md:text-xl font-extrabold text-emerald-700">
                {revenueBreakdown?.debit_recovery_rate_percent || 100}%
              </span>
            </div>
          </div>

          {/* VIEW 1: FAST CHECKOUT */}
          {activeTab === "checkout" && (
            <div className="space-y-4">
              <div className="p-4 bg-white/80 backdrop-blur-md border border-emerald-900/10 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
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
