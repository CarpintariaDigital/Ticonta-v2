import { create } from "zustand";
import {
  CRMReportData,
  FinancialReportData,
  HRReportData,
  ProjectsReportData,
  ReportType,
  SalesReportData,
} from "@/types/reports";

interface ReportsState {
  activeReportType: ReportType;
  selectedPeriod: string;
  salesData: SalesReportData | null;
  financialData: FinancialReportData | null;
  crmData: CRMReportData | null;
  projectsData: ProjectsReportData | null;
  hrData: HRReportData | null;
  isLoading: boolean;

  setActiveReportType: (type: ReportType) => void;
  setSelectedPeriod: (period: string) => void;
  setSalesData: (data: SalesReportData | null) => void;
  setFinancialData: (data: FinancialReportData | null) => void;
  setCRMData: (data: CRMReportData | null) => void;
  setProjectsData: (data: ProjectsReportData | null) => void;
  setHRData: (data: HRReportData | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  activeReportType: "sales",
  selectedPeriod: new Date().toISOString().slice(0, 7),
  salesData: null,
  financialData: null,
  crmData: null,
  projectsData: null,
  hrData: null,
  isLoading: false,

  setActiveReportType: (activeReportType) => set({ activeReportType }),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
  setSalesData: (salesData) => set({ salesData }),
  setFinancialData: (financialData) => set({ financialData }),
  setCRMData: (crmData) => set({ crmData }),
  setProjectsData: (projectsData) => set({ projectsData }),
  setHRData: (hrData) => set({ hrData }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
