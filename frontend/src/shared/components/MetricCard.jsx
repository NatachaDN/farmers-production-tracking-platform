import React from 'react';
import './Skeleton.css';

/**
 * Returns a font-size that fits the value comfortably inside the card.
 * - ≤ 6 chars  (numbers like "4", "12.8 t") → 2rem   (large metric)
 * - 7–14 chars (short text like "Maize")    → 1.125rem
 * - 15+ chars  (long text like "Maize (Plot A)") → 0.9375rem
 */
function valueFontSize(value) {
  const len = String(value).length;
  if (len <= 6) return '2rem';
  if (len <= 14) return '1.125rem';
  return '0.9375rem';
}

export function MetricCard({ label, value, subtext, icon, iconBg = "#EAF4ED", loading = false }) {
  if (loading || value === '…' || value === undefined || value === null) {
    return (
      <div style={{
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '140px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)'
          }}>
            {label}
          </span>
          <div className="acrea-skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
        </div>

        <div style={{ marginTop: '16px' }}>
          <div className="acrea-skeleton" style={{ width: '48%', height: '32px', borderRadius: '6px' }} />
          <div className="acrea-skeleton" style={{ width: '70%', height: '14px', borderRadius: '4px', marginTop: '10px' }} />
        </div>
      </div>
    );
  }

  const fontSize = valueFontSize(value);

  return (
    <div style={{
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '140px',
      boxShadow: 'var(--shadow-card)',
      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-text-secondary)'
        }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9999px',
            backgroundColor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {typeof icon === 'function' ? React.createElement(icon, { size: 20 }) : icon}
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <div style={{
          fontSize,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: fontSize === '2rem' ? '-0.025em' : '-0.01em',
          lineHeight: fontSize === '2rem' ? 1.1 : 1.25,
          wordBreak: 'break-word'
        }}>
          {value}
        </div>
        {subtext && (
          <div style={{
            marginTop: '8px',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            fontWeight: 400
          }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
