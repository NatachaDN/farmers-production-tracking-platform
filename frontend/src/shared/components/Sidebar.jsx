import React, { useState, useEffect } from 'react';
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
  IconHelp,
  IconUsers,
  IconPulse,
  IconServer
} from './Icons';
import { cropCycleService } from '../../features/crops/services/cropCycleService';
import './Sidebar.css';
import './Skeleton.css';

const ADMIN_NAV = [
  { id: 'admin-overview', label: 'Overview', icon: IconDashboard },
  { id: 'admin-users', label: 'Users & Managers', icon: IconUsers },
  { id: 'admin-notifications', label: 'Notify Users', icon: IconHelp },
  { id: 'admin-farms', label: 'Farms & Plots', icon: IconFarms },
  { id: 'admin-livestock', label: 'Animal Groups', icon: IconLivestock },
  { id: 'admin-activity', label: 'Activities', icon: IconPulse },
  { id: 'admin-production', label: 'Production', icon: IconProduction },
  { id: 'admin-incidents', label: 'Incidents', icon: IconActivities },
  { id: 'admin-analytics', label: 'Analytics', icon: IconReports },
  { id: 'admin-system', label: 'System health', icon: IconServer },
];

const MANAGER_NAV = [
  { id: 'manager-dashboard', label: 'Overview', icon: IconDashboard },
  { id: 'manager-farmers', label: 'Supervised Farmers', icon: IconUsers },
  { id: 'manager-farms', label: 'Farms & Plots', icon: IconFarms },
  { id: 'manager-livestock', label: 'Animal Groups', icon: IconLivestock },
  { id: 'manager-productions', label: 'Farmer Productions', icon: IconProduction },
  { id: 'manager-incidents', label: 'Incidents', icon: IconActivities },
  { id: 'manager-reports', label: 'Consolidated Reports', icon: IconReports },
];

export function Sidebar({ activeRoute = 'dashboard', onNavigate, isAdmin = false, isManager = false, user = null, mobileOpen = false, onCloseMobile }) {
  const adminMode = isAdmin;
  const managerMode = isManager && !isAdmin;

  const [activeCyclesCount, setActiveCyclesCount] = useState(null);
  const [loadingCycles, setLoadingCycles] = useState(true);

  useEffect(() => {
    if (!user?.id || adminMode || managerMode) {
      setLoadingCycles(false);
      return;
    }
    let isMounted = true;
    cropCycleService.getCycles(user.id)
      .then((cycles) => {
        if (!isMounted) return;
        const list = Array.isArray(cycles) ? cycles : [];
        const inProgress = list.filter(c => (c.status || '').toUpperCase() === 'ACTIVE').length;
        setActiveCyclesCount(inProgress);
      })
      .catch(() => {
        if (isMounted) setActiveCyclesCount(0);
      })
      .finally(() => {
        if (isMounted) setLoadingCycles(false);
      });
    return () => { isMounted = false; };
  }, [user?.id, adminMode, managerMode]);

  const farmerNav = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'farms', label: 'Farms & Plots', icon: IconFarms },
    { id: 'crops', label: 'Crop Production', icon: IconCrop },
    { id: 'livestock', label: 'Livestock', icon: IconLivestock },
    { id: 'activities', label: 'Activities', icon: IconActivities },
    { id: 'production', label: 'Harvest', icon: IconProduction },
    { id: 'inputs', label: 'Farm Inputs', icon: IconInputs },
    { id: 'cycle-inputs', label: 'Cycle Inputs', icon: IconInputs },
    { id: 'incidents', label: 'Incidents', icon: IconActivities },
    { id: 'reports', label: 'Reports', icon: IconReports },
    { id: 'settings', label: 'Settings', icon: IconSettings },
  ];

  let navItems = farmerNav;
  if (adminMode) navItems = ADMIN_NAV;
  else if (managerMode) navItems = MANAGER_NAV;

  return (
    <aside className={`acrea-sidebar${mobileOpen ? ' open' : ''}`} style={{
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      overflow: 'hidden',
    }}>
      {/* Brand Header — fixed at top */}
      <div style={{ padding: '24px 20px 16px', flexShrink: 0 }}>
        <AcreaLogo size={38} />
      </div>

      {/* Navigation List — scrollable middle section */}
      <div className="sidebar-scroll-nav" style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '8px 16px 48px',
        WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black calc(100% - 48px), transparent 100%)',
      }}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeRoute === item.id ||
              (item.id === 'farms' &&
                ['create-farm', 'farm-details', 'create-plot', 'plot-details'].includes(activeRoute));

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (onNavigate) onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
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
                  position: 'relative',
                  flexShrink: 0,
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

      {/* Footer (Admin / Manager console label only — no cross-dashboard switching) */}
      {(adminMode || managerMode) && (
      <div style={{ padding: '12px 16px 20px' }}>
        {adminMode ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              Admin console
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45 }}>
              Read-only view of every farmer on the platform.
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
              Manager Supervision
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45 }}>
              Cooperative network overview, member approvals, and consolidated reports.
            </div>
          </div>
        )}
      </div>
      )}
    </aside>
  );
}
