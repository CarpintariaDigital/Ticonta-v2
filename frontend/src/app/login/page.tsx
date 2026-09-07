'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Cpu,
  Building2,
  Lock,
  Radio
} from 'lucide-react';
import { useAuthStore, User } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { login, company } = useAuthStore();
  const [operatorCode, setOperatorCode] = useState('OP-01');
  const [role, setRole] = useState<User['role']>('Admin');
  const [pin, setPin] = useState('1234');
  const [email, setEmail] = useState('operador@carpintaria.digital');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    router.push('/dashboard');
  };

  const handleQuickSelect = (selRole: User['role'], opCode: string, mail: string) => {
    setRole(selRole);
    setOperatorCode(opCode);
    setEmail(mail);
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col justify-center items-center p-4 workstation-grid selection:bg-emerald-500 selection:text-white">
      {/* Console Frame */}
      <div className="w-full max-w-md space-y-4">
        {/* Terminal Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xl font-bold shadow-md">
            TC
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            TiConta v2 Industrial Terminal
          </h1>
          <p className="text-xs font-mono text-slate-500">
            AUTENTICAÇÃO LOCAL & CONTROLO DE TURNO
          </p>
        </div>

        {/* Login Box */}
        <Card className="border-slate-300 shadow-md">
          <CardHeader className="border-b border-slate-200 pb-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-mono">
                <Lock size={14} className="text-emerald-700" />
                <span>Credenciais de Operador</span>
              </CardTitle>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                OFFLINE ENGINE OK
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Identificador do Operador (Email / Código)"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@carpintaria.digital"
                required
                className="font-mono text-xs"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Perfil de Trabalho
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as User['role'])}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="Admin">Admin / Gerente</option>
                    <option value="Operador">Operador de Caixa</option>
                    <option value="Garçom">Garçom (Restaurante)</option>
                    <option value="Mecânico">Mecânico (Oficina)</option>
                  </select>
                </div>

                <Input
                  label="PIN de Segurança"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={6}
                  required
                  className="font-mono text-xs text-center tracking-widest"
                />
              </div>

              {/* Quick Select Buttons */}
              <div className="pt-1">
                <div className="text-[10px] font-mono text-slate-500 mb-1.5 uppercase">
                  Atalhos Rápidos de Operador:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('Admin', 'OP-01', 'admin@carpintaria.digital')}
                    className={`py-1 px-2 rounded border text-[10px] font-mono text-center transition ${
                      role === 'Admin'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Admin / Gestor
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSelect('Operador', 'OP-02', 'caixa@carpintaria.digital')}
                    className={`py-1 px-2 rounded border text-[10px] font-mono text-center transition ${
                      role === 'Operador'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Caixa PDV
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSelect('Mecânico', 'OP-03', 'oficina@carpintaria.digital')}
                    className={`py-1 px-2 rounded border text-[10px] font-mono text-center transition ${
                      role === 'Mecânico'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Mecânico OS
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" className="w-full flex items-center justify-center gap-2">
                  <span>Abrir Sessão & Turno</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Company & Compliance Footer */}
        <div className="p-3 bg-white/70 border border-slate-300 rounded-lg text-xs font-mono text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-slate-500" />
            <span className="truncate font-semibold">{company.name}</span>
          </div>
          <span className="text-[10px] text-slate-500">NUIT {company.nuit}</span>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs font-mono text-slate-500 hover:text-slate-800 underline">
            ← Voltar para a Apresentação TiConta
          </Link>
        </div>
      </div>
    </div>
  );
}
