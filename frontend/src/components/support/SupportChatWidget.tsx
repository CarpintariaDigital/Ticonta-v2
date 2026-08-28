"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, ShieldCheck } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHIPS = [
  "Como emitir fatura com IVA a 16%?",
  "Como fazer o fecho diário de caixa?",
  "Como funciona a sincronização offline?"
];

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

      if (!response.ok) throw new Error("Erro na resposta");

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
              updated[updated.length - 1] = { role: "assistant", content: assistantMsg };
              return updated;
            });
          }
        }
      } else {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "Como posso ajudar mais com o TiConta ERP?" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "O TiConta opera 100% offline no PDV. Para regras fiscais adicionais, o IVA moçambicano é calculado a 16% e todas as retenções são aplicadas em conformidade com o regulamento tributário.",
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
        <div className="fixed bottom-20 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[82vh] bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
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
              className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-zinc-950/50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none"
                      : "bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/60 p-2.5 rounded-xl text-zinc-400 border border-zinc-700/40 text-[11px] animate-pulse">
                  A consultar regras fiscais e base do ERP...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chips Sugeridos */}
          <div className="p-2 bg-zinc-900 border-t border-zinc-800 flex gap-1.5 overflow-x-auto scrollbar-none">
            {CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[11px] whitespace-nowrap bg-zinc-800 hover:bg-emerald-950/60 hover:text-emerald-300 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-700/60 transition-colors"
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
            className="p-2.5 bg-zinc-900 border-t border-zinc-800 flex gap-2"
          >
            <input
              type="text"
              placeholder="Escreva a sua dúvida operacional..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs bg-zinc-950 text-zinc-100 placeholder-zinc-500 px-3 py-2 rounded-xl outline-none border border-zinc-800 focus:border-emerald-500 transition-colors"
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
