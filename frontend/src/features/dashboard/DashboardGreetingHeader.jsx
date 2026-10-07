import React from 'react';
import { IconPlus } from '../../shared/components/Icons';

export function DashboardGreetingHeader({ user, onRecordProduction }) {
  // Display fullName, or username/email prefix, or fallback to 'Farmer'
  const displayName = user?.fullName
    ? user.fullName
    : (user?.emailOrPhone ? user.emailOrPhone.split('@')[0] : 'Farmer');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em'
        }}>
          Good morning, {displayName}
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          marginTop: '2px'
        }}>
          Here's an overview of your farm today.
        </p>
      </div>

      <button
        onClick={onRecordProduction}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--color-brand-primary)',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-subtle)',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)')}
      >
        <IconPlus size={16} />
        <span>Record production</span>
      </button>
    </div>
  );
}
