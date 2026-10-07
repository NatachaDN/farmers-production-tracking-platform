import React from 'react';

export function MetricCard({ label, value, subtext, icon, iconBg = "#EAF4ED" }) {
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
            {icon}
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.025em',
          lineHeight: 1.1
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
