import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IconRefresh } from '../../../shared/components/Icons';
import { initialsOf, label } from '../adminFormat';

/** Loads data for an admin view; optional polling; keeps old data on screen while refreshing. */
export function useAdminData(fetcher, deps = [], { pollMs = 0 } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await fetcherRef.current();
      setState({ data, error: null, loading: false });
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
    if (!pollMs) return undefined;
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, pollMs, ...deps]);

  return { ...state, reload: load };
}

export function Card({ title, subtitle, action, flush = false, children, style }) {
  return (
    <section className="adm-card" style={style}>
      {(title || action) && (
        <div className="adm-card-head">
          <div>
            {title && <h3 className="adm-card-title">{title}</h3>}
            {subtitle && <p className="adm-card-sub">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={`adm-card-body${flush ? ' flush' : ''}`}>{children}</div>
    </section>
  );
}

const TONES = {
  ACTIVE: 'green', 'on-track': 'green', COMPLETED: 'slate', CANCELLED: 'sand',
  overdue: 'red', idle: 'amber',
  ROLE_ADMIN: 'forest', ROLE_FARMER: 'sand', GOOGLE: 'teal', LOCAL: 'sand',
  LOGIN_FAILED: 'red', GOOGLE_LOGIN_FAILED: 'red', REGISTER: 'green', GOOGLE_REGISTER: 'green',
  LOGIN: 'slate', GOOGLE_LOGIN: 'teal',
  WATERING: 'teal', FERTILIZING: 'green', TREATMENT: 'amber', WEEDING: 'sand',
  SEEDS: 'green', FERTILIZER: 'teal', PESTICIDE: 'amber', OTHER: 'sand',
};
const PILL_TEXT = {
  ROLE_ADMIN: 'Administrator', ROLE_FARMER: 'Farmer', GOOGLE: 'Google', LOCAL: 'Password',
  'on-track': 'On track', overdue: 'Overdue', idle: 'No recent activity',
};

export function Pill({ value, tone, children }) {
  if (!value && !children) return null;
  const cls = tone || TONES[value] || 'sand';
  return <span className={`adm-pill ${cls}`}>{children ?? PILL_TEXT[value] ?? label(value)}</span>;
}

export function Progress({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="adm-progress">
      <div className="adm-progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="adm-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: '34px', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export function Avatar({ name, url }) {
  return (
    <span className="adm-avatar" aria-hidden="true">
      {url ? <img src={url} alt="" referrerPolicy="no-referrer" /> : initialsOf(name)}
    </span>
  );
}

export function EmptyState({ children }) {
  return <div className="adm-empty">{children}</div>;
}

export function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  const message = error.status === 403 || error.status === 401
    ? 'Your session does not have administrator access. Sign in again with an admin account.'
    : error.message || 'Something went wrong while loading this page.';
  return (
    <div className="adm-error" role="alert">
      <span>{message}</span>
      {onRetry && <button className="adm-btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function LoadingBlocks({ rows = 3 }) {
  return (
    <div className="adm-stack" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="adm-skeleton" style={{ height: i === 0 ? 120 : 220 }} />
      ))}
    </div>
  );
}

export function RefreshButton({ onClick, loading }) {
  return (
    <button className="adm-btn" onClick={onClick} disabled={loading} aria-label="Refresh data">
      <IconRefresh size={15} />
      <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
    </button>
  );
}

export function Tabs({ tabs, value, onChange, label: ariaLabel }) {
  return (
    <div className="adm-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" className="adm-tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
        </button>
      ))}
    </div>
  );
}

/** Wraps a view: shows skeleton on first load, error banner, then children(data). */
export function DataGate({ state, children }) {
  if (state.error && !state.data) return <ErrorBanner error={state.error} onRetry={state.reload} />;
  if (!state.data) return <LoadingBlocks />;
  return (
    <>
      {state.error && <ErrorBanner error={state.error} onRetry={state.reload} />}
      {children(state.data)}
    </>
  );
}
