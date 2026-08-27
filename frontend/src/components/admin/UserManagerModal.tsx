"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  Key,
  Plus,
  Check,
  X,
  Lock,
  UserCheck,
  UserX,
  Trash2,
  Edit2,
  Building,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "stock_manager" | "waiter" | "accountant";
  pin_code: string;
  terminal_access: string[];
  module_permissions: string[];
  active: boolean;
  last_login?: string;
}

const AVAILABLE_MODULES = [
  { id: "pos", name: "Ponto de Venda (POS)" },
  { id: "informal", name: "Vendas Informais & Fiado" },
  { id: "xitique", name: "Xitique & Poupanças" },
  { id: "accounting", name: "Contabilidade PGC-NIRF" },
  { id: "restaurant", name: "Restaurante & Mesas" },
  { id: "takeaway", name: "Takeaway & Entregas" },
  { id: "auto_services", name: "Oficina & Serviços Auto" },
  { id: "poultry", name: "Avicultura & Agropecuária" },
  { id: "manufacturing", name: "Marcenaria & Indústria" },
  { id: "projects", name: "Obras & Projetos" },
  { id: "crm", name: "CRM & Clientes" },
  { id: "reports", name: "Relatórios & Fecho de Caixa" },
  { id: "settings", name: "Definições & Licença" },
];

const DEFAULT_USERS: AppUser[] = [
  {
    id: "usr-1",
    name: "Administrador Geral",
    username: "admin",
    email: "admin@empresa.co.mz",
    role: "admin",
    pin_code: "1234",
    terminal_access: ["CX01", "CX02", "MOBILE"],
    module_permissions: AVAILABLE_MODULES.map((m) => m.id),
    active: true,
    last_login: "Hoje às 12:40",
  },
  {
    id: "usr-2",
    name: "Catarina Nhantumbo",
    username: "catarina.pos",
    email: "catarina@empresa.co.mz",
    role: "cashier",
    pin_code: "4421",
    terminal_access: ["CX01"],
    module_permissions: ["pos", "informal", "xitique"],
    active: true,
    last_login: "Hoje às 08:15",
  },
  {
    id: "usr-3",
    name: "Armando Macuácua",
    username: "armando.stock",
    email: "armando@empresa.co.mz",
    role: "stock_manager",
    pin_code: "8890",
    terminal_access: ["CX02"],
    module_permissions: ["pos", "manufacturing", "poultry", "reports"],
    active: true,
    last_login: "Ontem às 17:30",
  },
];

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticonta_store_users");
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    }
    return DEFAULT_USERS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppUser["role"]>("cashier");
  const [pinCode, setPinCode] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "pos",
    "informal",
    "xitique",
  ]);

  if (!isOpen) return null;

  const saveUsers = (updated: AppUser[]) => {
    setUsers(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ticonta_store_users", JSON.stringify(updated));
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = users.map((u) => (u.id === id ? { ...u, active: !u.active } : u));
    saveUsers(updated);
  };

  const handleTogglePermission = (modId: string) => {
    if (selectedPermissions.includes(modId)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== modId));
    } else {
      setSelectedPermissions([...selectedPermissions, modId]);
    }
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(AVAILABLE_MODULES.map((m) => m.id));
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setPinCode(user.pin_code);
    setSelectedPermissions(user.module_permissions);
    setIsFormOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username) return;

    if (editingUserId) {
      const updated = users.map((u) =>
        u.id === editingUserId
          ? {
              ...u,
              name,
              username,
              email,
              role,
              pin_code: pinCode || "1234",
              module_permissions: selectedPermissions,
            }
          : u
      );
      saveUsers(updated);
    } else {
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        name,
        username: username.toLowerCase().replace(/\s+/g, "."),
        email: email || `${username.toLowerCase()}@empresa.co.mz`,
        role,
        pin_code: pinCode || "1234",
        terminal_access: ["CX01"],
        module_permissions: selectedPermissions,
        active: true,
        last_login: "Nunca",
      };
      saveUsers([newUser, ...users]);
    }

    resetForm();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Tem certeza que deseja remover este utilizador?")) {
      saveUsers(users.filter((u) => u.id !== id));
    }
  };

  const resetForm = () => {
    setEditingUserId(null);
    setName("");
    setUsername("");
    setEmail("");
    setRole("cashier");
    setPinCode("");
    setSelectedPermissions(["pos", "informal", "xitique"]);
    setIsFormOpen(false);
  };

  const getRoleLabel = (r: AppUser["role"]) => {
    switch (r) {
      case "admin":
        return { label: "Administrador", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
      case "manager":
        return { label: "Gerente de Loja", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "cashier":
        return { label: "Operador de Caixa", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      case "stock_manager":
        return { label: "Gestor de Stock", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "waiter":
        return { label: "Garçom / Atendente", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
      case "accountant":
        return { label: "Contabilista", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" };
      default:
        return { label: r, color: "bg-zinc-800 text-zinc-300 border-zinc-700" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Gestão de Utilizadores & Permissões (RBAC)
              </h2>
              <p className="text-xs text-slate-400">
                Registo de operadores de caixa, gestores, PINs de acesso e controlo granular de módulos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!isFormOpen ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {users.length} Utilizadores Configurados
                </span>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-950"
                >
                  <Plus className="w-4 h-4" />
                  Registar Novo Utilizador
                </Button>
              </div>

              {/* Users Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Utilizador</th>
                      <th className="py-3 px-4">Cargo / Função</th>
                      <th className="py-3 px-4">PIN Rápido</th>
                      <th className="py-3 px-4">Módulos Permitidos</th>
                      <th className="py-3 px-4">Último Acesso</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {users.map((u) => {
                      const roleMeta = getRoleLabel(u.role);
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{u.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleMeta.color}`}
                            >
                              {roleMeta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                            •••• <span className="text-[10px] text-slate-500">({u.pin_code})</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                              {u.module_permissions.length} módulos
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-slate-400">{u.last_login}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleActive(u.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                u.active
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {u.active ? "Ativo" : "Bloqueado"}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {u.username !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* User Form */
            <form onSubmit={handleSaveUser} className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">
                  {editingUserId ? "Editar Utilizador & Permissões" : "Novo Registo de Utilizador"}
                </h3>
                <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-white">
                  Voltar à Lista
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome Completo *</label>
                  <Input
                    required
                    placeholder="ex: João Manuel Sitoe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome de Utilizador / Login *</label>
                  <Input
                    required
                    placeholder="ex: joao.sitoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cargo / Função *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AppUser["role"])}
                    className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-md text-white"
                  >
                    <option value="cashier">Operador de Caixa (POS)</option>
                    <option value="manager">Gerente de Loja</option>
                    <option value="stock_manager">Gestor de Stock / Armazém</option>
                    <option value="waiter">Garçom / Atendente</option>
                    <option value="accountant">Contabilista</option>
                    <option value="admin">Administrador Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PIN de Acesso Rápido (4 dígitos) *</label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="ex: 1234"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Granular Module Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Permissões Granulares por Módulo
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Selecionar Todos
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = selectedPermissions.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleTogglePermission(mod.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          isChecked
                            ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <span className="truncate">{mod.name}</span>
                        {isChecked ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-700 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={resetForm} className="border-slate-700">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  {editingUserId ? "Guardar Alterações" : "Criar Utilizador"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
