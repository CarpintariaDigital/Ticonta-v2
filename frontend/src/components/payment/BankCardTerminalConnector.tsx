'use client';

import React, { useState } from 'react';
import { CreditCard, Wifi, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatMZN } from '@/lib/currency';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BankTerminalInfo } from '@/types/payment';

interface BankCardTerminalConnectorProps {
  amount: number;
  onConfirm: (data: {
    terminalId: string;
    cardScheme: string;
    authCode: string;
    cardLastFour?: string;
    batchNumber?: string;
  }) => void;
  isLoading?: boolean;
}

const DEFAULT_TERMINALS: BankTerminalInfo[] = [
  {
    terminal_id: 'POS-SIMO-01',
    bank_name: 'Rede SIMO Moçambique (BIM, BCI, Standard Bank)',
    location: 'Balcão Caixa 01',
    status: 'online',
    protocol: 'SIMO_CONNECT',
    is_active: true,
  },
  {
    terminal_id: 'POS-BIM-02',
    bank_name: 'Millennium BIM (POS Standalone)',
    location: 'Caixa Secundário',
    status: 'ready',
    protocol: 'STANDALONE_POS',
    is_active: true,
  },
  {
    terminal_id: 'POS-BCI-03',
    bank_name: 'BCI Terminal Móvel (GPRS/Wi-Fi)',
    location: 'Móvel / Esplanada',
    status: 'ready',
    protocol: 'STANDALONE_POS',
    is_active: true,
  },
];

export function BankCardTerminalConnector({
  amount,
  onConfirm,
  isLoading = false,
}: BankCardTerminalConnectorProps) {
  const [selectedTerminal, setSelectedTerminal] = useState('POS-SIMO-01');
  const [cardScheme, setCardScheme] = useState('VISA');
  const [authCode, setAuthCode] = useState('');
  const [cardLastFour, setCardLastFour] = useState('');
  const [batchNumber, setBatchNumber] = useState('LOTE-001');
  const [isSimulatingTerminal, setIsSimulatingTerminal] = useState(false);
  const [terminalMessage, setTerminalMessage] = useState('Pronto para processar');
  const [error, setError] = useState('');

  const currentTerm = DEFAULT_TERMINALS.find((t) => t.terminal_id === selectedTerminal) || DEFAULT_TERMINALS[0];

  const handleSimulateTerminalHandshake = () => {
    setIsSimulatingTerminal(true);
    setTerminalMessage('Enviando valor para o Terminal POS...');
    setTimeout(() => {
      setTerminalMessage('Insira ou aproxime o Cartão no POS...');
      setTimeout(() => {
        const autoAuth = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
        setAuthCode(autoAuth);
        if (!cardLastFour) setCardLastFour('4281');
        setTerminalMessage('Transação Aprovada pela Rede SIMO!');
        setIsSimulatingTerminal(false);
      }, 1500);
    }, 1200);
  };

  const handleProcessTransaction = () => {
    const finalAuth = authCode.trim() || `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    onConfirm({
      terminalId: selectedTerminal,
      cardScheme,
      authCode: finalAuth,
      cardLastFour: cardLastFour.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Terminal Selection & Status */}
      <div className="p-3.5 rounded-lg border border-cyan-200 bg-cyan-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-md bg-white border border-slate-200 shadow-sm shrink-0">
            <CreditCard size={20} className="text-cyan-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase">Terminal POS Bancário</span>
              <Badge variant="cyan" className="flex items-center gap-1">
                <Wifi size={10} />
                <span>ONLINE SIMO</span>
              </Badge>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Conexão com terminais de pagamento por cartão bancário de Moçambique.
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:pl-4 border-slate-300 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
          <span className="text-[10px] text-slate-500 uppercase">Valor do Débito/Crédito</span>
          <span className="text-base font-bold text-cyan-800 font-mono">{formatMZN(amount)}</span>
        </div>
      </div>

      {/* Terminal Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
            Seleccionar Terminal POS
          </label>
          <select
            value={selectedTerminal}
            onChange={(e) => setSelectedTerminal(e.target.value)}
            className="w-full text-xs font-mono p-2 rounded-md border border-slate-300 bg-white font-semibold"
          >
            {DEFAULT_TERMINALS.map((t) => (
              <option key={t.terminal_id} value={t.terminal_id}>
                {t.terminal_id} — {t.bank_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
            Bandeira / Esquema do Cartão
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['VISA', 'MASTERCARD', 'SIMO_DEBITO'].map((scheme) => (
              <button
                key={scheme}
                type="button"
                onClick={() => setCardScheme(scheme)}
                className={`py-1.5 px-2 rounded border text-[11px] font-bold transition ${
                  cardScheme === scheme
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {scheme.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hardware Handshake & Auth Capture */}
      <div className="panel-inset p-3 rounded-lg space-y-3 bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
            <ShieldCheck size={14} className="text-cyan-700" />
            <span>Dados de Autorização do POS</span>
          </div>
          <button
            type="button"
            onClick={handleSimulateTerminalHandshake}
            disabled={isSimulatingTerminal}
            className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 underline"
          >
            <RefreshCw size={12} className={isSimulatingTerminal ? 'animate-spin' : ''} />
            <span>{isSimulatingTerminal ? 'Comunicando com POS...' : 'Enviar Valor p/ Terminal'}</span>
          </button>
        </div>

        {isSimulatingTerminal && (
          <div className="p-2 bg-cyan-100/70 border border-cyan-300 rounded text-cyan-900 text-[11px] animate-pulse">
            📡 {terminalMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            label="Código de Autorização (Auth Code)"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
            placeholder="Ex: AUTH-789120"
            className="text-xs font-mono font-bold uppercase bg-white"
          />
          <Input
            label="Últimos 4 Dígitos do Cartão"
            value={cardLastFour}
            maxLength={4}
            onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, ''))}
            placeholder="Ex: 4821"
            className="text-xs font-mono bg-white"
          />
          <Input
            label="Lote / Batch (Opcional)"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="LOTE-001"
            className="text-xs font-mono bg-white"
          />
        </div>
      </div>

      {/* Action Button */}
      <Button
        variant="primary"
        size="md"
        onClick={handleProcessTransaction}
        disabled={isLoading}
        className="w-full py-3 text-sm flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md font-bold"
      >
        <CheckCircle2 size={18} />
        <span>💳 Conectar & Confirmar Terminal Bancário ({formatMZN(amount)})</span>
      </Button>
    </div>
  );
}
