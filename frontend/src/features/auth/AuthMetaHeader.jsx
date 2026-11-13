import React from 'react';
import { AcreaLogo } from '../../shared/components/Icons';

export function AuthMetaHeader({ subtitle = 'Secure farmer access' }) {
  return (
    <div className="auth-meta">
      <div className="auth-mobile-brand"><AcreaLogo size={30} showTagline={false} textColor="var(--color-sidebar-bg)" /></div>
      <p>{subtitle}</p>
    </div>
  );
}
