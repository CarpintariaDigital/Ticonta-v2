import { useEffect, useState } from "react";
import { crmService } from "@/services/crm";
import { useCRMStore } from "@/store/crm.store";
import {
  CreateInteractionInput,
  CreateLeadInput,
  CRMAnalytics,
  Lead,
  LeadStage,
  PipelineAnalysis,
} from "@/types/crm";

export function useCRM() {
  const {
    leads,
    selectedLead,
    filters,
    isLoading,
    setLeads,
    selectLead,
    setFilters,
    setIsLoading,
    updateLeadInState,
    removeLeadFromState,
  } = useCRMStore();

  const [pipeline, setPipeline] = useState<PipelineAnalysis | null>(null);
  const [analytics, setAnalytics] = useState<CRMAnalytics | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const data = await crmService.getLeads({
        source: filters.source === "all" ? undefined : filters.source,
        search: filters.search || undefined,
      });
      setLeads(data);

      const [pipeData, anaData] = await Promise.all([
        crmService.getPipelineAnalysis(),
        crmService.getAnalytics(),
      ]);
      setPipeline(pipeData);
      setAnalytics(anaData);
    } catch {
      // Ignorar e manter fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters.source, filters.search]);

  const createLead = async (data: CreateLeadInput): Promise<Lead> => {
    const newLead = await crmService.createLead(data);
    await fetchLeads();
    return newLead;
  };

  const updateLead = async (id: number, data: Partial<Lead>): Promise<Lead> => {
    const updated = await crmService.updateLead(id, data);
    updateLeadInState(updated);
    return updated;
  };

  const moveLead = async (id: number, newStage: LeadStage, notes?: string): Promise<Lead> => {
    const updated = await crmService.moveLeadStage(id, newStage, notes);
    updateLeadInState(updated);
    // Atualizar métricas do pipeline em background
    crmService.getPipelineAnalysis().then(setPipeline).catch(() => {});
    crmService.getAnalytics().then(setAnalytics).catch(() => {});
    return updated;
  };

  const deleteLead = async (id: number): Promise<void> => {
    await crmService.deleteLead(id);
    removeLeadFromState(id);
    await fetchLeads();
  };

  const addInteraction = async (leadId: number, data: CreateInteractionInput) => {
    const interaction = await crmService.addInteraction(leadId, data);
    // Atualizar lead selecionado
    if (selectedLead && selectedLead.id === leadId) {
      const refreshed = await crmService.getLead(leadId);
      selectLead(refreshed);
      updateLeadInState(refreshed);
    }
    return interaction;
  };

  return {
    leads,
    selectedLead,
    pipeline,
    analytics,
    filters,
    isLoading,
    fetchLeads,
    createLead,
    updateLead,
    moveLead,
    deleteLead,
    selectLead,
    setFilters,
    addInteraction,
  };
}
