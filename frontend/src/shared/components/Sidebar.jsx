import React from 'react';
import {
  AcreaLogo, IconDashboard, IconFarms, IconCrop, IconLivestock, IconActivities,
  IconProduction, IconInputs, IconReports, IconSettings, IconUsers,
  IconPulse, IconServer, IconWarning, IconClipboard
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
    ['production', 'Harvest records', IconProduction],
  ]],
  ['Records & insights', [
    ['inputs', 'Input inventory', IconInputs],
    ['cycle-inputs', 'Input usage', IconClipboard],
    ['incidents', 'Incidents', IconWarning],
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

const MANAGER_NAV = [['Manager workspace', [
  ['manager-overview', 'Overview', IconDashboard],
  ['manager-farmers', 'Assigned farmers', IconUsers],
  ['manager-activity', 'Field activity', IconPulse],
  ['manager-reports', 'Production reports', IconReports],
]]];
const CROP_ROUTES = new Set(['crops', 'activities', 'production', 'inputs', 'cycle-inputs', 'incidents']);

export function Sidebar({ activeRoute = 'dashboard', onNavigate, role, hasLivestockFarms, hasCropFarms }) {
  const isAdmin = role === 'ROLE_ADMIN';
  const isManager = role === 'ROLE_MANAGER';
  const navigation = isAdmin ? ADMIN_NAV : isManager ? MANAGER_NAV : FARMER_NAV;
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
      <nav className="sidebar-navigation" aria-label={isAdmin ? 'Admin console' : isManager ? 'Manager workspace' : 'Farm workspace'}>
        <div className="sidebar-groups">
          {navigation.map(([label, items]) => {
            const visible = items.filter(([route]) => (route !== 'livestock' || hasLivestockFarms)
              && (!CROP_ROUTES.has(route) || hasCropFarms));
            return visible.length > 0 && (
            <div className="sidebar-group" key={label}>
              <p>{label}</p>
              <ul aria-label={label}>{visible.map(renderItem)}</ul>
            </div>
            );
          })}
        </div>
        <ul className="sidebar-utilities">
          {!isAdmin && !isManager && renderItem(['settings', 'Settings', IconSettings])}
        </ul>
      </nav>
    </aside>
  );
}
