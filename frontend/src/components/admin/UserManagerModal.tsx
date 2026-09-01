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

  const handleDeleteUser = (id: string) => {
    if (confirm("Tem certeza que deseja eliminar este utilizador?")) {
      const updated = users.filter((u) => u.id !== id);
      saveUsers(updated);
    }
  };

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setName("");
    setUsername("");
    setEmail("");
    setRole("cashier");
    setPinCode("");
    setSelectedPermissions(["pos", "informal", "xitique"]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email || "");
    setRole(user.role);
    setPinCode(user.pin_code);
    setSelectedPermissions(user.module_permissions);
    setIsFormOpen(true);
  };

  const handleTogglePermission = (moduleId: string) => {
    if (selectedPermissions.includes(moduleId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== moduleId));
    } else {
      setSelectedPermissions([...selectedPermissions, moduleId]);
    }
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === AVAILABLE_MODULES.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(AVAILABLE_MODULES.map((m) => m.id));
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !pinCode) return;

    if (editingUserId) {
      const updated = users.map((u) =>
        u.id === editingUserId
          ? {
              ...u,
              name,
              username,
              email,
              role,
              pin_code: pinCode,
              module_permissions: selectedPermissions,
            }
          : u
      );
      saveUsers(updated);
    } else {
      const newUser: AppUser = {
        id: `usr-${Date.now()}`,
        name,
        username,
        email,
        role,
        pin_code: pinCode,
        terminal_access: ["CX01"],
        module_permissions: selectedPermissions,
        active: true,
        last_login: "Nunca",
      };
      saveUsers([...users, newUser]);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingUserId(null);
  };

  const getRoleBadge = (role: AppUser["role"]) => {
    switch (role) {
      case "admin":
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Admin Master</span>;
      case "manager":
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Gerente</span>;
      case "cashier":
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Caixa POS</span>;
      case "stock_manager":
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Armazém</span>;
      case "waiter":
        return <span className="bg-sky-100 text-sky-800 border border-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Garçom</span>;
      case "accountant":
        return <span className="bg-teal-100 text-teal-800 border border-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Contabilista</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                Gestão de Utilizadores & Permissões
              </h2>
              <p className="text-xs text-zinc-500">
                Controlo de operadores de caixa, gerentes e acessos restritos por módulo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-700 rounded-full hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!isFormOpen ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                  Utilizadores Registados ({users.length})
                </span>
                <Button
                  onClick={handleOpenCreate}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Utilizador</span>
                </Button>
              </div>

              {/* Table */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                    <tr>
                      <th className="py-3 px-4">Nome & Utilizador</th>
                      <th className="py-3 px-4">Função</th>
                      <th className="py-3 px-4">PIN / Senha</th>
                      <th className="py-3 px-4">Módulos</th>
                      <th className="py-3 px-4">Último Acesso</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {users.map((u) => {
                      return (
                        <tr key={u.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-zinc-900 block">{u.name}</span>
                            <span className="text-[11px] text-zinc-500 font-mono">@{u.username}</span>
                          </td>
                          <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-zinc-600">
                            •••• <span className="text-[10px] text-zinc-500 font-normal">({u.pin_code.length}d)</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[11px] font-mono text-emerald-700 font-bold">
                              {u.module_permissions.length} módulos
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[11px] text-zinc-500">{u.last_login}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleActive(u.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                u.active
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border-rose-300"
                              }`}
                            >
                              {u.active ? "Ativo" : "Bloqueado"}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {u.username !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
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
            <form onSubmit={handleSaveUser} className="space-y-4 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <h3 className="text-sm font-bold text-zinc-900">
                  {editingUserId ? "Editar Utilizador & Permissões" : "Novo Registo de Utilizador"}
                </h3>
                <button type="button" onClick={resetForm} className="text-xs text-zinc-500 hover:text-zinc-800">
                  Voltar à Lista
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Nome Completo *</label>
                  <Input
                    required
                    placeholder="ex: João Manuel Sitoe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Nome de Utilizador / Login *</label>
                  <Input
                    required
                    placeholder="ex: joao.sitoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Cargo / Função *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AppUser["role"])}
                    className="w-full h-10 px-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 text-xs"
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
                  <label className="block text-zinc-700 font-semibold mb-1">PIN de Acesso Rápido (4 dígitos) *</label>
                  <Input
                    type="password"
                    maxLength={6}
                    placeholder="ex: 1234"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="bg-white border-zinc-300 text-zinc-900 font-mono"
                  />
                </div>
              </div>

              {/* Granular Module Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wider block font-mono">
                    Permissões Granulares por Módulo
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold"
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
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        <span className="truncate">{mod.name}</span>
                        {isChecked ? (
                          <Check className="w-4 h-4 text-emerald-700 shrink-0 ml-1" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-zinc-300 shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={resetForm} className="border-zinc-300">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold">
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
