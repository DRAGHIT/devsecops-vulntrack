import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Server, 
  AlertCircle, 
  X, 
  Clock, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { Asset, AssetFormData, AssetType, Environment, UserRole } from '../types';

interface AssetViewProps {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  currentRole: UserRole;
  onRefresh: () => void;
  onCreateAsset: (data: AssetFormData) => Promise<void>;
  onDeleteAsset: (id: number) => Promise<void>;
}

export const AssetView: React.FC<AssetViewProps> = ({
  assets,
  loading,
  error,
  currentRole,
  onRefresh,
  onCreateAsset,
  onDeleteAsset
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    type: 'WEB_APPLICATION',
    environment: 'PRODUCTION',
    description: ''
  });

  const handleOpenModal = () => {
    if (currentRole === 'VIEWER') {
      alert('Access Denied: The VIEWER role has read-only access. Switch to ADMIN to add assets.');
      return;
    }
    setFormData({
      name: '',
      type: 'WEB_APPLICATION',
      environment: 'PRODUCTION',
      description: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Asset name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await onCreateAsset(formData);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (currentRole === 'VIEWER') {
      alert('Access Denied: The VIEWER role has read-only access. Switch to ADMIN to delete assets.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete asset "${name}"? This will also remove linked vulnerabilities.`)) {
      try {
        await onDeleteAsset(id);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete asset');
      }
    }
  };

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Software Asset Catalog</h1>
          <p className="view-subtitle">Registered infrastructure, services, and web applications</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onRefresh}>
            Refresh
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleOpenModal}
            disabled={currentRole === 'VIEWER'}
            title={currentRole === 'VIEWER' ? 'Only ADMIN can create assets' : 'Add new asset'}
          >
            <Plus size={18} />
            <span>New Asset</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && assets.length === 0 ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p>Loading asset inventory...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="state-container glass-panel">
          <Server size={42} color="var(--text-muted)" />
          <h3>No Assets Registered</h3>
          <p>Register your first software application or database to start tracking vulnerabilities.</p>
          {currentRole === 'ADMIN' && (
            <button className="btn btn-primary" onClick={handleOpenModal}>
              <Plus size={16} />
              <span>Register Asset</span>
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Environment</th>
                <th>Active Findings</th>
                <th>Description</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>#{asset.id}</td>
                  <td>
                    <strong>{asset.name}</strong>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
                      {asset.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-env">{asset.environment}</span>
                  </td>
                  <td>
                    {asset.vulnerabilityCount > 0 ? (
                      <span className="badge badge-sev-critical">
                        <ShieldAlert size={12} />
                        {asset.vulnerabilityCount} findings
                      </span>
                    ) : (
                      <span className="badge badge-status-fixed">
                        <CheckCircle size={12} />
                        0 findings
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '280px' }}>
                    {asset.description || <span style={{ color: 'var(--text-muted)' }}>None provided</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} />
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(asset.id, asset.name)}
                      disabled={currentRole === 'VIEWER'}
                      title={currentRole === 'VIEWER' ? 'Disabled for VIEWER persona' : 'Delete asset'}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Creation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Software Asset</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="alert-box">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Asset Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Payments Gateway Microservice"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asset Type *</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
                >
                  <option value="WEB_APPLICATION">Web Application</option>
                  <option value="API">REST / GraphQL API</option>
                  <option value="DATABASE">Database</option>
                  <option value="SERVER">Server / Host</option>
                  <option value="MOBILE_APP">Mobile Application</option>
                  <option value="CLOUD_SERVICE">Cloud Service</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Environment *</label>
                <select
                  className="form-select"
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as Environment })}
                >
                  <option value="PRODUCTION">Production</option>
                  <option value="STAGING">Staging</option>
                  <option value="DEVELOPMENT">Development</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Briefly describe what this asset does and who maintains it..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
