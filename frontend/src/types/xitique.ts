export type XitiqueType = 'MONETARY' | 'PRODUCTS';
export type XitiquePeriod = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type XitiqueOrderType = 'FIXED' | 'LOTTERY';
export type XitiqueStatus = 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
export type MemberStatus = 'ACTIVE' | 'DEFAULTED' | 'REMOVED';
export type ContributionStatus = 'PENDING' | 'PAID' | 'LATE' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'MPESA' | 'TRANSFER';
export type DeliveryStatus = 'PENDING' | 'DELIVERED';

export interface XitiqueMemberInput {
  name: string;
  phone?: string;
  receive_order?: number;
}

export interface XitiqueGroup {
  id: number;
  name: string;
  type: XitiqueType;
  product_description?: string;
  contribution_value: number;
  currency: string;
  period: XitiquePeriod;
  total_members: number;
  current_round: number;
  total_rounds: number;
  order_type: XitiqueOrderType;
  status: XitiqueStatus;
  start_date?: string;
  end_date?: string;
  total_pot: number;
  collected_pot?: number;
  round_progress_pct?: number;
}

export interface XitiqueMember {
  id: number;
  name: string;
  phone: string;
  receive_order: number;
  status: MemberStatus;
  total_paid: number;
  total_received: number;
}

export interface XitiqueContribution {
  id: number;
  member_id: number;
  member_name: string;
  member_phone: string;
  round_number: number;
  amount: number;
  paid_at?: string;
  status: ContributionStatus;
  payment_method?: PaymentMethod;
}

export interface XitiqueDelivery {
  id: number;
  member_id: number;
  beneficiary_name: string;
  round_number: number;
  amount_delivered: number;
  delivered_at?: string;
  status: DeliveryStatus;
  notes?: string;
}

export interface XitiqueReminder {
  member_id: number;
  member_name: string;
  member_phone: string;
  amount: number;
  message: string;
  whatsapp_url: string;
}

export interface GroupSummary {
  group: XitiqueGroup;
  next_beneficiary?: {
    id: number;
    name: string;
    phone: string;
    receive_order: number;
  } | null;
  members: XitiqueMember[];
  current_contributions: XitiqueContribution[];
  deliveries: XitiqueDelivery[];
}
