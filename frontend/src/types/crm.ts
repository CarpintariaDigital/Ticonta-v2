export interface Customer {
  id: number | string;
  company_id?: number | string;
  name: string;
  phone?: string;
  email?: string;
  nuit?: string;
  address?: string;
  trust_score?: number; // 1-5
  fiado_balance?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id: number | string;
  customer_id: number | string;
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

export type LeadStage = "novo" | "contactado" | "qualificado" | "proposta" | "negociacao" | "convertido" | "perdido" | string;

export interface Lead {
  id: number | string;
  company_id: number;
  name: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  value: number;
  probability: number;
  source: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CRMFilters {
  source?: string;
  search?: string;
  stage?: string;
}
