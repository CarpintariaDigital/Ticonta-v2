"use client";

import React, { useEffect, useState } from "react";
import { Send, RefreshCw, Download, ExternalLink, MessageSquare, Smartphone, Mail, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocumentDelivery } from "@/hooks/useDocumentDelivery";
import { DeliveryMethod, DeliveryStatus, DocumentDeliveryItem } from "@/services/document_delivery";

export const DeliveryHistoryTable: React.FC = () => {
  const { history, fetchHistory, resendDocument, isLoading } = useDocumentDelivery();
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [resendingId, setResendingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory({ delivery_method: methodFilter || undefined, status: statusFilter || undefined });
  }, [fetchHistory, methodFilter, statusFilter]);

  const handleResend = async (deliveryId: number) => {
    try {
      setResendingId(deliveryId);
      await resendDocument(deliveryId);
    } catch (err) {
      console.error(err);
    } finally {
      setResendingId(null);
    }
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case "sent":
      case "delivered":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Enviado
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Falhou
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
    }
  };

  const getMethodIcon = (method: DeliveryMethod) => {
    switch (method) {
      case "whatsapp":
        return <MessageSquare className="h-4 w-4 text-emerald-400" />;
      case "sms":
        return <Smartphone className="h-4 w-4 text-blue-400" />;
      case "email":
        return <Mail className="h-4 w-4 text-amber-400" />;
    }
  };

  const exportCSV = () => {
    if (!history.length) return;
    const headers = ["ID", "Documento", "Método", "Contacto", "Status", "Data Envio", "URL PDF"];
    const rows = history.map((h) => [
      h.id,
      `${h.document_type.toUpperCase()} #${h.document_id}`,
      h.delivery_method,
      h.customer_phone || h.customer_email || "N/D",
      h.status,
      h.sent_at || "N/D",
      h.pdf_url,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historico_entregas_ticonta_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-xl">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-zinc-800">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-400" />
            Histórico de Envios (WhatsApp & SMS)
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Auditoria e rastreio de entrega de faturas e recibos digitais
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Todos os Meios</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Todos os Estados</option>
            <option value="sent">Enviado</option>
            <option value="failed">Falhou</option>
            <option value="pending">Pendente</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchHistory({ delivery_method: methodFilter || undefined, status: statusFilter || undefined })}
            disabled={isLoading}
            className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={exportCSV}
            disabled={!history.length}
            className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 font-semibold uppercase text-zinc-400">
              <tr>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4">Destinatário</th>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white uppercase">
                      {item.document_type} #{item.document_id}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-1.5 capitalize text-zinc-300">
                      {getMethodIcon(item.delivery_method)}
                      {item.delivery_method}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {item.customer_phone || item.customer_email || "Consumidor Final"}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {item.sent_at ? new Date(item.sent_at).toLocaleString("pt-MZ") : "N/D"}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={item.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-zinc-400 hover:text-emerald-400 p-1"
                        title="Ver PDF"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      {item.status === "failed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResend(item.id)}
                          disabled={resendingId === item.id}
                          className="border-zinc-800 bg-zinc-950 text-[11px] h-7 px-2 hover:bg-emerald-600 hover:text-white"
                        >
                          {resendingId === item.id ? "A reenviar..." : "Reenviar"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Nenhum registo de entrega encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
