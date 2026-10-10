export type AssetType = 
  | 'WEB_APPLICATION'
  | 'API'
  | 'DATABASE'
  | 'MOBILE_APP'
  | 'SERVER'
  | 'CLOUD_SERVICE';

export type Environment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VulnerabilityStatus = 'OPEN' | 'IN_PROGRESS' | 'FIXED';

export type UserRole = 'ADMIN' | 'VIEWER';

export interface Asset {
  id: number;
  name: string;
  type: AssetType;
  environment: Environment;
  description?: string;
  createdAt: string;
  vulnerabilityCount: number;
}

export interface Vulnerability {
  id: number;
  title: string;
  cveId?: string;
  description?: string;
  severity: Severity;
  status: VulnerabilityStatus;
  assetId: number;
  assetName: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalAssets: number;
  openVulnerabilities: number;
  criticalVulnerabilities: number;
  fixedVulnerabilities: number;
  severityCounts: Record<string, number>;
  recentFindings: Vulnerability[];
}

export interface AssetFormData {
  name: string;
  type: AssetType;
  environment: Environment;
  description: string;
}

export interface VulnerabilityFormData {
  title: string;
  cveId: string;
  description: string;
  severity: Severity;
  status: VulnerabilityStatus;
  assetId: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
