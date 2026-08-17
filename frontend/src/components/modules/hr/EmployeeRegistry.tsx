"use client";

import { useState } from "react";
import { Plus, Search, UserCheck, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { Employee } from "@/types/hr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmployeeRegistryProps {
  employees: Employee[];
  onOpenCreateModal: () => void;
  onSelectEmployee?: (emp: Employee) => void;
}

export default function EmployeeRegistry({
  employees,
  onOpenCreateModal,
  onSelectEmployee,
}: EmployeeRegistryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const departments = Array.from(new Set(employees.map((e) => e.department || "Geral")));

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.position && e.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.nuit && e.nuit.includes(searchTerm));
    const matchesDept = departmentFilter === "all" || e.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">Quadro de Pessoal & Colaboradores</h3>
          <p className="text-xs text-zinc-400">
            Registo de contratos de trabalho, NUIT e inscrições na Segurança Social (INSS)
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenCreateModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Novo Colaborador
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Pesquisar por nome, cargo ou NUIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-950 border-zinc-800 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 font-semibold">Departamento:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Todos os departamentos</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-400 border-y border-zinc-800 font-mono">
            <tr>
              <th className="py-3 px-4">Nome do Funcionário</th>
              <th className="py-3 px-4">Cargo / Função</th>
              <th className="py-3 px-4">Departamento</th>
              <th className="py-3 px-4">INSS / NUIT</th>
              <th className="py-3 px-4 text-right">Salário Base</th>
              <th className="py-3 px-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                  className={`hover:bg-zinc-900/50 transition-colors ${
                    onSelectEmployee ? "cursor-pointer" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{emp.full_name}</div>
                    {emp.email && <div className="text-[11px] font-normal text-zinc-500">{emp.email}</div>}
                  </td>
                  <td className="py-3 px-4 text-zinc-200">{emp.position}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-400">
                    <div>INSS: {emp.inss_number || "N/A"}</div>
                    <div className="text-[10px]">NUIT: {emp.nuit || "N/A"}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {Number(emp.salary).toLocaleString("pt-MZ")}{" "}
                    <span className="text-[10px] font-normal text-zinc-500">MZN</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {emp.active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Ativo
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        Inativo
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
