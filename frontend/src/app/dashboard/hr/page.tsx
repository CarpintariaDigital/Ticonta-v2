'use client';

import React, { useEffect, useState } from 'react';
import {
  Users2,
  UserPlus,
  Calendar,
  FileText,
  DollarSign,
  ShieldCheck,
  Download,
  CheckCircle2,
  Clock,
  Building,
  Edit2,
  FileCode,
} from 'lucide-react';
import { useHRStore } from '@/store/hr.store';
import { formatMZN } from '@/lib/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { AttendanceStatus, Employee } from '@/types/hr';

export default function HRPage() {
  const {
    employees,
    payrollSummary,
    inssXml,
    selectedPeriod,
    isLoading,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    recordAttendance,
    generatePayroll,
    fetchPayroll,
    exportINSSXml,
    setSelectedPeriod,
  } = useHRStore();

  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'attendance' | 'reports'>('employees');

  // Modals
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Forms - New/Edit Employee
  const [editingEmpId, setEditingEmpId] = useState<number | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+258 84 ');
  const [nuit, setNuit] = useState('');
  const [inssNumber, setInssNumber] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Operações');
  const [salary, setSalary] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Form
  const [attEmployeeId, setAttEmployeeId] = useState<string>('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('present');
  const [attHours, setAttHours] = useState('8');
  const [attNotes, setAttNotes] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  useEffect(() => {
    fetchEmployees();
    fetchPayroll(selectedPeriod);
  }, [fetchEmployees, fetchPayroll, selectedPeriod]);

  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period);
    await fetchPayroll(period);
  };

  const handleProcessPayroll = async () => {
    try {
      await generatePayroll(selectedPeriod);
    } catch (err) {
      // Handled
    }
  };

  const handleExportXML = async () => {
    try {
      const res = await exportINSSXml(selectedPeriod);
      const blob = new Blob([res.xml_content], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Handled
    }
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmpId(emp.id);
    setFirstName(emp.first_name);
    setLastName(emp.last_name);
    setEmail(emp.email || '');
    setPhone(emp.phone || '+258 84 ');
    setNuit(emp.nuit || '');
    setInssNumber(emp.inss_number || '');
    setPosition(emp.position);
    setDepartment(emp.department);
    setSalary(String(emp.salary));
    setStartDate(emp.start_date);
    setIsEditEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !position || !salary) return;
    try {
      if (editingEmpId) {
        await updateEmployee(editingEmpId, {
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone: phone || null,
          nuit: nuit || null,
          inss_number: inssNumber || null,
          position,
          department,
          salary: parseFloat(salary),
        });
        setIsEditEmployeeModalOpen(false);
      } else {
        await createEmployee({
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone: phone || null,
          nuit: nuit || null,
          inss_number: inssNumber || null,
          position,
          department,
          salary: parseFloat(salary),
          start_date: startDate,
        });
        setIsNewEmployeeModalOpen(false);
      }
      // Reset
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('+258 84 ');
      setNuit('');
      setInssNumber('');
      setPosition('');
      setSalary('');
      setEditingEmpId(null);
    } catch (err) {
      // Handled
    }
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attEmployeeId || !attDate) return;
    try {
      await recordAttendance({
        employee_id: parseInt(attEmployeeId),
        date: attDate,
        status: attStatus,
        hours: parseFloat(attHours) || 8,
        notes: attNotes || undefined,
      });
      setIsAttendanceModalOpen(false);
      setAttNotes('');
    } catch (err) {
      // Handled
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const matchSearch =
      e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      (e.department && e.department.toLowerCase().includes(search.toLowerCase()));
    const matchDept = deptFilter === 'all' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  const totalMassaSalarial = employees.reduce((acc, e) => acc + Number(e.salary || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Users2 className="w-7 h-7 text-emerald-600" />
            Recursos Humanos & Folha de Salários INSS/IRPS
          </h1>
          <p className="text-sm text-neutral-500">
            Conformidade com a Lei do Trabalho de Moçambique: INSS 3% trabalhador + 4% patronal, retenção IRPS e exportação SISSMO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setEditingEmpId(null);
              setIsNewEmployeeModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
          >
            <UserPlus size={15} />
            Admitir Colaborador
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAttendanceModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Clock size={15} />
            Registar Ponto
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-6">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'employees'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Quadro de Colaboradores ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'payroll'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Folha de Salários
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Relatórios & SISSMO
        </button>
      </div>

      {/* TAB 1: COLABORADORES */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Input
                placeholder="Pesquisar por nome ou cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72"
              />
              <select
                className="border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="all">Todos os Departamentos</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-neutral-500">
              Massa Salarial Base: <strong className="text-neutral-900 dark:text-neutral-100">{formatMZN(totalMassaSalarial)}</strong>
            </span>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                  <tr>
                    <th className="p-3 pl-4">Colaborador</th>
                    <th className="p-3">Cargo / Departamento</th>
                    <th className="p-3">NUIT / INSS</th>
                    <th className="p-3 text-right">Salário Base</th>
                    <th className="p-3 text-right">INSS (3%)</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 pr-4 text-right">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredEmployees.map((e) => {
                    const inss3 = Number(e.salary || 0) * 0.03;
                    return (
                      <tr key={e.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition">
                        <td className="p-3 pl-4">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">{e.full_name}</div>
                          <div className="text-xs text-neutral-500">{e.phone || e.email || 'Sem contacto'}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{e.position}</div>
                          <div className="text-xs text-neutral-500">{e.department}</div>
                        </td>
                        <td className="p-3 text-xs text-neutral-500">
                          <div>NUIT: {e.nuit || 'N/A'}</div>
                          <div>INSS: {e.inss_number || 'N/A'}</div>
                        </td>
                        <td className="p-3 text-right font-bold text-neutral-900 dark:text-neutral-100">
                          {formatMZN(e.salary)}
                        </td>
                        <td className="p-3 text-right text-neutral-600 dark:text-neutral-400 font-medium">
                          {formatMZN(inss3)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={e.active ? 'success' : 'neutral'}>
                            {e.active ? 'ACTIVO' : 'INACTIVO'}
                          </Badge>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(e)}
                            className="text-xs h-8"
                          >
                            <Edit2 size={13} className="mr-1" />
                            Editar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        Nenhum colaborador encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: FOLHA DE SALÁRIOS */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold">Período:</label>
              <Input
                type="month"
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-44"
              />
              <Button
                onClick={handleProcessPayroll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                ⚙️ Processar Folha do Mês
              </Button>
            </div>

            {payrollSummary && (
              <Button
                variant="outline"
                onClick={handleExportXML}
                className="flex items-center gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                <FileCode size={15} />
                Exportar XML SISSMO (INSS)
              </Button>
            )}
          </div>

          {/* Payroll KPI Cards */}
          {payrollSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Salários Brutos</span>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {formatMZN(payrollSummary.total_gross)}
                  </div>
                  <span className="text-xs text-neutral-400">{payrollSummary.total_employees} Colaboradores</span>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">INSS Total a Entregar (7%)</span>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatMZN(payrollSummary.total_inss_due)}
                  </div>
                  <span className="text-xs text-neutral-400">3% Trabalhador + 4% Empresa</span>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Retenção IRPS Total</span>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatMZN(payrollSummary.total_irps)}
                  </div>
                  <span className="text-xs text-neutral-400">Tabela de Retenção AT</span>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Líquido a Pagar</span>
                  <div className="text-2xl font-bold text-emerald-600">
                    {formatMZN(payrollSummary.total_net_payable)}
                  </div>
                  <span className="text-xs text-neutral-400">Transferências Bancárias / Caixa</span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payroll Table */}
          <Card>
            <CardHeader className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <CardTitle className="text-base">Detalhamento da Folha - {selectedPeriod}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 font-semibold text-neutral-600 dark:text-neutral-300">
                  <tr>
                    <th className="p-3 pl-4">Colaborador</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3 text-right">Bruto (MZN)</th>
                    <th className="p-3 text-right">INSS 3% (Trabalhador)</th>
                    <th className="p-3 text-right">INSS 4% (Empresa)</th>
                    <th className="p-3 text-right">IRPS Retido</th>
                    <th className="p-3 text-right pr-4">Líquido a Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {payrollSummary?.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                      <td className="p-3 pl-4 font-semibold text-neutral-900 dark:text-neutral-100">
                        {item.employee_name}
                      </td>
                      <td className="p-3 text-neutral-500">{item.position}</td>
                      <td className="p-3 text-right font-medium">{formatMZN(item.gross_salary)}</td>
                      <td className="p-3 text-right text-neutral-600">{formatMZN(item.inss_employee)}</td>
                      <td className="p-3 text-right text-purple-600">{formatMZN(item.inss_employer)}</td>
                      <td className="p-3 text-right text-amber-600">{formatMZN(item.irps)}</td>
                      <td className="p-3 text-right pr-4 font-bold text-emerald-600 text-base">
                        {formatMZN(item.net_salary)}
                      </td>
                    </tr>
                  ))}
                  {(!payrollSummary || payrollSummary.items.length === 0) && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        Nenhuma folha processada para o período {selectedPeriod}. Clica em &ldquo;Processar Folha do Mês&rdquo;.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: RELATÓRIOS & SISSMO */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Guia Fiscal & Obrigações Mensais de Recursos Humanos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    INSS Moçambique (Decreto n.º 51/2017)
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Prazo de entrega e pagamento até ao dia 10 do mês seguinte através do portal SISSMO.
                  </p>
                  <ul className="text-xs list-disc list-inside mt-2 space-y-1 text-neutral-700 dark:text-neutral-300">
                    <li>Contribuição do Trabalhador: 3% deduzido na folha</li>
                    <li>Contribuição Patronal: 4% encargo da entidade empregadora</li>
                    <li>Total a depositar na conta do INSS: 7% da massa salarial</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                    IRPS 2ª Categoria (Trabalho Dependente)
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Retenção na fonte com base na tabela progressiva e entrega à Autoridade Tributária (AT) até ao dia 20 do mês seguinte via Modelo 19 / 20.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: ADMITIR / EDITAR COLABORADOR */}
      {(isNewEmployeeModalOpen || isEditEmployeeModalOpen) && (
        <Modal
          isOpen={isNewEmployeeModalOpen || isEditEmployeeModalOpen}
          onClose={() => {
            setIsNewEmployeeModalOpen(false);
            setIsEditEmployeeModalOpen(false);
          }}
          title={editingEmpId ? 'Editar Colaborador' : 'Admitir Novo Colaborador'}
        >
          <form onSubmit={handleSaveEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primeiro Nome</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Tomás"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apelido</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Tembe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 84 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@empresa.co.mz"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">NUIT (9 dígitos)</label>
                <Input
                  value={nuit}
                  onChange={(e) => setNuit(e.target.value)}
                  placeholder="100234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nº INSS</label>
                <Input
                  value={inssNumber}
                  onChange={(e) => setInssNumber(e.target.value)}
                  placeholder="000123456"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cargo / Função</label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: Marceneiro Sénior"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Departamento</label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Produção"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Salário Base Mensal (MZN)</label>
                <Input
                  type="number"
                  step="100"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="25000"
                  required
                />
              </div>
              {!editingEmpId && (
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Admissão</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewEmployeeModalOpen(false);
                  setIsEditEmployeeModalOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {editingEmpId ? 'Guardar Alterações' : 'Confirmar Admissão'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: REGISTAR PONTO */}
      {isAttendanceModalOpen && (
        <Modal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          title="Registo de Presença / Ponto Diário"
        >
          <form onSubmit={handleRecordAttendance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Colaborador</label>
              <select
                className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                value={attEmployeeId}
                onChange={(e) => setAttEmployeeId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar Colaborador --</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.position})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <Input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado da Presença</label>
                <select
                  className="w-full border border-neutral-300 dark:border-neutral-700 rounded-md p-2 bg-transparent text-sm"
                  value={attStatus}
                  onChange={(e) => setAttStatus(e.target.value as AttendanceStatus)}
                >
                  <option value="present">Presente</option>
                  <option value="absent">Falta Injustificada</option>
                  <option value="leave">Férias / Licença</option>
                  <option value="sick">Baixa Médica</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAttendanceModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Guardar Registo de Ponto
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
