import { describe, it, expect, beforeEach } from "vitest";
import { useCRMStore } from "@/store/crm.store";
import { Lead } from "@/types/crm";

describe("useCRMStore", () => {
  beforeEach(() => {
    useCRMStore.setState({
      leads: [],
      selectedLead: null,
      activeStage: "all",
      filters: { source: "all", search: "" },
      isLoading: false,
    });
  });

  it("sets leads to CRM store state", () => {
    const lead: Lead = {
      id: 1,
      company_id: 1,
      name: "Empresa de Construção Maputo",
      email: "compras@maputo.co.mz",
      phone: "+258841112233",
      stage: "novo",
      value: 120000,
      probability: 25,
      source: "whatsapp",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useCRMStore.getState().setLeads([lead]);

    const state = useCRMStore.getState();
    expect(state.leads).toHaveLength(1);
    expect(state.leads[0].name).toBe("Empresa de Construção Maputo");
    expect(state.leads[0].stage).toBe("novo");
  });

  it("updates lead stage seamlessly in Kanban", () => {
    const lead: Lead = {
      id: 2,
      company_id: 1,
      name: "Movelaria Beira",
      email: "beira@loja.co.mz",
      phone: "+258823334455",
      stage: "novo",
      value: 45000,
      probability: 30,
      source: "referral",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    useCRMStore.getState().setLeads([lead]);
    useCRMStore.getState().updateLeadInState({
      ...lead,
      stage: "proposta",
      probability: 60,
    });

    const state = useCRMStore.getState();
    const updated = state.leads.find((l) => l.id === 2);
    expect(updated?.stage).toBe("proposta");
    expect(updated?.probability).toBe(60);
  });
});
