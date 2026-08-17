export type LeadStage = "novo" | "proposta" | "ganho" | "perdido";

export type LeadSource = "website" | "referral" | "direct" | "whatsapp" | "phone";

export interface Interaction {
  id: number;
  lead_id: number;
  user_id: number;
  user_name?: string;
  type: "call" | "meeting" | "email" | "whatsapp" | "note" | "proposal";
  description: string;
  date: string;
  created_at: string;
}

export interface Lead {
  id: number;
  company_id: number;
  name: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  value: number;
  probability: number;
  source: LeadSource;
  notes?: string;
  assigned_user_id?: number;
  created_at: string;
  updated_at: string;
  interactions?: Interaction[];
}

export interface CreateLeadInput {
  company_id?: number;
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  value: number;
  probability?: number;
  notes?: string;
}

export interface CreateInteractionInput {
  type: "call" | "meeting" | "email" | "whatsapp" | "note" | "proposal";
  description: string;
  date?: string;
}

export interface PipelineStageMetrics {
  stage: string;
  count: number;
  total_value: number;
  average_probability: number;
}

export interface PipelineAnalysis {
  company_id: number;
  total_leads: number;
  total_pipeline_value: number;
  weighted_pipeline_value: number;
  stages: PipelineStageMetrics[];
}

export interface CRMAnalytics {
  company_id: number;
  total_leads: number;
  won_leads: number;
  lost_leads: number;
  active_leads: number;
  win_rate_percentage: number;
  conversion_by_source: {
    source: string;
    total_leads: number;
    won_leads: number;
    win_rate_percentage: number;
  }[];
  average_deal_size: number;
  total_revenue_won: number;
  average_days_in_pipeline: number;
}
