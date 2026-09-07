import { apiClient } from "@/services/auth";
import {
  CreateInteractionInput,
  CreateLeadInput,
  CRMAnalytics,
  Interaction,
  Lead,
  LeadStage,
  PipelineAnalysis,
} from "@/types/crm";

export const defaultLeads: Lead[] = [
  {
    id: 1,
    company_id: 1,
    name: "Construções Horizonte Lda",
    email: "obras@horizonte.co.mz",
    phone: "+258 84 123 4567",
    stage: "novo",
    value: 120000,
    probability: 10,
    source: "website",
    notes: "Interessado em fornecimento contínuo de materiais e faturação POS",
    created_at: "2026-08-10T09:00:00Z",
    updated_at: "2026-08-10T09:00:00Z",
    interactions: [
      {
        id: 101,
        lead_id: 1,
        user_id: 1,
        user_name: "Comercial TiConta",
        type: "note",
        description: "Registo inicial no portal web.",
        date: "2026-08-10T09:00:00Z",
        created_at: "2026-08-10T09:00:00Z",
      },
    ],
  },
  {
    id: 2,
    company_id: 1,
    name: "Hotel & Restaurante Polana Mar",
    email: "gerencia@polanamar.co.mz",
    phone: "+258 82 987 6543",
    stage: "proposta",
    value: 280000,
    probability: 60,
    source: "referral",
    notes: "Proposta de implantação de 4 pontos de venda com sincronização e emissão de NFe",
    created_at: "2026-08-08T14:30:00Z",
    updated_at: "2026-08-12T11:20:00Z",
    interactions: [
      {
        id: 102,
        lead_id: 2,
        user_id: 1,
        user_name: "Comercial TiConta",
        type: "meeting",
        description: "Reunião presencial de demonstração do sistema POS e PGC contabilidade.",
        date: "2026-08-11T10:00:00Z",
        created_at: "2026-08-11T10:00:00Z",
      },
    ],
  },
  {
    id: 3,
    company_id: 1,
    name: "Distribuidora Zambeze",
    email: "vendas@zambezedist.co.mz",
    phone: "+258 86 555 4433",
    stage: "ganho",
    value: 450000,
    probability: 100,
    source: "whatsapp",
    notes: "Contrato assinado. Módulo financeiro e faturação homologada.",
    created_at: "2026-08-01T08:00:00Z",
    updated_at: "2026-08-14T16:00:00Z",
    interactions: [
      {
        id: 103,
        lead_id: 3,
        user_id: 1,
        user_name: "Comercial TiConta",
        type: "proposal",
        description: "Contrato fechado com sucesso.",
        date: "2026-08-14T15:30:00Z",
        created_at: "2026-08-14T15:30:00Z",
      },
    ],
  },
  {
    id: 4,
    company_id: 1,
    name: "Auto Peças Matola",
    email: "pecas@matola.co.mz",
    phone: "+258 84 333 2211",
    stage: "perdido",
    value: 75000,
    probability: 0,
    source: "direct",
    notes: "Optou por postergar investimento para o próximo trimestre.",
    created_at: "2026-08-02T10:00:00Z",
    updated_at: "2026-08-05T17:00:00Z",
    interactions: [],
  },
];

export const crmService = {
  async getLeads(filters?: { stage?: LeadStage; source?: string; search?: string }): Promise<Lead[]> {
    try {
      let url = "/api/v1/crm/leads?company_id=1";
      if (filters?.stage) url += `&stage=${filters.stage}`;
      if (filters?.source) url += `&source=${encodeURIComponent(filters.source)}`;
      if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;

      const response = await apiClient.get<Lead[]>(url);
      return response.data;
    } catch {
      return defaultLeads;
    }
  },

  async getLead(id: number): Promise<Lead> {
    const response = await apiClient.get<Lead>(`/api/v1/crm/leads/${id}?company_id=1`);
    return response.data;
  },

  async createLead(data: CreateLeadInput): Promise<Lead> {
    const response = await apiClient.post<Lead>("/api/v1/crm/leads", data);
    return response.data;
  },

  async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    const response = await apiClient.put<Lead>(`/api/v1/crm/leads/${id}?company_id=1`, data);
    return response.data;
  },

  async moveLeadStage(id: number, stage: LeadStage, notes?: string): Promise<Lead> {
    const response = await apiClient.post<Lead>(`/api/v1/crm/leads/${id}/stage?company_id=1`, {
      stage,
      notes,
    });
    return response.data;
  },

  async deleteLead(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/crm/leads/${id}?company_id=1`);
  },

  async addInteraction(leadId: number, data: CreateInteractionInput): Promise<Interaction> {
    const response = await apiClient.post<Interaction>(
      `/api/v1/crm/leads/${leadId}/interactions?company_id=1`,
      data
    );
    return response.data;
  },

  async getPipelineAnalysis(): Promise<PipelineAnalysis> {
    try {
      const response = await apiClient.get<PipelineAnalysis>("/api/v1/crm/pipeline?company_id=1");
      return response.data;
    } catch {
      return {
        company_id: 1,
        total_leads: 4,
        total_pipeline_value: 925000,
        weighted_pipeline_value: 630000,
        stages: [
          { stage: "novo", count: 1, total_value: 120000, average_probability: 10 },
          { stage: "proposta", count: 1, total_value: 280000, average_probability: 60 },
          { stage: "ganho", count: 1, total_value: 450000, average_probability: 100 },
          { stage: "perdido", count: 1, total_value: 75000, average_probability: 0 },
        ],
      };
    }
  },

  async getAnalytics(): Promise<CRMAnalytics> {
    try {
      const response = await apiClient.get<CRMAnalytics>("/api/v1/crm/analytics?company_id=1");
      return response.data;
    } catch {
      return {
        company_id: 1,
        total_leads: 4,
        won_leads: 1,
        lost_leads: 1,
        active_leads: 2,
        win_rate_percentage: 50.0,
        conversion_by_source: [
          { source: "whatsapp", total_leads: 1, won_leads: 1, win_rate_percentage: 100 },
          { source: "referral", total_leads: 1, won_leads: 0, win_rate_percentage: 0 },
          { source: "website", total_leads: 1, won_leads: 0, win_rate_percentage: 0 },
          { source: "direct", total_leads: 1, won_leads: 0, win_rate_percentage: 0 },
        ],
        average_deal_size: 450000,
        total_revenue_won: 450000,
        average_days_in_pipeline: 12.5,
      };
    }
  },
};
