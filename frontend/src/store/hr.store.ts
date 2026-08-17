import { create } from "zustand";
import { Employee, MonthlyPayrollSummary } from "@/types/hr";

interface HRState {
  employees: Employee[];
  currentPayroll: MonthlyPayrollSummary | null;
  selectedPeriod: string; // YYYY-MM
  isLoading: boolean;

  setEmployees: (employees: Employee[]) => void;
  setCurrentPayroll: (payroll: MonthlyPayrollSummary | null) => void;
  setSelectedPeriod: (period: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  addEmployeeToState: (emp: Employee) => void;
  updateEmployeeInState: (emp: Employee) => void;
}

const currentMonthStr = new Date().toISOString().slice(0, 7); // ex: 2026-08

export const useHRStore = create<HRState>((set) => ({
  employees: [],
  currentPayroll: null,
  selectedPeriod: currentMonthStr,
  isLoading: false,

  setEmployees: (employees) => set({ employees }),
  setCurrentPayroll: (currentPayroll) => set({ currentPayroll }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setIsLoading: (isLoading) => set({ isLoading }),
  addEmployeeToState: (emp) =>
    set((state) => ({ employees: [...state.employees, emp] })),
  updateEmployeeInState: (emp) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === emp.id ? emp : e)),
    })),
}));
