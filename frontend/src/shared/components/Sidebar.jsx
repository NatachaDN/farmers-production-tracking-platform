import React from 'react';
import {
  AcreaLogo,
  IconDashboard,
  IconFarms,
  IconCrop,
  IconLivestock,
  IconActivities,
  IconProduction,
  IconInputs,
  IconReports,
  IconSettings,
  IconHelp
} from './Icons';
import './Sidebar.css';

export function Sidebar({ activeRoute = 'dashboard', onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'farms', label: 'Farms & Plots', icon: IconFarms },
    { id: 'crops', label: 'Crop Production', icon: IconCrop },
    { id: 'livestock', label: 'Livestock', icon: IconLivestock },
    { id: 'activities', label: 'Activities', icon: IconActivities },
    { id: 'production', label: 'Production', icon: IconProduction },
    { id: 'inputs', label: 'Farm Inputs', icon: IconInputs },
    { id: 'reports', label: 'Reports', icon: IconReports },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  return (
    <aside className="acrea-sidebar" style={{
      color: '#FFFFFF',
      padding: '24px 16px',
      justifyContent: 'space-between',
    }}>
      {/* Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div style={{ padding: '0 4px', marginBottom: '28px' }}>
          <AcreaLogo size={38} />
        </div>

        {/* Navigation List */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'var(--color-sidebar-active-bg)' : 'transparent',
                  color: isActive ? 'var(--color-sidebar-active-text)' : 'var(--color-sidebar-text)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  width: '100%',
                  textAlign: 'left',
                  transition: 'background-color var(--transition-fast), color var(--transition-fast)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isActive ? 'var(--color-sidebar-active-text)' : 'currentColor'} />
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <span style={{
                    width: '3.5px',
                    height: '18px',
                    borderRadius: '2px',
                    backgroundColor: 'var(--color-sidebar-active-text)'
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Season Card & Footer */}
      <div>
        {/* Current Season Widget */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: '20px'
        }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '4px'
          }}>
            CURRENT SEASON
          </div>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#FFFFFF',
            marginBottom: '6px'
          }}>
            2026 Main Season
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.75)'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#E5A638'
            }} />
            <span>4 cycles in progress</span>
          </div>
        </div>

        {/* Help & Support */}
        <button
          onClick={() => onNavigate && onNavigate('help')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            color: 'var(--color-sidebar-text)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            width: '100%',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-sidebar-text)'}
        >
          <IconHelp size={17} />
          <span>Help & support</span>
        </button>
      </div>
    </aside>
  );
}
