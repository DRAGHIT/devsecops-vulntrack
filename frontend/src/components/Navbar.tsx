import React from 'react';
import { Shield, LayoutDashboard, Server, AlertTriangle, UserCheck, Eye } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'assets' | 'vulnerabilities';
  onTabChange: (tab: 'dashboard' | 'assets' | 'vulnerabilities') => void;
  currentRole: UserRole;
  onRoleToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentRole,
  onRoleToggle
}) => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Shield className="brand-icon" size={26} />
        <span>VulnTrack</span>
        <span className="brand-badge">SecOps v1.0</span>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-tab-btn ${currentTab === 'assets' ? 'active' : ''}`}
          onClick={() => onTabChange('assets')}
        >
          <Server size={18} />
          <span>Assets</span>
        </button>

        <button
          className={`nav-tab-btn ${currentTab === 'vulnerabilities' ? 'active' : ''}`}
          onClick={() => onTabChange('vulnerabilities')}
        >
          <AlertTriangle size={18} />
          <span>Vulnerabilities</span>
        </button>
      </div>

      <div className="nav-controls">
        <div className="role-badge-container">
          <span className="role-label">RBAC Persona:</span>
          <button
            className={`role-toggle-btn ${currentRole === 'ADMIN' ? 'admin' : ''}`}
            onClick={onRoleToggle}
            title="Click to switch between ADMIN (Read/Write) and VIEWER (Read-Only) roles"
          >
            {currentRole === 'ADMIN' ? (
              <>
                <UserCheck size={14} />
                <span>ADMIN (Read/Write)</span>
              </>
            ) : (
              <>
                <Eye size={14} />
                <span>VIEWER (Read-Only)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
