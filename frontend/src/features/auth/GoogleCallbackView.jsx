import React from 'react';
import { AcreaLogo } from '../../shared/components/Icons';

/** Shown for the moment between Google redirecting back and the platform session being ready. */
export function GoogleCallbackView() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '20px', backgroundColor: '#FBF9F4',
    }}>
      <AcreaLogo size={34} textColor="var(--color-brand-primary)" />
      <div className="spinner" role="status" aria-label="Signing in" />
      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)' }}>Signing you in with Google...</p>
    </div>
  );
}
