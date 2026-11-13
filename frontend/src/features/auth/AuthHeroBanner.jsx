import React from 'react';
import { AcreaLogo } from '../../shared/components/Icons';

export function AuthHeroBanner() {
  return (
    <aside className="auth-hero-banner" aria-label="About Acrea">
      <AcreaLogo size={40} showTagline={false} />
      <div className="auth-hero-copy">
        <h2>From planting<br />to harvest.</h2>
        <p>Keep crop cycles, field activities and production records together.</p>
      </div>
    </aside>
  );
}
