import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('access_token') : null;
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
};

export interface AdminLicenseItem {
  id: number;
  license_key: string;
  customer_name: string;
  customer_email?: string;
  customer_id: string;
  plan: 'basic' | 'professional' | 'complete' | 'enterprise';
  status: 'active' | 'expired' | 'revoked';
  issued_at: string;
  expires_at: string;
  days_remaining: number;
  validation_count: number;
}

export interface LicenseListResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  items: AdminLicenseItem[];
}

export interface LicenseDetail {
  id: number;
  license_key: string;
  customer_name: string;
  customer_email?: string;
  customer_id: string;
  plan: string;
  status: string;
  issued_at: string;
  expires_at: string;
  days_remaining: number;
  modules: string[];
  created_by_id?: number;
  renewed_by_id?: number;
  revoked_at?: string;
  revoke_reason?: string;
  last_validated_at?: string;
  validation_count: number;
  issue_count: number;
}

export interface GenerateLicensePayload {
  customer_name: string;
  customer_email?: string;
  plan: string;
  days: number;
  customer_id?: string;
}

export interface AdminStatsResponse {
  total_licenses: number;
  active_licenses: number;
  active_revenue_mzn: number;
  expired_licenses: number;
  revoked_licenses: number;
  upcoming_expirations_30_days: number;
  total_estimated_revenue_mzn: number;
  average_license_value_mzn: number;
  by_plan: Record<string, { count: number; revenue_mzn: number }>;
  revenue_trend: Array<{ month: string; revenue_mzn: number; licenses_count: number }>;
}

export interface AdminUsageResponse {
  customers_usage: Array<{
    id: number;
    customer_name: string;
    customer_id: string;
    plan: string;
    validation_count: number;
    last_validated_at?: string;
    sales_count: number;
    api_calls_count: number;
    estimated_storage_mb: number;
  }>;
}

export const AdminLicensingService = {
  async getLicenses(params: {
    page?: number;
    limit?: number;
    plan?: string;
    status?: string;
    search?: string;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }): Promise<LicenseListResponse> {
    const res = await axios.get(`${API_BASE_URL}/api/v1/admin/licenses`, {
      ...getAuthHeaders(),
      params,
    });
    return res.data;
  },

  async getLicenseById(id: number): Promise<LicenseDetail> {
    const res = await axios.get(`${API_BASE_URL}/api/v1/admin/licenses/${id}`, getAuthHeaders());
    return res.data;
  },

  async generateLicense(data: GenerateLicensePayload): Promise<any> {
    const res = await axios.post(`${API_BASE_URL}/api/v1/admin/licenses/generate`, data, getAuthHeaders());
    return res.data;
  },

  async renewLicense(id: number, days: number): Promise<{ message: string; license_key: string; new_expiry: string; days_remaining: number }> {
    const res = await axios.put(`${API_BASE_URL}/api/v1/admin/licenses/${id}/renew`, { days }, getAuthHeaders());
    return res.data;
  },

  async revokeLicense(id: number, reason: string): Promise<{ message: string; status: string; revoked_at: string; reason: string }> {
    const res = await axios.post(`${API_BASE_URL}/api/v1/admin/licenses/${id}/revoke`, { reason }, getAuthHeaders());
    return res.data;
  },

  async resendLicenseEmail(id: number, email?: string): Promise<{ message: string }> {
    const res = await axios.post(`${API_BASE_URL}/api/v1/admin/licenses/${id}/resend-email`, { email }, getAuthHeaders());
    return res.data;
  },

  async getStats(): Promise<AdminStatsResponse> {
    const res = await axios.get(`${API_BASE_URL}/api/v1/admin/licenses/stats`, getAuthHeaders());
    return res.data;
  },

  async getUsage(): Promise<AdminUsageResponse> {
    const res = await axios.get(`${API_BASE_URL}/api/v1/admin/licenses/usage`, getAuthHeaders());
    return res.data;
  },
};
