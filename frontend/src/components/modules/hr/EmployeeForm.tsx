"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { CreateEmployeeInput } from "@/types/hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeInput) => Promise<void>;
  onCancel: () => void;
}

export default function EmployeeForm({ onSubmit, onCancel }: EmployeeFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nuit, setNuit] = useState("");
  const [inssNumber, setInssNumber] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("Produção");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !position.trim()) {
      setError("Nome, apelido e cargo do colaborador são obrigatórios.");
      return;
    }

    const numSalary = parseFloat(salary);
    if (isNaN(numSalary) || numSalary <= 0) {
      setError("Informe um salário base válido em Meticais (MZN).");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        nuit: nuit.trim() || undefined,
        inss_number: inssNumber.trim() || undefined,
        position: position.trim(),
        department,
        salary: numSalary,
        start_date: startDate || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar funcionário.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">
            Primeiro Nome <span className="text-emerald-400">*</span>
          </label>
          <Input
            placeholder="Ex: Manuel"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-white border-zinc-200 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">
            Apelido / Sobrenome <span className="text-emerald-400">*</span>
          </label>
          <Input
            placeholder="Ex: Cossa"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-white border-zinc-200 text-xs"
          />
        </div>
      </div>

      {/* Position & Department */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">
            Cargo / Função <span className="text-emerald-400">*</span>
          </label>
          <Input
            placeholder="Ex: Carpinteiro de Estruturas"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="bg-white border-zinc-200 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">Departamento</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Produção">Produção / Obra</option>
            <option value="Administração">Administração / Finanças</option>
            <option value="Vendas">Vendas / Comercial</option>
            <option value="Logística">Logística / Armazém</option>
          </select>
        </div>
      </div>

      {/* Salary & Start Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">
            Salário Base (MZN) <span className="text-emerald-400">*</span>
          </label>
          <Input
            type="number"
            step="100"
            placeholder="35000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="bg-white border-zinc-200 text-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">Data de Admissão</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white border-zinc-200 text-xs"
          />
        </div>
      </div>

      {/* INSS & NUIT */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">Número INSS (Segurança Social)</label>
          <Input
            placeholder="99887766"
            value={inssNumber}
            onChange={(e) => setInssNumber(e.target.value)}
            className="bg-white border-zinc-200 text-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">NUIT Moçambique</label>
          <Input
            placeholder="400123456"
            value={nuit}
            onChange={(e) => setNuit(e.target.value)}
            className="bg-white border-zinc-200 text-xs font-mono"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">Telefone / Telemóvel</label>
          <Input
            placeholder="+258 84 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white border-zinc-200 text-xs font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700">E-mail</label>
          <Input
            type="email"
            placeholder="colaborador@empresa.co.mz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border-zinc-200 text-xs"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-zinc-200 bg-zinc-50 text-zinc-700 text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !firstName.trim() || !salary}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              A guardar...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Cadastrar Funcionário
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
