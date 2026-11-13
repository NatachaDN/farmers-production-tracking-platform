import React from 'react';
import { cycleLabel } from '../hooks/useFarmerCycles';

const cycleStatuses = { ACTIVE: 'Ongoing', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
export const emptyFilters = { crop: '', status: '', from: '', to: '' };

export function ProductionHistory({ cycles, results, filters, onFiltersChange, selectedId, onSelect, loading, error, onRetry, disabled }) {
  const crops = [...new Set(cycles.map(cycle => cycle.cropName).filter(Boolean))].sort();
  const invalidRange = filters.from && filters.to && filters.from > filters.to;
  const changeFilter = ({ target }) => onFiltersChange({ ...filters, [target.name]: target.value });

  return (
    <section className="production-history-card" aria-labelledby="production-history-title">
      <h2 id="production-history-title">Production history</h2>
      <fieldset className="production-history-filters" disabled={disabled}>
        <legend>Filter cycles</legend>
        <label>
          Crop
          <select name="crop" value={filters.crop} onChange={changeFilter}>
            <option value="">All crops</option>
            {crops.map(crop => <option key={crop}>{crop}</option>)}
          </select>
        </label>
        <label>
          Status
          <select name="status" value={filters.status} onChange={changeFilter}>
            <option value="">All statuses</option>
            {Object.entries(cycleStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>Planted from<input type="date" name="from" value={filters.from} onChange={changeFilter} /></label>
        <label>Planted through<input type="date" name="to" value={filters.to} onChange={changeFilter} /></label>
        <button type="button" className="production-history-action" onClick={() => onFiltersChange(emptyFilters)} disabled={!Object.values(filters).some(Boolean)}>Clear filters</button>
      </fieldset>
      {invalidRange && <p role="alert">The last planting date must be on or after the first.</p>}
      {loading && <p role="status">Loading production cycles…</p>}
      {error && <p role="alert">{error} <button type="button" className="production-history-action" onClick={onRetry}>Try again</button></p>}
      {!loading && !error && !invalidRange && (
        results.length === 0
          ? <p>{cycles.length ? 'No cycles match these filters.' : 'Create a crop cycle to see production records here.'}</p>
          : <ul className="production-cycle-list">
              {results.map(cycle => (
                <li key={cycle.id}>
                  <button type="button" aria-pressed={selectedId === cycle.id} disabled={disabled} onClick={() => onSelect(cycle.id)}>
                    <strong>{cycleLabel(cycle)}</strong>
                    <span>{cycle.plantingDate ? `Planted ${cycle.plantingDate}` : 'Planting date unavailable'} · {cycleStatuses[cycle.status] ?? cycle.status}</span>
                  </button>
                </li>
              ))}
            </ul>
      )}
    </section>
  );
}
