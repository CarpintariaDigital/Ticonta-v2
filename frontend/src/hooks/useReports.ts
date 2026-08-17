import { useEffect } from "react";
import { reportsService } from "@/services/reports";
import { useReportsStore } from "@/store/reports.store";
import { ReportFilterOptions, ReportType } from "@/types/reports";

export function useReports() {
  const {
    activeReportType,
    selectedPeriod,
    salesData,
    financialData,
    crmData,
    projectsData,
    hrData,
    isLoading,
    setActiveReportType,
    setSelectedPeriod,
    setSalesData,
    setFinancialData,
    setCRMData,
    setProjectsData,
    setHRData,
    setIsLoading,
  } = useReportsStore();

  const fetchActiveReport = async (type = activeReportType, period = selectedPeriod) => {
    setIsLoading(true);
    try {
      if (type === "sales") {
        const data = await reportsService.getSalesReport();
        setSalesData(data);
      } else if (type === "financial") {
        const data = await reportsService.getFinancialReport(period);
        setFinancialData(data);
      } else if (type === "crm") {
        const data = await reportsService.getCRMReport(period);
        setCRMData(data);
      } else if (type === "projects") {
        const data = await reportsService.getProjectsReport(period);
        setProjectsData(data);
      } else if (type === "hr") {
        const data = await reportsService.getHRReport(period);
        setHRData(data);
      }
    } catch {
      // Handled by service fallbacks
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveReport(activeReportType, selectedPeriod);
  }, [activeReportType, selectedPeriod]);

  return {
    activeReportType,
    selectedPeriod,
    salesData,
    financialData,
    crmData,
    projectsData,
    hrData,
    isLoading,
    setActiveReportType,
    setSelectedPeriod,
    fetchActiveReport,
  };
}
