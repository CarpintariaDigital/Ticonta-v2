"use client";

import React, { useState } from "react";
import {
  PiggyBank,
  Percent,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Coins,
} from "lucide-react";
import {
  SavingsGroup,
  SavingsMember,
  SavingsLoan,
  RepaymentFrequency,
  SavingsShareoutMemberResult,
} from "@/types/informal_sales";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const defaultMockSavingsGroup: SavingsGroup = {
  id: "ascas-01",
  name: "Grupo de Poupança & Crédito Boa Esperança (ASCAS)",
  start_date: "2026-01-15",
  end_date: "2026-12-15",
  default_interest_rate_percent: 10,
  total_fund_accumulated: 185000,
  total_loans_disbursed: 45000,
  total_interest_earned: 6750,
  status: "active",
  members: [
    {
      id: "sm-1",
      name: "Dona Marta Muchanga",
      phone: "841112233",
      total_saved: 40000,
      active_loan_balance: 0,
      interest_paid_to_group: 1500,
      status: "active",
    },
    {
      id: "sm-2",
      name: "Sr. Fernando Tembe",
      phone: "842223344",
      total_saved: 55000,
      active_loan_balance: 15000,
      interest_paid_to_group: 2250,
      status: "active",
    },
    {
      id: "sm-3",
      name: "Teresa Mondlane",
      phone: "843334455",
      total_saved: 30000,
      active_loan_balance: 0,
      interest_paid_to_group: 1000,
      status: "active",
    },
    {
      id: "sm-4",
      name: "Eng. Paulo Zitha",
      phone: "844445566",
      total_saved: 60000,
      active_loan_balance: 10000,
      interest_paid_to_group: 2000,
      status: "active",
    },
  ],
  loans: [
    {
      id: "ln-1",
      member_id: "sm-2",
      member_name: "Sr. Fernando Tembe",
      member_phone: "842223344",
      principal_amount: 15000,
      interest_rate_percent: 10,
      interest_amount: 1500,
      total_to_repay: 16500,
      amount_repaid: 1500,
      remaining_balance: 15000,
      repayment_frequency: "monthly",
      due_date: "2026-09-15",
      disbursed_at: "2026-08-01",
      status: "active",
      notes: "Para reforço de mercadoria de mercearia.",
    },
    {
      id: "ln-2",
      member_id: "sm-4",
      member_name: "Eng. Paulo Zitha",
      member_phone: "844445566",
      principal_amount: 10000,
      interest_rate_percent: 10,
      interest_amount: 1000,
      total_to_repay: 11000,
      amount_repaid: 1000,
      remaining_balance: 10000,
      repayment_frequency: "monthly",
      due_date: "2026-09-30",
      disbursed_at: "2026-08-10",
      status: "active",
      notes: "Para compra de materiais para obra.",
    },
  ],
};

export const SavingsGroupModule: React.FC = () => {
  const [group, setGroup] = useState<SavingsGroup>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticonta_savings_group");
      return saved ? JSON.parse(saved) : defaultMockSavingsGroup;
    }
    return defaultMockSavingsGroup;
  });

  const [activeSubTab, setActiveSubTab] = useState<"members" | "loans" | "shareout">("members");

  // Modais
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<SavingsLoan | null>(null);

  // Form State Depósito
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [depositAmount, setDepositAmount] = useState<number>(1000);

  // Form State Empréstimo
  const [loanMemberId, setLoanMemberId] = useState("");
  const [loanPrincipal, setLoanPrincipal] = useState<number>(5000);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(10);
  const [loanRepaymentFreq, setLoanRepaymentFreq] = useState<RepaymentFrequency>("monthly");
  const [loanDueDate, setLoanDueDate] = useState<string>("2026-09-30");
  const [loanNotes, setLoanNotes] = useState("");

  // Form State Amortização
  const [repayAmount, setRepayAmount] = useState<number>(0);

  const saveGroup = (updated: SavingsGroup) => {
    setGroup(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ticonta_savings_group", JSON.stringify(updated));
    }
  };

  // 1. Registar Depósito de Poupança
  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || depositAmount <= 0) return;

    const updatedMembers = group.members.map((m) => {
      if (m.id === selectedMemberId) {
        return {
          ...m,
          total_saved: m.total_saved + depositAmount,
        };
      }
      return m;
    });

    const updated: SavingsGroup = {
      ...group,
      total_fund_accumulated: group.total_fund_accumulated + depositAmount,
      members: updatedMembers,
    };

    saveGroup(updated);
    setIsDepositModalOpen(false);
    setDepositAmount(1000);
  };

  // 2. Conceder Novo Empréstimo com Juros
  const handleDisburseLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const member = group.members.find((m) => m.id === loanMemberId);
    if (!member || loanPrincipal <= 0) return;

    const interestAmt = (loanPrincipal * loanInterestRate) / 100;
    const totalRepay = loanPrincipal + interestAmt;

    const newLoan: SavingsLoan = {
      id: `ln-${Date.now()}`,
      member_id: member.id,
      member_name: member.name,
      member_phone: member.phone,
      principal_amount: loanPrincipal,
      interest_rate_percent: loanInterestRate,
      interest_amount: interestAmt,
      total_to_repay: totalRepay,
      amount_repaid: 0,
      remaining_balance: totalRepay,
      repayment_frequency: loanRepaymentFreq,
      due_date: loanDueDate,
      disbursed_at: new Date().toISOString().slice(0, 10),
      status: "active",
      notes: loanNotes,
    };

    const updatedMembers = group.members.map((m) => {
      if (m.id === member.id) {
        return {
          ...m,
          active_loan_balance: m.active_loan_balance + totalRepay,
        };
      }
      return m;
    });

    const updated: SavingsGroup = {
      ...group,
      total_loans_disbursed: group.total_loans_disbursed + loanPrincipal,
      members: updatedMembers,
      loans: [newLoan, ...group.loans],
    };

    saveGroup(updated);
    setIsLoanModalOpen(false);
    setLoanPrincipal(5000);
    setLoanNotes("");
  };

  // 3. Amortizar Empréstimo
  const handleRepayLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForRepay || repayAmount <= 0) return;

    const newRemaining = Math.max(0, selectedLoanForRepay.remaining_balance - repayAmount);
    const newRepaid = selectedLoanForRepay.amount_repaid + repayAmount;
    const isPaid = newRemaining === 0;

    const updatedLoans = group.loans.map((l) => {
      if (l.id === selectedLoanForRepay.id) {
        return {
          ...l,
          amount_repaid: newRepaid,
          remaining_balance: newRemaining,
          status: isPaid ? ("paid" as const) : ("active" as const),
        };
      }
      return l;
    });

    const updatedMembers = group.members.map((m) => {
      if (m.id === selectedLoanForRepay.member_id) {
        return {
          ...m,
          active_loan_balance: Math.max(0, m.active_loan_balance - repayAmount),
          interest_paid_to_group: m.interest_paid_to_group + (repayAmount > selectedLoanForRepay.principal_amount ? selectedLoanForRepay.interest_amount : 0),
        };
      }
      return m;
    });

    const updated: SavingsGroup = {
      ...group,
      total_interest_earned: group.total_interest_earned + selectedLoanForRepay.interest_amount,
      loans: updatedLoans,
      members: updatedMembers,
    };

    saveGroup(updated);
    setIsRepayModalOpen(false);
    setSelectedLoanForRepay(null);
  };

  // 4. Lembrete de Cobrança WhatsApp
  const handleSendLoanReminderWhatsApp = (loan: SavingsLoan) => {
    const message = `📢 *TICONTA • LEMBRETE DE REEMBOLSO DE EMPRÉSTIMO (POUPANÇA)*
━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Grupo de Poupança:* ${group.name}
👤 *Membro:* ${loan.member_name}
💰 *Valor Emprestado:* ${loan.principal_amount.toLocaleString("pt-MZ")} MT
📈 *Taxa de Juro:* ${loan.interest_rate_percent}% (${loan.interest_amount.toLocaleString("pt-MZ")} MT)
💵 *Total a Reembolsar:* ${loan.total_to_repay.toLocaleString("pt-MZ")} MT
⏳ *Saldo Devedor Restante:* *${loan.remaining_balance.toLocaleString("pt-MZ")} MT*
📅 *Data Limite:* ${loan.due_date} (${loan.repayment_frequency})
━━━━━━━━━━━━━━━━━━━━━━━━
Agradecemos o pagamento pontual para fortalecer o fundo comum e os lucros de juros da equipa!`;

    const phoneClean = loan.member_phone.replace(/\D/g, "");
    const waUrl = phoneClean
      ? `https://api.whatsapp.com/send?phone=258${phoneClean}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  // 5. Cálculo do Share-out Equitativo (Partilha Proporcional de Juros)
  const calculateShareout = (): SavingsShareoutMemberResult[] => {
    const totalSavedByAll = group.members.reduce((acc, m) => acc + m.total_saved, 0);
    const totalInterestToShare = group.total_interest_earned || 6750;

    return group.members.map((m) => {
      const shareFraction = totalSavedByAll > 0 ? m.total_saved / totalSavedByAll : 0;
      const sharePercent = Number((shareFraction * 100).toFixed(1));
      const interestProfitShare = Math.round(totalInterestToShare * shareFraction);
      const totalPayout = m.total_saved + interestProfitShare;
      const netPayout = Math.max(0, totalPayout - m.active_loan_balance);

      return {
        member_id: m.id,
        member_name: m.name,
        total_saved: m.total_saved,
        share_percent: sharePercent,
        interest_profit_share: interestProfitShare,
        total_payout: totalPayout,
        active_debt_deduction: m.active_loan_balance,
        net_payout: netPayout,
        eligible: m.active_loan_balance === 0,
      };
    });
  };

  const shareoutResults = calculateShareout();
  const totalSavingsPool = group.members.reduce((acc, m) => acc + m.total_saved, 0);
  const totalActiveLoansDebt = group.loans
    .filter((l) => l.status === "active")
    .reduce((acc, l) => acc + l.remaining_balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Grupo de Poupança & Crédito Rotativo
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                ASCAS / PCR
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Poupança acumulada a prazo, empréstimos internos com juros e partilha proporcional de lucros (Share-out).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDepositModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 border border-zinc-700"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            Novo Depósito
          </Button>
          <Button
            onClick={() => setIsLoanModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-950"
          >
            <Coins className="w-4 h-4" />
            Conceder Empréstimo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase">Total no Fundo de Poupança</span>
            <div className="text-xl font-black text-amber-400">
              {totalSavingsPool.toLocaleString("pt-MZ")} MT
            </div>
            <p className="text-[10px] text-zinc-500">
              Valor acumulado por {group.members.length} membros
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase">Empréstimos Ativos</span>
            <div className="text-xl font-black text-rose-400">
              {totalActiveLoansDebt.toLocaleString("pt-MZ")} MT
            </div>
            <p className="text-[10px] text-zinc-500">
              Crédito a circular na equipa
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase">Juros Lucrados p/ Partilha</span>
            <div className="text-xl font-black text-emerald-400">
              {group.total_interest_earned.toLocaleString("pt-MZ")} MT
            </div>
            <p className="text-[10px] text-zinc-500">
              Rendimento a distribuir no final do ciclo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase">Encerramento do Ciclo</span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 pt-1">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>{group.end_date}</span>
            </div>
            <p className="text-[10px] text-emerald-400 font-mono">
              Dia da Partilha Final (Share-out)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveSubTab("members")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === "members"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Membros & Poupança Acumulada
        </button>
        <button
          onClick={() => setActiveSubTab("loans")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === "loans"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Empréstimos & Dívidas ({group.loans.filter((l) => l.status === "active").length})
        </button>
        <button
          onClick={() => setActiveSubTab("shareout")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeSubTab === "shareout"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Partilha Equitativa de Juros (Share-out)
        </button>
      </div>

      {/* 1. Members Tab */}
      {activeSubTab === "members" && (
        <Card className="bg-zinc-900 border-zinc-800 text-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Membro</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Poupança Acumulada</th>
                    <th className="py-3 px-4">Empréstimo Ativo</th>
                    <th className="py-3 px-4">Juros Pagos ao Grupo</th>
                    <th className="py-3 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {group.members.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4 font-bold text-white">{m.name}</td>
                      <td className="py-3.5 px-4 text-zinc-400 font-mono">{m.phone}</td>
                      <td className="py-3.5 px-4 font-black text-amber-400">
                        {m.total_saved.toLocaleString("pt-MZ")} MT
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {m.active_loan_balance > 0 ? (
                          <span className="text-rose-400 font-bold">
                            {m.active_loan_balance.toLocaleString("pt-MZ")} MT
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-[11px]">Sem Dívida</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        +{m.interest_paid_to_group.toLocaleString("pt-MZ")} MT
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Loans Tab */}
      {activeSubTab === "loans" && (
        <Card className="bg-zinc-900 border-zinc-800 text-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Membro</th>
                    <th className="py-3 px-4">Principal</th>
                    <th className="py-3 px-4">Taxa Juro</th>
                    <th className="py-3 px-4">Total c/ Juros</th>
                    <th className="py-3 px-4">Saldo Devedor</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {group.loans.map((ln) => (
                    <tr key={ln.id} className="hover:bg-zinc-800/40">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {ln.member_name}
                        {ln.notes && <span className="block text-[10px] text-zinc-500 font-normal">{ln.notes}</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono">{ln.principal_amount.toLocaleString("pt-MZ")} MT</td>
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">
                        {ln.interest_rate_percent}% (+{ln.interest_amount} MT)
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {ln.total_to_repay.toLocaleString("pt-MZ")} MT
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {ln.remaining_balance > 0 ? (
                          <span className="text-rose-400 font-black">
                            {ln.remaining_balance.toLocaleString("pt-MZ")} MT
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold">Totalmente Pago</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 font-medium">
                        {ln.due_date} ({ln.repayment_frequency})
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {ln.remaining_balance > 0 && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedLoanForRepay(ln);
                                setRepayAmount(ln.remaining_balance);
                                setIsRepayModalOpen(true);
                              }}
                              className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 rounded-lg"
                            >
                              Amortizar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendLoanReminderWhatsApp(ln)}
                            className="h-7 text-[11px] border-zinc-700 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 font-bold px-2 rounded-lg flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Cobrar WhatsApp
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Share-out Tab (Partilha Proporcional de Juros) */}
      {activeSubTab === "shareout" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-white text-sm">Simulador de Partilha Final (Share-out)</h4>
                <p className="text-zinc-400">
                  Os juros acumulados pelos empréstimos ({group.total_interest_earned.toLocaleString("pt-MZ")} MT) são distribuídos de forma proporcional à poupança de cada membro, deduzindo dívidas em aberto.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 font-mono">
              <span className="text-[10px] text-zinc-400 block">Total a Distribuir:</span>
              <span className="text-base font-black text-emerald-400">
                {(totalSavingsPool + group.total_interest_earned).toLocaleString("pt-MZ")} MT
              </span>
            </div>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Membro</th>
                      <th className="py-3 px-4">Poupança Pessoal</th>
                      <th className="py-3 px-4">% Quota no Fundo</th>
                      <th className="py-3 px-4">Fatia de Juros Lucrados</th>
                      <th className="py-3 px-4">Dedução de Dívida</th>
                      <th className="py-3 px-4 text-right">Valor Líquido a Receber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-zinc-300">
                    {shareoutResults.map((res) => (
                      <tr key={res.member_id} className="hover:bg-zinc-800/40">
                        <td className="py-3.5 px-4 font-bold text-white">{res.member_name}</td>
                        <td className="py-3.5 px-4 font-mono">{res.total_saved.toLocaleString("pt-MZ")} MT</td>
                        <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">{res.share_percent}%</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                          +{res.interest_profit_share.toLocaleString("pt-MZ")} MT
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {res.active_debt_deduction > 0 ? (
                            <span className="text-rose-400">
                              -{res.active_debt_deduction.toLocaleString("pt-MZ")} MT
                            </span>
                          ) : (
                            <span className="text-zinc-500">0 MT</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-sm text-emerald-400 font-mono">
                          {res.net_payout.toLocaleString("pt-MZ")} MT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Depósito de Poupança */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                Registar Depósito de Poupança
              </h3>
              <button onClick={() => setIsDepositModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddDeposit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Membro *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-950 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Selecione o membro...</option>
                  {group.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Atual: {m.total_saved} MT)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Montante a Poupar (MT) *</label>
                <Input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 text-white font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDepositModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                  Confirmar Depósito
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Conceder Empréstimo */}
      {isLoanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                Conceder Empréstimo Interno
              </h3>
              <button onClick={() => setIsLoanModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleDisburseLoan} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Membro Solicitante *</label>
                <select
                  required
                  value={loanMemberId}
                  onChange={(e) => setLoanMemberId(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-950 border border-zinc-700 rounded-md text-white"
                >
                  <option value="">Selecione o membro...</option>
                  {group.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Poupança: {m.total_saved} MT)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Valor Principal (MT) *</label>
                  <Input
                    type="number"
                    required
                    value={loanPrincipal}
                    onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                    className="bg-zinc-950 border-zinc-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Taxa de Juros (%) *</label>
                  <Input
                    type="number"
                    required
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                    className="bg-zinc-950 border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Modalidade Reembolso</label>
                  <select
                    value={loanRepaymentFreq}
                    onChange={(e) => setLoanRepaymentFreq(e.target.value as RepaymentFrequency)}
                    className="w-full h-10 px-3 bg-zinc-950 border border-zinc-700 rounded-md text-white"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="daily">Diário</option>
                    <option value="single">Parcela Única</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Data Limite *</label>
                  <Input
                    type="date"
                    required
                    value={loanDueDate}
                    onChange={(e) => setLoanDueDate(e.target.value)}
                    className="bg-zinc-950 border-zinc-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] space-y-1">
                <div className="flex justify-between text-zinc-400">
                  <span>Juros a pagar ao grupo:</span>
                  <span className="text-amber-400 font-bold">
                    {((loanPrincipal * loanInterestRate) / 100).toLocaleString("pt-MZ")} MT
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span>Total com Juros:</span>
                  <span className="text-emerald-400">
                    {(loanPrincipal + (loanPrincipal * loanInterestRate) / 100).toLocaleString("pt-MZ")} MT
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsLoanModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                  Desembolsar Empréstimo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Amortizar Empréstimo */}
      {isRepayModalOpen && selectedLoanForRepay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                Amortizar Empréstimo
              </h3>
              <button onClick={() => setIsRepayModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleRepayLoan} className="space-y-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Membro:</span>
                <span className="font-bold text-white text-sm">{selectedLoanForRepay.member_name}</span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-1">Saldo Devedor Total:</span>
                <span className="font-black text-rose-400 text-base font-mono">
                  {selectedLoanForRepay.remaining_balance.toLocaleString("pt-MZ")} MT
                </span>
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Valor a Pagar Agora (MT) *</label>
                <Input
                  type="number"
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 text-white font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsRepayModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Confirmar Amortização
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
