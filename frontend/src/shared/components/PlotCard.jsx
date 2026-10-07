import React from 'react';
import { StatusBadge } from './StatusBadge';
import { IconDots, IconChevronRight } from './Icons';

export function PlotCard({
  icon,
  title,
  area,
  stage,
  progress = 0,
  updated = "Updated today",
  onViewDetails
}) {
  return (
    <div style={{
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-card)',
      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
    }}>
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-brand-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status={stage} />
            <button style={{ color: 'var(--color-text-muted)', padding: '4px' }}>
              <IconDots size={16} />
            </button>
          </div>
        </div>

        {/* Title & Area */}
        <h3 style={{
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '4px'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
          marginBottom: '20px'
        }}>
          {area}
        </p>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Cycle progress</span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{
            height: '6px',
            width: '100%',
            backgroundColor: '#ECE7DC',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--color-brand-primary)',
              borderRadius: '9999px',
              transition: 'width 400ms ease-out'
            }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '22px',
        paddingTop: '14px',
        borderTop: '1px solid #F4EFE6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#A4B0AA' }} />
          <span>{updated}</span>
        </div>

        <button
          onClick={onViewDetails}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          View details →
        </button>
      </div>
    </div>
  );
}
