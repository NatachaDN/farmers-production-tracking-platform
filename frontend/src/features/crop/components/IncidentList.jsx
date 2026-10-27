import React, { useState } from 'react';
import './IncidentList.css';

const TYPE_CONFIG = {
  DISEASE: {
    label: 'Disease',
    emoji: '🦠',
    dotBg: '#EDE9FE',
    badgeStyle: { background: '#EDE9FE', color: '#5B21B6' },
  },
  PEST: {
    label: 'Pest',
    emoji: '🐛',
    dotBg: '#FEE2E2',
    badgeStyle: { background: '#FEE2E2', color: '#991B1B' },
  },
  DAMAGE: {
    label: 'Damage',
    emoji: '⚡',
    dotBg: '#FEF3C7',
    badgeStyle: { background: '#FEF3C7', color: '#92400E' },
  },
  WEATHER: {
    label: 'Weather',
    emoji: '🌧️',
    dotBg: '#DBEAFE',
    badgeStyle: { background: '#DBEAFE', color: '#1E40AF' },
  },
  OTHER: {
    label: 'Other',
    emoji: '📋',
    dotBg: '#F0FDF4',
    badgeStyle: { background: '#F0FDF4', color: '#166534' },
  },
};

const SEVERITY_LABELS = ['', 'Low', 'Minor', 'Moderate', 'Serious', 'Critical'];

function getSeverityClass(level) {
  if (!level) return '';
  if (level <= 2) return 'severity-low';
  if (level === 3) return 'severity-medium';
  return 'severity-high';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const FILTER_OPTIONS = [
  { value: 'ALL',     label: 'All' },
  { value: 'DISEASE', label: '🦠 Disease' },
  { value: 'PEST',    label: '🐛 Pest' },
  { value: 'DAMAGE',  label: '⚡ Damage' },
  { value: 'WEATHER', label: '🌧️ Weather' },
  { value: 'OTHER',   label: '📋 Other' },
];

export function IncidentList({ incidents = [], isLoading, onEdit, onDelete }) {
  const [filterType, setFilterType] = useState('ALL');

  const filtered = incidents.filter(
    (i) => filterType === 'ALL' || i.incidentType === filterType
  );

  if (isLoading) {
    return (
      <div className="loading-state">
        <span>Loading incidents…</span>
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="incident-filter-bar">
        <span className="filter-label">Filter:</span>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-pill ${filterType === opt.value ? 'active' : ''}`}
            onClick={() => setFilterType(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="list-section-header">
        <h3 className="list-title">Incident History</h3>
        <span className="list-count-badge">
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌿</div>
          <h4>No incidents recorded yet</h4>
          <p>
            {filterType !== 'ALL'
              ? `No ${TYPE_CONFIG[filterType]?.label.toLowerCase() || filterType} incidents found.`
              : 'Record the first incident for this cycle using the button above.'}
          </p>
        </div>
      ) : (
        <div className="incident-timeline">
          {filtered.map((incident) => {
            const cfg = TYPE_CONFIG[incident.incidentType] || TYPE_CONFIG.OTHER;
            return (
              <div className="incident-card" key={incident.id}>
                {/* Timeline dot */}
                <div
                  className="incident-dot"
                  style={{ backgroundColor: cfg.dotBg }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{cfg.emoji}</span>
                </div>

                {/* Card body */}
                <div className="incident-body">
                  {/* Header row */}
                  <div className="incident-header-row">
                    <div className="incident-meta">
                      <span className="incident-type-badge" style={cfg.badgeStyle}>
                        {cfg.emoji} {cfg.label}
                      </span>
                      <span className="incident-date">
                        📅 {formatDate(incident.incidentDate)}
                      </span>
                      {incident.severityLevel && (
                        <span className={`severity-badge ${getSeverityClass(incident.severityLevel)}`}>
                          ⚠ Severity {incident.severityLevel} — {SEVERITY_LABELS[incident.severityLevel]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="incident-description">{incident.description}</p>

                  {/* Action taken */}
                  {incident.actionTaken && (
                    <div className="incident-action">
                      <span className="incident-action-label">✅ Action:</span>
                      <span className="incident-action-text">{incident.actionTaken}</span>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="incident-footer">
                    {onEdit && (
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => onEdit(incident)}
                        title="Edit this incident"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => onDelete(incident.id)}
                        title="Delete this incident"
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
