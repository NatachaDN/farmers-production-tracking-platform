import React from 'react';
import { cycleLabel } from '../hooks/useFarmerCycles';

/**
 * Pill selector listing the farmer's real production cycles, with loading,
 * error and empty states.
 */
export function CycleSelector({ cycles, selectedCycleId, onSelect, isLoading, error, onRetry, emptyMessage }) {
  const mutedText = { fontSize: '0.875rem', color: 'var(--color-text-muted)' };

  if (isLoading) {
    return <span style={mutedText}>Loading your production cycles…</span>;
  }

  if (error) {
    return (
      <span style={{ ...mutedText, color: 'var(--color-accent-red)' }}>
        {error}{' '}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
          >
            Retry
          </button>
        )}
      </span>
    );
  }

  if (cycles.length === 0) {
    return <span style={mutedText}>{emptyMessage || 'No production cycle yet. Create one from Crop Production first.'}</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginRight: '4px' }}>
        SELECT CYCLE:
      </span>
      {cycles.map((c) => {
        const isSelected = selectedCycleId === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            title={c.status === 'ACTIVE' ? 'Active cycle' : `Status: ${c.status}`}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8125rem',
              fontWeight: isSelected ? 700 : 500,
              backgroundColor: isSelected ? 'var(--color-brand-primary)' : '#FFFFFF',
              color: isSelected ? '#FFFFFF' : 'var(--color-text-primary)',
              border: isSelected ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-card-border)',
              boxShadow: isSelected ? '0 2px 8px rgba(62, 123, 82, 0.25)' : 'var(--shadow-subtle)',
              cursor: 'pointer',
              opacity: c.status === 'ACTIVE' || isSelected ? 1 : 0.75,
              transition: 'all var(--transition-fast)'
            }}
          >
            {cycleLabel(c)}
            {c.status !== 'ACTIVE' && <span style={{ marginLeft: '6px', fontSize: '0.6875rem' }}>({c.status.toLowerCase()})</span>}
          </button>
        );
      })}
    </div>
  );
}
