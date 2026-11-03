import React, { useEffect, useState } from 'react';
import { googleAuth } from './services/googleAuth';

function GoogleMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * Divider + "Continue with Google" button. Reads the public client id from the backend,
 * so the browser needs no extra configuration.
 */
export function GoogleSignInSection({ onError, dividerLabel = 'or' }) {
  const [config, setConfig] = useState({ status: 'loading', clientId: null });
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;
    googleAuth.getConfig()
      .then((c) => active && setConfig({ status: c?.enabled ? 'ready' : 'unconfigured', clientId: c?.clientId }))
      .catch(() => active && setConfig({ status: 'unavailable', clientId: null }));
    return () => { active = false; };
  }, []);

  const handleClick = async () => {
    setStarting(true);
    try {
      await googleAuth.start(config.clientId);
    } catch {
      setStarting(false);
      onError?.('Could not start Google sign-in. Please try again.');
    }
  };

  const disabled = config.status !== 'ready' || starting;
  const note = {
    unconfigured: 'Google sign-in is not set up on this server yet.',
    unavailable: 'Google sign-in is unavailable while the server cannot be reached.',
  }[config.status];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '24px 0 18px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-card-border)' }} />
        <span>{dividerLabel}</span>
        <span style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-card-border)' }} />
      </div>

      <button
        id="google-signin-button"
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          padding: '11px 14px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border-input)',
          borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', fontWeight: 600, color: '#2D3934',
          boxShadow: 'var(--shadow-subtle)', cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: config.status === 'loading' ? 0.7 : (disabled ? 0.6 : 1),
          transition: 'background-color var(--transition-fast)',
        }}
        onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = '#F6F2EA'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
      >
        <GoogleMark />
        <span>{starting ? 'Opening Google...' : 'Continue with Google'}</span>
      </button>

      {note && (
        <p style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>{note}</p>
      )}
    </div>
  );
}
