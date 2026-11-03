import React from 'react';

const GREEN = '#3E7B52';
const TRACK = '#ECE7DC';

/** Vertical bars. items: [{ key, label, value, title }]. Labels are shown for the first, middle and last bar. */
export function Bars({ items, height = 150, color = GREEN, ariaLabel, labelEvery }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const step = labelEvery || Math.max(1, Math.ceil(items.length / 6));
  const w = 100 / items.length;
  return (
    <svg viewBox={`0 0 100 ${height / 4}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}
      style={{ width: '100%', height, display: 'block' }}>
      <line x1="0" x2="100" y1={height / 4 - 0.5} y2={height / 4 - 0.5} stroke={TRACK} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
      {items.map((it, idx) => {
        const h = (it.value / max) * (height / 4 - 3);
        return (
          <rect key={it.key ?? idx} x={idx * w + w * 0.18} width={w * 0.64} y={height / 4 - 0.5 - h} height={Math.max(h, it.value > 0 ? 0.6 : 0)}
            rx="0.6" fill={it.value > 0 ? color : TRACK} opacity={it.value > 0 ? 1 : 0.55}>
            <title>{it.title ?? `${it.label}: ${it.value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export function BarAxis({ items, every }) {
  const step = every || Math.max(1, Math.ceil(items.length / 6));
  return (
    <div style={{ display: 'flex', marginTop: 8 }}>
      {items.map((it, idx) => (
        <span key={it.key ?? idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'visible' }}>
          {idx % step === 0 || idx === items.length - 1 ? it.label : ''}
        </span>
      ))}
    </div>
  );
}

/** Horizontal breakdown. items: [{ label, value, display }] */
export function BreakdownBars({ items, color = GREEN, empty = 'No data yet.' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length || items.every((i) => i.value === 0)) {
    return <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{empty}</p>;
  }
  return (
    <div>
      {items.map((it) => (
        <div key={it.label} className="adm-bars-row">
          <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.label}>{it.label}</span>
          <div className="adm-bars-track" aria-hidden="true">
            <div className="adm-bars-fill" style={{ width: `${(it.value / max) * 100}%`, background: it.color || color }} />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{it.display ?? it.value}</span>
        </div>
      ))}
    </div>
  );
}

/** One segmented bar with legend. items: [{ label, value, color }] */
export function StackedBar({ items }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div>
      <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: TRACK }} role="img"
        aria-label={items.map((i) => `${i.label} ${i.value}`).join(', ')}>
        {total > 0 && items.filter((i) => i.value > 0).map((i) => (
          <div key={i.label} style={{ width: `${(i.value / total) * 100}%`, background: i.color }} title={`${i.label}: ${i.value}`} />
        ))}
      </div>
      <div className="adm-legend">
        {items.map((i) => (
          <span key={i.label}><span className="adm-dot" style={{ background: i.color }} />{i.label} <b style={{ color: 'var(--color-text-primary)' }}>{i.value}</b></span>
        ))}
      </div>
    </div>
  );
}

export const CHART_COLORS = { green: GREEN, forest: '#164230', amber: '#D97706', teal: '#0D9488', slate: '#94A3B8', sand: '#C4BCAF' };
