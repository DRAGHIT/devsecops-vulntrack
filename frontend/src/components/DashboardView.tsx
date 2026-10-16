import React from 'react';
import {
  Server,
  AlertCircle,
  Flame,
  CheckCircle2,
  ShieldAlert,
  Clock,
  RefreshCw,
  PieChart,
  Workflow
} from 'lucide-react';
import { DashboardSummary } from '../types';
import { SeverityDonut } from './charts/SeverityDonut';

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

  // Calculate severity proportions for the donut chart
  const totalFindings = Object.values(summary.severityCounts).reduce((a, b) => a + b, 0);

  // Remediation lifecycle: the API reports OPEN and FIXED counts directly;
  // IN_PROGRESS is derived so all three lifecycle stages always sum to the total.
  const inProgressCount = Math.max(totalFindings - summary.openVulnerabilities - summary.fixedVulnerabilities, 0);
  const lifecycleStages = [
    { key: 'OPEN', label: 'Open', count: summary.openVulnerabilities, color: 'var(--status-open)' },
    { key: 'IN_PROGRESS', label: 'In Progress', count: inProgressCount, color: 'var(--status-progress)' },
    { key: 'FIXED', label: 'Fixed', count: summary.fixedVulnerabilities, color: 'var(--status-fixed)' },
  ];

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

      {/* Charts Row: Severity Donut + Remediation Lifecycle */}
      <div className="dashboard-charts-grid">
        <div className="glass-panel chart-panel">
          <div className="chart-panel-header">
            <PieChart size={18} color="var(--primary)" />
            <div>
              <h3>Vulnerability Severity Distribution</h3>
              <p className="chart-panel-subtitle">Total Findings: {totalFindings}</p>
            </div>
          </div>

          <div className="donut-layout">
            <SeverityDonut severityCounts={summary.severityCounts} />
            <div className="severity-legend donut-legend">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
                const count = summary.severityCounts[sev] || 0;
                const pct = totalFindings > 0 ? ((count / totalFindings) * 100).toFixed(0) : 0;
                return (
                  <div className="legend-item" key={sev}>
                    <span className={`legend-dot ${sev}`}></span>
                    <span>{sev.charAt(0) + sev.slice(1).toLowerCase()}: <strong>{count}</strong> ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-panel chart-panel">
          <div className="chart-panel-header">
            <Workflow size={18} color="var(--status-progress)" />
            <div>
              <h3>Remediation Lifecycle</h3>
              <p className="chart-panel-subtitle">Findings tracked from discovery to resolution</p>
            </div>
          </div>

          <div className="lifecycle-list">
            {lifecycleStages.map((stage) => {
              const pct = totalFindings > 0 ? (stage.count / totalFindings) * 100 : 0;
              return (
                <div className="lifecycle-row" key={stage.key} data-testid={`lifecycle-${stage.key}`}>
                  <div className="lifecycle-row-header">
                    <span className="lifecycle-label">{stage.label}</span>
                    <span className="lifecycle-values">
                      <strong>{stage.count}</strong>
                      <span className="lifecycle-pct">{pct.toFixed(0)}%</span>
                    </span>
                  </div>
                  <div className="lifecycle-track">
                    <div
                      className="lifecycle-fill"
                      style={{ width: `${pct}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lifecycle-footer">
            <CheckCircle2 size={15} color="var(--status-fixed)" />
            <span>
              {totalFindings > 0
                ? `${((summary.fixedVulnerabilities / totalFindings) * 100).toFixed(0)}% of all findings have been remediated`
                : 'No findings recorded yet'}
            </span>
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
