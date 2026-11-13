import React from 'react';
import {
  AcreaLogo, IconDashboard, IconFarms, IconCrop, IconLivestock, IconActivities,
  IconProduction, IconInputs, IconReports, IconSettings, IconUsers,
  IconPulse, IconServer, IconWarning, IconClipboard, IconArrowRight, IconPackage, IconCalendar, IconScale
} from './Icons';
import './Sidebar.css';

const FARMER_NAV = [
  ['Overview', [
    ['dashboard', 'Dashboard', IconDashboard],
    ['farms', 'Farms & plots', IconFarms],
  ]],
  ['Farm operations', [
    ['crops', 'Crop cycles', IconCrop],
    ['livestock', 'Livestock', IconLivestock],
    ['activities', 'Activities', IconActivities],
    ['calendar', 'Activity calendar', IconCalendar],
    ['production', 'Harvest records', IconProduction],
  ]],
  ['Records & insights', [
    ['inputs', 'Input inventory', IconInputs],
    ['equipment', 'Equipment', IconPackage],
    ['cycle-inputs', 'Input usage', IconClipboard],
    ['incidents', 'Incidents', IconWarning],
    ['finances', 'Finances', IconScale],
    ['reports', 'Reports', IconReports],
  ]],
];

const ADMIN_NAV = [['Administration', [
  ['admin-overview', 'Overview', IconDashboard],
  ['admin-farmers', 'Farmers', IconUsers],
  ['admin-activity', 'Activity', IconPulse],
  ['admin-production', 'Production', IconProduction],
  ['admin-crops', 'Reference crops', IconCrop],
  ['admin-system', 'System health', IconServer],
]]];

export function Sidebar({ activeRoute = 'dashboard', onNavigate, role }) {
  const isAdmin = role === 'ROLE_ADMIN';
  const canUseConsole = isAdmin || role === 'ROLE_MANAGER';
  const adminMode = canUseConsole && activeRoute.startsWith('admin-');
  const currentItem = ['farms-create', 'farm-details'].includes(activeRoute) ? 'farms' : activeRoute;

  const renderItem = ([route, label, Icon]) => (
    <li key={route}>
      <button type="button" className="sidebar-link"
        aria-current={currentItem === route ? (activeRoute === route ? 'page' : 'true') : undefined}
        onClick={() => onNavigate?.(route)}>
        <span aria-hidden="true"><Icon size={18} /></span>
        {label}
      </button>
    </li>
  );

  return (
    <aside className="acrea-sidebar">
      <div className="sidebar-brand"><AcreaLogo size={36} showTagline={false} /></div>
      <nav className="sidebar-navigation" aria-label={adminMode ? 'Admin console' : 'Farm workspace'}>
        <div className="sidebar-groups">
          {(adminMode ? ADMIN_NAV : FARMER_NAV).map(([label, items]) => (
            <div className="sidebar-group" key={label}>
              <p>{label}</p>
              <ul aria-label={label}>{items.filter(([route]) => isAdmin || !['admin-system', 'admin-crops'].includes(route)).map(renderItem)}</ul>
            </div>
          ))}
        </div>
        <ul className="sidebar-utilities">
          {!adminMode && renderItem(['settings', 'Settings', IconSettings])}
          {canUseConsole && renderItem([adminMode ? 'dashboard' : 'admin-overview',
            adminMode ? 'Farmer workspace' : 'Management console', IconArrowRight])}
        </ul>
      </nav>
    </aside>
  );
}
