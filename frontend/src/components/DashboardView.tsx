import React from 'react';
import { 
  Server, 
  AlertCircle, 
  Flame, 
  CheckCircle2, 
  ShieldAlert, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { DashboardSummary } from '../types';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onNavigateToVulnerabilities: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  loading,
  error,
  onRefresh,
  onNavigateToVulnerabilities
}) => {
  if (loading && !summary) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Fetching real-time security telemetry from Spring Boot API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <div className="alert-box">
          <AlertCircle size={20} />
          <span>Error loading dashboard metrics: {error}</span>
        </div>
        <button className="btn btn-secondary" onClick={onRefresh}>
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (!summary) return null;

  // Calculate severity proportions for the breakdown bar
  const totalFindings = Object.values(summary.severityCounts).reduce((a, b) => a + b, 0);
  const criticalPct = totalFindings > 0 ? ((summary.severityCounts['CRITICAL'] || 0) / totalFindings) * 100 : 0;
  const highPct = totalFindings > 0 ? ((summary.severityCounts['HIGH'] || 0) / totalFindings) * 100 : 0;
  const mediumPct = totalFindings > 0 ? ((summary.severityCounts['MEDIUM'] || 0) / totalFindings) * 100 : 0;
  const lowPct = totalFindings > 0 ? ((summary.severityCounts['LOW'] || 0) / totalFindings) * 100 : 0;

  return (
    <div>
      <div className="view-header">
        <div>
          <h1 className="view-title">Security Posture Dashboard</h1>
          <p className="view-subtitle">Live vulnerability posture across enterprise software assets</p>
        </div>
        <button className="btn btn-secondary" onClick={onRefresh} title="Refresh metrics">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper blue">
            <Server size={26} />
          </div>
          <div>
            <div className="stat-value">{summary.totalAssets}</div>
            <div className="stat-title">Tracked Assets</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper red">
            <Flame size={26} />
          </div>
          <div>
            <div className="stat-value">{summary.criticalVulnerabilities}</div>
            <div className="stat-title">Critical Severity Risks</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper purple">
            <AlertCircle size={26} />
          </div>
          <div>
            <div className="stat-value">{summary.openVulnerabilities}</div>
            <div className="stat-title">Open Findings</div>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="stat-value">{summary.fixedVulnerabilities}</div>
            <div className="stat-title">Remediated / Fixed</div>
          </div>
        </div>
      </div>

      {/* Severity Breakdown Bar */}
      <div className="glass-panel severity-bar-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Vulnerability Severity Distribution</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total Findings: {totalFindings}
          </span>
        </div>

        <div className="severity-breakdown-bar">
          <div className="sev-bar-segment CRITICAL" style={{ width: `${criticalPct}%` }} title={`Critical: ${summary.severityCounts['CRITICAL'] || 0}`} />
          <div className="sev-bar-segment HIGH" style={{ width: `${highPct}%` }} title={`High: ${summary.severityCounts['HIGH'] || 0}`} />
          <div className="sev-bar-segment MEDIUM" style={{ width: `${mediumPct}%` }} title={`Medium: ${summary.severityCounts['MEDIUM'] || 0}`} />
          <div className="sev-bar-segment LOW" style={{ width: `${lowPct}%` }} title={`Low: ${summary.severityCounts['LOW'] || 0}`} />
        </div>

        <div className="severity-legend">
          <div className="legend-item">
            <span className="legend-dot CRITICAL"></span>
            <span>Critical: <strong>{summary.severityCounts['CRITICAL'] || 0}</strong> ({criticalPct.toFixed(0)}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot HIGH"></span>
            <span>High: <strong>{summary.severityCounts['HIGH'] || 0}</strong> ({highPct.toFixed(0)}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot MEDIUM"></span>
            <span>Medium: <strong>{summary.severityCounts['MEDIUM'] || 0}</strong> ({mediumPct.toFixed(0)}%)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot LOW"></span>
            <span>Low: <strong>{summary.severityCounts['LOW'] || 0}</strong> ({lowPct.toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Recent Discoveries Table */}
      <div className="glass-panel" style={{ padding: '1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem 1.25rem' }}>
          <div>
            <h3>Recent Vulnerability Discoveries</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Latest security findings logged by the AppSec team</p>
          </div>
          <button className="btn btn-secondary" onClick={onNavigateToVulnerabilities} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            View All Findings →
          </button>
        </div>

        {summary.recentFindings.length === 0 ? (
          <div className="state-container" style={{ padding: '2rem' }}>
            <ShieldAlert size={36} color="var(--text-muted)" />
            <p>No vulnerabilities logged yet. Your assets are currently clean!</p>
          </div>
        ) : (
          <div className="table-container" style={{ borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Finding Title</th>
                  <th>CVE ID</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Impacted Asset</th>
                  <th>Discovered</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentFindings.map((finding) => (
                  <tr key={finding.id}>
                    <td>
                      <strong>{finding.title}</strong>
                    </td>
                    <td>
                      {finding.cveId ? (
                        <span className="badge badge-cve">{finding.cveId}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Internal Flaw</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-sev-${finding.severity.toLowerCase()}`}>
                        {finding.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-status-${finding.status.toLowerCase().replace('_', '-')}`}>
                        {finding.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{finding.assetName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} />
                        {new Date(finding.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
