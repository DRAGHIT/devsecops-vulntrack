import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../components/Navbar';

describe('Navbar Component', () => {
  it('renders branding and navigation tabs', () => {
    render(
      <Navbar
        currentTab="dashboard"
        onTabChange={vi.fn()}
        currentRole="ADMIN"
        onRoleToggle={vi.fn()}
      />
    );

    expect(screen.getByText('VulnTrack')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
    expect(screen.getByText('ADMIN (Read/Write)')).toBeInTheDocument();
  });

  it('triggers onTabChange when tab button is clicked', () => {
    const handleTabChange = vi.fn();
    render(
      <Navbar
        currentTab="dashboard"
        onTabChange={handleTabChange}
        currentRole="ADMIN"
        onRoleToggle={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Assets'));
    expect(handleTabChange).toHaveBeenCalledWith('assets');
  });

  it('triggers onRoleToggle when role switch button is clicked', () => {
    const handleRoleToggle = vi.fn();
    render(
      <Navbar
        currentTab="dashboard"
        onTabChange={vi.fn()}
        currentRole="VIEWER"
        onRoleToggle={handleRoleToggle}
      />
    );

    expect(screen.getByText('VIEWER (Read-Only)')).toBeInTheDocument();
    fireEvent.click(screen.getByText('VIEWER (Read-Only)'));
    expect(handleRoleToggle).toHaveBeenCalledTimes(1);
  });
});
