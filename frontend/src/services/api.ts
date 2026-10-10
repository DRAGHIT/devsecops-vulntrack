import { 
  Asset, 
  AssetFormData, 
  DashboardSummary, 
  UserRole, 
  Vulnerability, 
  VulnerabilityFormData, 
  VulnerabilityStatus 
} from '../types';

const API_BASE = '/api';

let currentRole: UserRole = 'ADMIN';

export const setApiRole = (role: UserRole) => {
  currentRole = role;
};

export const getApiRole = (): UserRole => {
  return currentRole;
};

const getAuthHeaders = (): HeadersInit => {
  // Use HTTP Basic Auth matching our Spring Security in-memory users
  const credentials = currentRole === 'ADMIN' 
    ? 'admin:AdminSecurePassword!2026' 
    : 'viewer:ViewerReadOnlyPassword!2026';
    
  return {
    'Authorization': `Basic ${btoa(credentials)}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.validationErrors) {
        const details = Object.entries(errorData.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        errorMessage += ` (${details})`;
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
};

export const api = {
  // Dashboard
  async getDashboard(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<DashboardSummary>(res);
  },

  // Assets
  async getAssets(): Promise<Asset[]> {
    const res = await fetch(`${API_BASE}/assets`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Asset[]>(res);
  },

  async createAsset(data: AssetFormData): Promise<Asset> {
    const res = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Asset>(res);
  },

  async deleteAsset(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<void>(res);
  },

  // Vulnerabilities
  async getVulnerabilities(filters?: {
    assetId?: number;
    severity?: string;
    status?: string;
  }): Promise<Vulnerability[]> {
    const params = new URLSearchParams();
    if (filters?.assetId) params.append('assetId', filters.assetId.toString());
    if (filters?.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);

    const url = `${API_BASE}/vulnerabilities${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<Vulnerability[]>(res);
  },

  async createVulnerability(data: VulnerabilityFormData): Promise<Vulnerability> {
    const payload = {
      ...data,
      cveId: data.cveId.trim() ? data.cveId.trim() : null
    };
    const res = await fetch(`${API_BASE}/vulnerabilities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse<Vulnerability>(res);
  },

  async updateVulnerabilityStatus(id: number, status: VulnerabilityStatus): Promise<Vulnerability> {
    const res = await fetch(`${API_BASE}/vulnerabilities/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<Vulnerability>(res);
  },

  async deleteVulnerability(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/vulnerabilities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<void>(res);
  }
};
