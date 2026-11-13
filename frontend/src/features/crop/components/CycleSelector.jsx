import React from 'react';
import { cycleLabel } from '../hooks/useFarmerCycles';

/**
 * Pill selector listing the farmer's real production cycles, with loading,
 * error and empty states.
 */
export function CycleSelector({ cycles, selectedCycleId, onSelect, isLoading, error, onRetry, emptyMessage, disabled = false }) {
  const mutedText = { fontSize: '0.875rem', color: 'var(--color-text-muted)' };

  if (isLoading) {
    return <span role="status" style={mutedText}>Loading crop cycles…</span>;
  }

  if (error) {
    return (
      <span role="alert" style={{ ...mutedText, color: 'var(--color-accent-red)' }}>
        {error}{' '}
        {onRetry && (
          <button
            type="button"
            disabled={disabled}
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
    return <span style={mutedText}>{emptyMessage || 'Create a crop cycle to start recording.'}</span>;
  }

  return (
    <label className="workspace-filter workspace-cycle-filter">
      Crop cycle
      <select value={selectedCycleId ?? ''} disabled={disabled} onChange={event => {
        const cycle = cycles.find(item => String(item.id) === event.target.value);
        if (cycle) onSelect(cycle.id);
      }}>
        <option value="" disabled>Select a crop cycle</option>
        {cycles.map(cycle => <option key={cycle.id} value={cycle.id}>
          {cycleLabel(cycle)}{cycle.status ? ` · ${cycle.status.toLowerCase()}` : ''}
        </option>)}
      </select>
    </label>
  );
}
