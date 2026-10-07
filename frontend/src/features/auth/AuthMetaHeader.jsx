import React from 'react';
import { AcreaLogo, IconGlobe } from '../../shared/components/Icons';

export function AuthMetaHeader({ subtitle = 'Secure farmer access' }) {
  return (
    <>
      {/* Mobile-only brand header */}
      <div
        className="auth-mobile-brand"
        style={{
          display: 'none',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <AcreaLogo size={28} textColor="var(--color-brand-primary)" />
      </div>

      {/* Top Meta Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
          marginBottom: '8px'
        }}
      >
        <span>{subtitle}</span>
        <button
          type="button"
          aria-label="Select language"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8125rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <IconGlobe size={15} />
          <span>English</span>
        </button>
      </div>
    </>
  );
}
