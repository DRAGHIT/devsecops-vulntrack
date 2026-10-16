import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardView } from '../components/DashboardView';
import { DashboardSummary } from '../types';

const mockSummary: DashboardSummary = {
  totalAssets: 12,
  openVulnerabilities: 8,
  criticalVulnerabilities: 3,
  fixedVulnerabilities: 15,
  severityCounts: {
    CRITICAL: 3,
    HIGH: 5,
    MEDIUM: 7,
    LOW: 2
  },
  recentFindings: [
    {
      id: 101,
      title: 'Spring4Shell Remote Code Execution',
      cveId: 'CVE-2022-22965',
      severity: 'CRITICAL',
      status: 'OPEN',
      assetId: 1,
      assetName: 'Customer Portal',
      createdAt: '2026-10-10T12:00:00Z'
    }
  ]
};

describe('DashboardView Component', () => {
  it('renders KPI stat cards with correct metrics from props', () => {
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        error={null}
        onRefresh={vi.fn()}
        onNavigateToVulnerabilities={vi.fn()}
      />
    );

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Tracked Assets')).toBeInTheDocument();

    expect(screen.getAllByText('3')[0]).toBeInTheDocument();
    expect(screen.getByText('Critical Severity Risks')).toBeInTheDocument();

    // '8' (open findings) also appears in the lifecycle panel; assert on the first match
    expect(screen.getAllByText('8')[0]).toBeInTheDocument();
    expect(screen.getByText('Open Findings')).toBeInTheDocument();

    // '15' also appears in the remediation lifecycle panel, so assert on all matches
    expect(screen.getAllByText('15')[0]).toBeInTheDocument();
    expect(screen.getByText('Remediated / Fixed')).toBeInTheDocument();
  });

  it('renders recent vulnerability findings in the table', () => {
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        error={null}
        onRefresh={vi.fn()}
        onNavigateToVulnerabilities={vi.fn()}
      />
    );

    expect(screen.getByText('Spring4Shell Remote Code Execution')).toBeInTheDocument();
    expect(screen.getByText('CVE-2022-22965')).toBeInTheDocument();
    expect(screen.getByText('Customer Portal')).toBeInTheDocument();
  });

  it('renders loading state when loading is true and no summary exists', () => {
    render(
      <DashboardView
        summary={null}
        loading={true}
        error={null}
        onRefresh={vi.fn()}
        onNavigateToVulnerabilities={vi.fn()}
      />
    );

    expect(screen.getByText(/Fetching real-time security telemetry/i)).toBeInTheDocument();
  });

  it('renders error alert when error occurs', () => {
    render(
      <DashboardView
        summary={null}
        loading={false}
        error="Network timeout: Connection refused"
        onRefresh={vi.fn()}
        onNavigateToVulnerabilities={vi.fn()}
      />
    );

    expect(screen.getByText(/Error loading dashboard metrics: Network timeout/i)).toBeInTheDocument();
  });
});
