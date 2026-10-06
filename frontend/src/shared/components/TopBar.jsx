import React from 'react';
import { IconSearch, IconBell, IconChevronDown } from './Icons';

export function TopBar({
  title = "Dashboard",
  subtitle = "Tuesday, 2 October · Green Acres Farm",
  userName = "Joyce M.",
  userInitials = "JM",
  farmName = "Green Acres Farm",
  onSearch,
  onNotificationClick,
  onProfileClick
}) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 36px 16px 36px',
      backgroundColor: 'transparent'
    }}>
      {/* Title & Date Metadata */}
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            marginTop: '4px'
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls: Search, Notification, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Global Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-pill)',
          padding: '8px 16px',
          width: '240px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <IconSearch size={16} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search Acrea"
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.8125rem',
              color: 'var(--color-text-primary)',
              width: '100%',
              backgroundColor: 'transparent'
            }}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <kbd style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            backgroundColor: '#F4EFE6',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'inherit'
          }}>
            ⌘ K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            position: 'relative',
            boxShadow: 'var(--shadow-subtle)',
            transition: 'background-color var(--transition-fast)'
          }}
          aria-label="Notifications"
        >
          <IconBell size={18} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '9px',
            width: '7px',
            height: '7px',
            backgroundColor: '#EF4444',
            borderRadius: '50%',
            border: '1.5px solid #FFFFFF'
          }} />
        </button>

        {/* User Profile Pill */}
        <div
          onClick={onProfileClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px 4px 4px',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)'
          }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#E2EAE5',
            color: 'var(--color-sidebar-bg)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {userInitials}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {userName}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              {farmName}
            </span>
          </div>

          <IconChevronDown size={14} color="var(--color-text-muted)" />
        </div>
      </div>
    </header>
  );
}
