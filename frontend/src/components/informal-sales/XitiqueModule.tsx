"use client";

import React, { useState } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  Send,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { XitiqueGroup, XitiqueMember, XitiqueType, XitiqueFrequency } from "@/types/informal_sales";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const defaultMockXitiques: XitiqueGroup[] = [
  {
    id: "xit-01",
    name: "Xitique Mulheres Empreendedoras - Zimpeto",
    type: "rotary_cash",
    contribution_amount: 3000,
    frequency: "monthly",
    total_cycles: 6,
    current_cycle: 2,
    start_date: "2026-07-01",
    end_date: "2026-12-31",
    status: "active",
    notes: "Roda rotativa mensal de 6 vendedeiras do mercado.",
    members: [
      {
        id: "m1",
        name: "Mama Esperança Macamo",
        phone: "841234567",
        order_position: 1,
        payout_cycle_date: "Julho 2026",
        has_received: true,
        received_at: "2026-07-28",
        contributions_paid: 2,
        total_contributed: 6000,
        status: "up_to_date",
      },
      {
        id: "m2",
        name: "Aida Cossa",
        phone: "847654321",
        order_position: 2,
        payout_cycle_date: "Agosto 2026",
        has_received: false,
        contributions_paid: 2,
        total_contributed: 6000,
        status: "up_to_date",
      },
      {
        id: "m3",
        name: "Helena Sitoe",
        phone: "869876543",
        order_position: 3,
        payout_cycle_date: "Setembro 2026",
        has_received: false,
        contributions_paid: 2,
        total_contributed: 6000,
        status: "up_to_date",
      },
      {
        id: "m4",
        name: "Teresa Mondlane",
        phone: "852345678",
        order_position: 4,
        payout_cycle_date: "Outubro 2026",
        has_received: false,
        contributions_paid: 1,
        total_contributed: 3000,
        status: "late",
      },
      {
        id: "m5",
        name: "Fátima Mabunda",
        phone: "845556677",
        order_position: 5,
        payout_cycle_date: "Novembro 2026",
        has_received: false,
        contributions_paid: 2,
        total_contributed: 6000,
        status: "up_to_date",
      },
      {
        id: "m6",
        name: "Lurdes Tembe",
        phone: "849998877",
        order_position: 6,
        payout_cycle_date: "Dezembro 2026",
        has_received: false,
        contributions_paid: 2,
        total_contributed: 6000,
        status: "up_to_date",
      },
    ],
  },
  {
    id: "xit-02",
    name: "Xitique de Material Construção - Ferragem Central",
    type: "commercial_goods",
    contribution_amount: 5000,
    frequency: "monthly",
    total_cycles: 4,
    current_cycle: 1,
    start_date: "2026-08-01",
    end_date: "2026-11-30",
    target_goods_item: "Lote de 40 Sacos Cimento Cimentos de Moçambique + 10 Varões Aço",
    status: "active",
    notes: "Xitique de materiais de construção promovido pela Ferragem Central.",
    members: [
      {
        id: "m201",
        name: "Mestre Carlos Chauke",
        phone: "842223344",
        order_position: 1,
        payout_cycle_date: "Agosto 2026",
        has_received: false,
        goods_description: "40 Sacos de Cimento 42.5N + 10 Varões 12mm",
        contributions_paid: 1,
        total_contributed: 5000,
        status: "up_to_date",
      },
      {
        id: "m202",
        name: "Eng. Paulo Zitha",
        phone: "843334455",
        order_position: 2,
        payout_cycle_date: "Setembro 2026",
        has_received: false,
        goods_description: "40 Sacos de Cimento 42.5N + 10 Varões 12mm",
        contributions_paid: 1,
        total_contributed: 5000,
        status: "up_to_date",
      },
      {
        id: "m203",
        name: "Dona Marta Muchanga",
        phone: "861112233",
        order_position: 3,
        payout_cycle_date: "Outubro 2026",
        has_received: false,
        goods_description: "40 Sacos de Cimento 42.5N + 10 Varões 12mm",
        contributions_paid: 1,
        total_contributed: 5000,
        status: "up_to_date",
      },
      {
        id: "m204",
        name: "Sr. António Cumbana",
        phone: "854445566",
        order_position: 4,
        payout_cycle_date: "Novembro 2026",
        has_received: false,
        goods_description: "40 Sacos de Cimento 42.5N + 10 Varões 12mm",
        contributions_paid: 1,
        total_contributed: 5000,
        status: "up_to_date",
      },
    ],
  },
];

export const XitiqueModule: React.FC = () => {
  const [groups, setGroups] = useState<XitiqueGroup[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticonta_xitique_groups");
      return saved ? JSON.parse(saved) : defaultMockXitiques;
    }
    return defaultMockXitiques;
  });

  const [selectedGroup, setSelectedGroup] = useState<XitiqueGroup>(groups[0]);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  // Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupType, setNewGroupType] = useState<XitiqueType>("rotary_cash");
  const [newContribution, setNewContribution] = useState<number>(2000);
  const [newFrequency, setNewFrequency] = useState<XitiqueFrequency>("monthly");
  const [newTargetGoods, setNewTargetGoods] = useState("");
  const [memberNamesInput, setMemberNamesInput] = useState("");

  const saveGroups = (updated: XitiqueGroup[]) => {
    setGroups(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ticonta_xitique_groups", JSON.stringify(updated));
    }
  };

  const handleMarkReceived = (groupId: string, memberId: string) => {
    const updated = groups.map((g) => {
      if (g.id !== groupId) return g;
      const updatedMembers = g.members.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            has_received: true,
            received_at: new Date().toISOString().slice(0, 10),
          };
        }
        return m;
      });
      return { ...g, members: updatedMembers };
    });
    saveGroups(updated);
    const curr = updated.find((g) => g.id === groupId);
    if (curr) setSelectedGroup(curr);
  };

  const handleSendReminderWhatsApp = (group: XitiqueGroup, member: XitiqueMember) => {
    const isGoods = group.type === "commercial_goods";
    const potValue = group.contribution_amount * group.members.length;

    const message = isGoods
      ? `📢 *TICONTA • LEMBRETE DE XITIQUE DE MERCADORIA*
━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Grupo:* ${group.name}
👤 *Membro:* ${member.name}
📦 *Mercadoria da Vez:* ${member.goods_description || group.target_goods_item || "Lote de Artigos"}
📅 *Ciclo de Levantamento:* Mês ${member.order_position} (${member.payout_cycle_date})
💰 *Sua Quota Periódica:* ${group.contribution_amount.toLocaleString("pt-MZ")} MT
━━━━━━━━━━━━━━━━━━━━━━━━
Por favor, efetue o pagamento da sua quota para validação da ronda. Obrigado!`
      : `📢 *TICONTA • LEMBRETE DE XITIQUE ROTATIVO*
━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Grupo:* ${group.name}
👤 *Membro:* ${member.name}
💰 *Quota Mensal:* ${group.contribution_amount.toLocaleString("pt-MZ")} MT
🎯 *Total da Bolada/Pote:* ${potValue.toLocaleString("pt-MZ")} MT
📅 *Sua Posição na Roda:* Posição ${member.order_position} (${member.payout_cycle_date})
━━━━━━━━━━━━━━━━━━━━━━━━
Lembramos do pagamento da quota do ciclo atual para a entrega do pote ao beneficiário da vez.`;

    const phoneClean = member.phone.replace(/\D/g, "");
    const waUrl = phoneClean
      ? `https://api.whatsapp.com/send?phone=258${phoneClean}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNames = memberNamesInput
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    if (rawNames.length === 0) return;

    const newMembers: XitiqueMember[] = rawNames.map((name, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      name,
      phone: "84" + Math.floor(1000000 + Math.random() * 9000000),
      order_position: idx + 1,
      payout_cycle_date: `Ciclo ${idx + 1}`,
      has_received: false,
      contributions_paid: 0,
      total_contributed: 0,
      status: "up_to_date",
      goods_description: newGroupType === "commercial_goods" ? newTargetGoods : undefined,
    }));

    const newGroup: XitiqueGroup = {
      id: `xit-${Date.now()}`,
      name: newGroupName,
      type: newGroupType,
      contribution_amount: Number(newContribution),
      frequency: newFrequency,
      total_cycles: rawNames.length,
      current_cycle: 1,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date(Date.now() + rawNames.length * 30 * 86400000).toISOString().slice(0, 10),
      target_goods_item: newGroupType === "commercial_goods" ? newTargetGoods : undefined,
      status: "active",
      members: newMembers,
    };

    const updated = [newGroup, ...groups];
    saveGroups(updated);
    setSelectedGroup(newGroup);
    setIsNewGroupModalOpen(false);
    setNewGroupName("");
    setMemberNamesInput("");
    setNewTargetGoods("");
  };

  const totalPotValue = selectedGroup.contribution_amount * selectedGroup.members.length;
  const currentBeneficiary = selectedGroup.members.find(
    (m) => m.order_position === selectedGroup.current_cycle
  );

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 border border-zinc-200 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              Gestão de Xitique
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                Rotativo & Comercial
              </span>
            </h2>
            <p className="text-xs text-zinc-500">
              Controlo de rodas de dinheiro, ordem de beneficiários e xitique de mercadorias para lojas e ferragens.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsNewGroupModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            Novo Grupo de Xitique
          </Button>
        </div>
      </div>

      {/* Group Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedGroup.id === g.id
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md"
                : "bg-white/80 text-zinc-500 border-zinc-200 hover:text-zinc-900"
            }`}
          >
            {g.type === "commercial_goods" ? (
              <Package className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{g.name}</span>
            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
              {g.members.length} membros
            </span>
          </button>
        ))}
      </div>

      {/* Selected Group Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-50 border-zinc-200 text-zinc-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase">Modalidade</span>
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-400">
              {selectedGroup.type === "commercial_goods" ? (
                <>
                  <Package className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300">Mercadoria / Produtos</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Dinheiro Rotativo</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500">
              Periodicidade: <span className="text-zinc-700 capitalize">{selectedGroup.frequency}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-50 border-zinc-200 text-zinc-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase">Quota por Membro</span>
            <div className="text-lg font-black text-zinc-900">
              {selectedGroup.contribution_amount.toLocaleString("pt-MZ")} MT
            </div>
            <p className="text-[10px] text-zinc-500">
              Por ciclo de contribuição
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-50 border-zinc-200 text-zinc-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase">Pote da Ronda / Total</span>
            <div className="text-lg font-black text-emerald-400">
              {totalPotValue.toLocaleString("pt-MZ")} MT
            </div>
            <p className="text-[10px] text-zinc-500">
              Entregue a cada ciclo ao beneficiário
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-950/30 border-emerald-500/30 text-zinc-900">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Beneficiário da Vez (Ciclo {selectedGroup.current_cycle})
            </span>
            <div className="text-sm font-bold text-zinc-900 truncate">
              {currentBeneficiary ? currentBeneficiary.name : "Nenhum"}
            </div>
            <p className="text-[10px] text-emerald-300 font-mono">
              {currentBeneficiary?.has_received ? "✅ Já recebeu a bolada" : "⏳ Aguarda entrega desta ronda"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commercial Target Goods Banner (if goods xitique) */}
      {selectedGroup.type === "commercial_goods" && selectedGroup.target_goods_item && (
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <span className="font-bold text-zinc-900 block">Pacote de Mercadoria Contratado:</span>
              <span>{selectedGroup.target_goods_item}</span>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-blue-900/50 px-2 py-1 rounded text-blue-300 border border-blue-500/30">
            Levantamento Físico em Loja
          </span>
        </div>
      )}

      {/* Members Order & Payout Table */}
      <Card className="bg-zinc-50 border-zinc-200 text-zinc-900 overflow-hidden">
        <CardHeader className="border-b border-zinc-200 py-3.5 px-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900">
              Escala da Roda & Estado de Pagamentos ({selectedGroup.members.length} Membros)
            </CardTitle>
            <p className="text-[11px] text-zinc-500">
              Ordem de levantamento do xitique e controlo de quotas pagas
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/80 text-zinc-500 uppercase text-[10px] font-bold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Ordem</th>
                  <th className="py-3 px-4">Nome do Membro</th>
                  <th className="py-3 px-4">Telefone</th>
                  <th className="py-3 px-4">Ciclo de Recebimento</th>
                  <th className="py-3 px-4">Quotas Pagas</th>
                  <th className="py-3 px-4">Estado da Bolada</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-700">
                {selectedGroup.members.map((m) => {
                  const isCurrent = m.order_position === selectedGroup.current_cycle;
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-zinc-800/40 transition-colors ${
                        isCurrent ? "bg-emerald-950/15 font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                            isCurrent
                              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                              : "bg-zinc-800 text-zinc-700"
                          }`}
                        >
                          {m.order_position}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        {m.name}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Vez Atual
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 font-mono">{m.phone}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-medium">{m.payout_cycle_date}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-emerald-400 font-bold">{m.contributions_paid}</span> /{" "}
                        {selectedGroup.total_cycles} ({m.total_contributed.toLocaleString("pt-MZ")} MT)
                      </td>
                      <td className="py-3.5 px-4">
                        {m.has_received ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Recebeu em {m.received_at}
                          </span>
                        ) : isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Aguardando Entrega
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500">Pendente na Roda</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!m.has_received && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkReceived(selectedGroup.id, m.id)}
                              className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 rounded-lg"
                            >
                              {selectedGroup.type === "commercial_goods" ? "Entregar Material" : "Pagar Bolada"}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminderWhatsApp(selectedGroup, m)}
                            className="h-7 text-[11px] border-zinc-200 hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 font-bold px-2 rounded-lg flex items-center gap-1"
                            title="Lembrete WhatsApp"
                          >
                            <Send className="w-3 h-3" />
                            WhatsApp
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Criar Novo Grupo de Xitique */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Criar Novo Grupo de Xitique
              </h3>
              <button
                onClick={() => setIsNewGroupModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Nome do Grupo *</label>
                <Input
                  required
                  placeholder="ex: Xitique dos Mecânicos da Matola"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="bg-white border-zinc-200 text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Tipo de Xitique *</label>
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value as XitiqueType)}
                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-md text-zinc-900"
                  >
                    <option value="rotary_cash">Dinheiro Rotativo</option>
                    <option value="commercial_goods">Mercadoria / Loja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Periodicidade *</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as XitiqueFrequency)}
                    className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-md text-zinc-900"
                  >
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quinzenal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Valor da Quota por Membro (MT) *</label>
                <Input
                  type="number"
                  required
                  value={newContribution}
                  onChange={(e) => setNewContribution(Number(e.target.value))}
                  className="bg-white border-zinc-200 text-zinc-900 font-mono"
                />
              </div>

              {newGroupType === "commercial_goods" && (
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Descrição do Pacote de Mercadoria</label>
                  <Input
                    placeholder="ex: 50 Sacos Cimento + 15 Varões Aço ou Cabaz Alimentar Familiar"
                    value={newTargetGoods}
                    onChange={(e) => setNewTargetGoods(e.target.value)}
                    className="bg-white border-zinc-200 text-zinc-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">
                  Membros (1 por linha na ordem de recebimento) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={"Mama Esperança\nCarlos Chauke\nAida Cossa\nHelena Sitoe"}
                  value={memberNamesInput}
                  onChange={(e) => setMemberNamesInput(e.target.value)}
                  className="w-full p-2.5 bg-white border border-zinc-200 rounded-md text-zinc-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="border-zinc-200 text-zinc-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Criar Xitique
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
