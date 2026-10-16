import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardView } from '../components/DashboardView';
import { DashboardSummary } from '../types';

const mockSummary: DashboardSummary = {
  totalAssets: 6,
  openVulnerabilities: 5,
  criticalVulnerabilities: 2,
  fixedVulnerabilities: 9,
  severityCounts: {
    CRITICAL: 2,
    HIGH: 4,
    MEDIUM: 5,
    LOW: 3
  },
  recentFindings: []
};

describe('DashboardView charts row', () => {
  it('renders the severity donut chart with the total findings count', () => {
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        error={null}
        onRefresh={() => {}}
        onNavigateToVulnerabilities={() => {}}
      />
    );

    expect(screen.getByTestId('severity-donut')).toBeInTheDocument();
    expect(screen.getByText('FINDINGS')).toBeInTheDocument();
  });

  it('renders all three remediation lifecycle stages', () => {
    render(
      <DashboardView
        summary={mockSummary}
        loading={false}
        error={null}
        onRefresh={() => {}}
        onNavigateToVulnerabilities={() => {}}
      />
    );

    // total findings = 2 + 4 + 5 + 3 = 14
    // IN_PROGRESS is derived: 14 - 5 open - 9 fixed = 0
    expect(screen.getByTestId('lifecycle-OPEN')).toHaveTextContent('5');
    expect(screen.getByTestId('lifecycle-IN_PROGRESS')).toHaveTextContent('0');
    expect(screen.getByTestId('lifecycle-FIXED')).toHaveTextContent('9');
    expect(screen.getAllByText(/remediated/i).length).toBeGreaterThan(0);
  });

  it('derives a positive IN_PROGRESS count when findings are neither open nor fixed', () => {
    const summary: DashboardSummary = {
      ...mockSummary,
      openVulnerabilities: 4,
      fixedVulnerabilities: 2
      // 14 total - 4 open - 2 fixed = 8 in progress
    };

    render(
      <DashboardView
        summary={summary}
        loading={false}
        error={null}
        onRefresh={() => {}}
        onNavigateToVulnerabilities={() => {}}
      />
    );

    expect(screen.getByTestId('lifecycle-IN_PROGRESS')).toHaveTextContent('8');
  });
});
