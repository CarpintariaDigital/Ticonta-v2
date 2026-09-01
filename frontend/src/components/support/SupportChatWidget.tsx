"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, ShieldCheck, MessageCircle, ExternalLink } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  isFallback?: boolean;
  unresolvedQuery?: string;
}

const CHIPS = [
  "Como emitir fatura com IVA a 16%?",
  "Como fazer o fecho diário de caixa?",
  "Como funciona a sincronização offline?"
];

const SUPPORT_WHATSAPP_NUMBER = "258834616193"; // Número Oficial de Suporte da Carpintaria Digital

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o Copiloto de Suporte do TiConta ERP. Como posso ajudar com regras fiscais de Moçambique, faturas com IVA a 16%, fecho de caixa ou modo offline?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function getWhatsAppUrl(queryText: string) {
    const text = encodeURIComponent(
      `Olá Suporte TiConta / Carpintaria Digital,\n\nTenho uma dúvida que o Copiloto IA não conseguiu esclarecer:\n👉 "${queryText}"\n\nPoderiam apoiar-me?`
    );
    return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${text}`;
  }

  function isAiUnsure(text: string): boolean {
    const lower = text.toLowerCase();
    const unsureKeywords = [
      "não tenho certeza",
      "não encontrei",
      "não sei",
      "consulte o suporte",
      "fora do meu escopo",
      "não foi possível",
      "desculpe, não consegui",
      "falar com um atendente",
    ];
    return unsureKeywords.some((kw) => lower.includes(kw));
  }

  async function handleSend(customText?: string) {
    const text = customText || input;
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://carpintaria-ia.nunesildino.workers.dev";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: "ticonta",
          messages: newMessages,
        }),
      });

      if (!response.ok) throw new Error("Erro na resposta da IA");

      if (response.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMsg = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            assistantMsg += chunk;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantMsg,
                isFallback: isAiUnsure(assistantMsg),
                unresolvedQuery: isAiUnsure(assistantMsg) ? text : undefined,
              };
              return updated;
            });
          }
        }
      } else {
        const data = await response.json();
        const reply = data.reply || "Não consegui obter a informação exata neste momento.";
        const fallback = isAiUnsure(reply);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply,
            isFallback: fallback,
            unresolvedQuery: fallback ? text : undefined,
          },
        ]);
      }
    } catch {
      // Fallback quando a API falha ou não tem respostas
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Não consegui processar a resposta completa neste momento. Para garantir um atendimento rápido e preciso, encaminhe a sua dúvida diretamente à nossa equipa humana de suporte no WhatsApp.",
          isFallback: true,
          unresolvedQuery: text,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Botão Flutuante de Ajuda / Suporte Fiscal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all duration-200 hover:scale-105"
        title="Copiloto Fiscal & Suporte TiConta"
      >
        <Sparkles className="w-4 h-4 text-emerald-200" />
        <span className="text-sm font-semibold tracking-wide">Suporte IA & Fiscal</span>
      </button>

      {/* Janela Modal do Copiloto */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[82vh] bg-zinc-50/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-zinc-900 p-3.5 border-b border-emerald-800/40 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">TiConta Copiloto</h4>
                <p className="text-[11px] text-emerald-200/70">Regras Fiscais & Suporte ERP</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-zinc-50/70 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-xl leading-relaxed ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-white text-zinc-800 border border-zinc-200 shadow-sm rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>

                {/* Card de Encaminhamento Direto para WhatsApp quando a IA não tem resposta */}
                {m.isFallback && m.unresolvedQuery && (
                  <div className="mt-2 max-w-[88%] bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-emerald-900 text-[11px] font-semibold">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Falar com especialista humano no WhatsApp</span>
                    </div>
                    <a
                      href={getWhatsAppUrl(m.unresolvedQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg transition-colors shadow-sm"
                    >
                      <span>Abrir no WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-2.5 rounded-xl text-zinc-600 border border-zinc-200 text-[11px] shadow-sm animate-pulse">
                  A consultar regras fiscais e base do ERP...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips Sugeridos */}
          <div className="p-2 bg-zinc-50 border-t border-zinc-200 flex gap-1.5 overflow-x-auto scrollbar-none">
            {CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] whitespace-nowrap bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-zinc-700 px-2.5 py-1 rounded-lg border border-zinc-200 shadow-sm transition-colors font-medium"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Formulário de Envio */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-zinc-50 border-t border-zinc-200 flex gap-2"
          >
            <input
              type="text"
              placeholder="Escreva a sua dúvida operacional..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs bg-white text-zinc-900 placeholder-zinc-500 px-3 py-2 rounded-xl outline-none border border-zinc-200 focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
