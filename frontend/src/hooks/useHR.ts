import { useEffect, useState } from "react";
import { hrService } from "@/services/hr";
import { useHRStore } from "@/store/hr.store";
import {
  CreateEmployeeInput,
  Employee,
  MonthlyPayrollSummary,
  RecordAttendanceInput,
} from "@/types/hr";

export function useHR() {
  const {
    employees,
    currentPayroll,
    selectedPeriod,
    isLoading,
    setEmployees,
    setCurrentPayroll,
    setSelectedPeriod,
    setIsLoading,
    addEmployeeToState,
    updateEmployeeInState,
  } = useHRStore();

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await hrService.getEmployees();
      setEmployees(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayroll = async (period = selectedPeriod) => {
    setIsLoading(true);
    try {
      const data = await hrService.getPayroll(period);
      setCurrentPayroll(data);
    } catch {
      setCurrentPayroll(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayroll(selectedPeriod);
  }, [selectedPeriod]);

  const createEmployee = async (data: CreateEmployeeInput): Promise<Employee> => {
    const newEmp = await hrService.createEmployee(data);
    addEmployeeToState(newEmp);
    return newEmp;
  };

  const updateEmployee = async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const updated = await hrService.updateEmployee(id, data);
    updateEmployeeInState(updated);
    return updated;
  };

  const recordAttendance = async (data: RecordAttendanceInput) => {
    return hrService.recordAttendance(data);
  };

  const generatePayroll = async (period: string): Promise<MonthlyPayrollSummary> => {
    setIsLoading(true);
    try {
      const payroll = await hrService.generatePayroll(period);
      setCurrentPayroll(payroll);
      return payroll;
    } finally {
      setIsLoading(false);
    }
  };

  const exportINSSDeclaration = async (period: string) => {
    const res = await hrService.exportINSSDeclarationXML(period);
    // Download do arquivo XML no browser
    const blob = new Blob([res.xml_content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = res.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return res;
  };

  return {
    employees,
    currentPayroll,
    selectedPeriod,
    isLoading,
    fetchEmployees,
    fetchPayroll,
    setSelectedPeriod,
    createEmployee,
    updateEmployee,
    recordAttendance,
    generatePayroll,
    exportINSSDeclaration,
  };
}
