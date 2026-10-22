import React from 'react';
import './HarvestResult.css';

const UNIT_LABELS = { KG: 'kg', BAGS: 'bags', TONS: 'tons' };

/**
 * Displays the harvest record for a completed cycle.
 * Shows quantity, unit, harvest date, calculated yield, and notes.
 */
export function HarvestResult({ harvest }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const unitLabel = UNIT_LABELS[harvest.unit] || harvest.unit?.toLowerCase();

  return (
    <div className="harvest-result fade-in">
      {/* Completed badge */}
      <div className="result-header">
        <div className="completed-badge">
          <span className="completed-icon">✅</span>
          <span>Cycle Completed</span>
        </div>
        <h3 className="result-title">Harvest Record — {harvest.cycleName}</h3>
        <p className="result-subtitle">
          This cycle has been completed. Below is the final yield summary.
        </p>
      </div>

      {/* Yield highlight */}
      <div className="yield-highlight">
        <div className="yield-number">
          {harvest.quantity?.toLocaleString()} <span className="yield-unit">{unitLabel}</span>
        </div>
        <div className="yield-label">Total Harvested</div>
        <div className="yield-display-pill">{harvest.yieldDisplay}</div>
      </div>

      {/* Detail grid */}
      <div className="result-detail-grid">
        <div className="detail-card">
          <span className="detail-card-icon">📅</span>
          <div>
            <div className="detail-card-label">Harvest Date</div>
            <div className="detail-card-value">{formatDate(harvest.harvestDate)}</div>
          </div>
        </div>

        <div className="detail-card">
          <span className="detail-card-icon">⚖️</span>
          <div>
            <div className="detail-card-label">Unit of Measure</div>
            <div className="detail-card-value">{harvest.unit}</div>
          </div>
        </div>

        {harvest.acreage && (
          <div className="detail-card">
            <span className="detail-card-icon">🗺️</span>
            <div>
              <div className="detail-card-label">Acreage</div>
              <div className="detail-card-value">{harvest.acreage} ha</div>
            </div>
          </div>
        )}

        <div className="detail-card">
          <span className="detail-card-icon">📈</span>
          <div>
            <div className="detail-card-label">Calculated Yield</div>
            <div className="detail-card-value">{harvest.yieldDisplay}</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {harvest.notes && (
        <div className="result-notes">
          <div className="result-notes-label">📝 Harvest Notes</div>
          <div className="result-notes-text">{harvest.notes}</div>
        </div>
      )}

      {/* Recorded at */}
      <div className="result-audit">
        Recorded on{' '}
        {harvest.createdAt
          ? new Date(harvest.createdAt).toLocaleString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          : '—'}
      </div>
    </div>
  );
}
