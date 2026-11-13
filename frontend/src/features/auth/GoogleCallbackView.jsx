import React from 'react';
import { AcreaLogo } from '../../shared/components/Icons';

/** Shown for the moment between Google redirecting back and the platform session being ready. */
export function GoogleCallbackView() {
  return (
    <main className="auth-callback">
      <section className="auth-panel" aria-labelledby="google-sign-in-title">
        <AcreaLogo size={34} showTagline={false} textColor="var(--color-sidebar-bg)" />
        <div className="spinner" aria-hidden="true" />
        <h1 id="google-sign-in-title">Signing in with Google…</h1>
      </section>
    </main>
  );
}
