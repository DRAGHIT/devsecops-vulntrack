import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AssetView } from './components/AssetView';
import { VulnerabilityView } from './components/VulnerabilityView';
import { api, setApiRole, getApiRole } from './services/api';
import { 
  Asset, 
  AssetFormData, 
  DashboardSummary, 
  UserRole, 
  Vulnerability, 
  VulnerabilityFormData, 
  VulnerabilityStatus 
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'assets' | 'vulnerabilities'>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>(getApiRole());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashData, assetData, vulnData] = await Promise.all([
        api.getDashboard(),
        api.getAssets(),
        api.getVulnerabilities()
      ]);

      setSummary(dashData);
      setAssets(assetData);
      setVulnerabilities(vulnData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleToggle = () => {
    const nextRole: UserRole = currentRole === 'ADMIN' ? 'VIEWER' : 'ADMIN';
    setApiRole(nextRole);
    setCurrentRole(nextRole);
  };

  // Asset Actions
  const handleCreateAsset = async (data: AssetFormData) => {
    await api.createAsset(data);
    await fetchData();
  };

  const handleDeleteAsset = async (id: number) => {
    await api.deleteAsset(id);
    await fetchData();
  };

  // Vulnerability Actions
  const handleCreateVulnerability = async (data: VulnerabilityFormData) => {
    await api.createVulnerability(data);
    await fetchData();
  };

  const handleUpdateStatus = async (id: number, status: VulnerabilityStatus) => {
    await api.updateVulnerabilityStatus(id, status);
    await fetchData();
  };

  const handleDeleteVulnerability = async (id: number) => {
    await api.deleteVulnerability(id);
    await fetchData();
  };

  return (
    <div className="app-container">
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentRole={currentRole}
        onRoleToggle={handleRoleToggle}
      />

      <main className="main-content">
        {currentTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            loading={loading}
            error={error}
            onRefresh={fetchData}
            onNavigateToVulnerabilities={() => setCurrentTab('vulnerabilities')}
          />
        )}

        {currentTab === 'assets' && (
          <AssetView
            assets={assets}
            loading={loading}
            error={error}
            currentRole={currentRole}
            onRefresh={fetchData}
            onCreateAsset={handleCreateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}

        {currentTab === 'vulnerabilities' && (
          <VulnerabilityView
            vulnerabilities={vulnerabilities}
            assets={assets}
            loading={loading}
            error={error}
            currentRole={currentRole}
            onRefresh={fetchData}
            onCreateVulnerability={handleCreateVulnerability}
            onUpdateStatus={handleUpdateStatus}
            onDeleteVulnerability={handleDeleteVulnerability}
          />
        )}
      </main>
    </div>
  );
};

export default App;
