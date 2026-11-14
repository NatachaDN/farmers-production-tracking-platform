import React from 'react';
import {
  IconDashboard,
  IconCrop,
  IconActivities,
  IconProduction,
  IconDots
} from './Icons';

const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home', icon: IconDashboard },
  { id: 'crops', label: 'Crops', icon: IconCrop },
  { id: 'activities', label: 'Activities', icon: IconActivities },
  { id: 'production', label: 'Harvest', icon: IconProduction }
];

export function MobileBottomNav({ activeRoute, onNavigate, onOpenMore, isAdmin, isManager }) {
  // Admin and Manager consoles use their own specialized navigation
  if (isAdmin || isManager) return null;

  return (
    <nav className="acrea-mobile-bottom-nav" aria-label="Quick mobile navigation">
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeRoute === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`acrea-mobile-bottom-btn${active ? ' active' : ''}`}
            onClick={() => onNavigate && onNavigate(tab.id)}
          >
            <Icon size={20} color={active ? '#164230' : '#788680'} />
            <span>{tab.label}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="acrea-mobile-bottom-btn"
        onClick={onOpenMore}
        aria-label="Open full menu"
      >
        <IconDots size={20} color="#788680" />
        <span>More</span>
      </button>
    </nav>
  );
}

