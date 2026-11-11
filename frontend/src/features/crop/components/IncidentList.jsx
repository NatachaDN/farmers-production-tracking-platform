import React, { useState } from 'react';
import './IncidentList.css';
import {
  IconShieldAlert,
  IconBug,
  IconZap,
  IconCloudRain,
  IconClipboard,
  IconLeaf,
  IconCalendar,
  IconAlertTriangle,
  IconCheck,
  IconPencil,
  IconTrash,
} from '../../../shared/components/Icons';

const TYPE_CONFIG = {
  DISEASE: {
    label: 'Disease',
    Icon: IconShieldAlert,
    iconColor: '#7C3AED',
    dotBg: '#EDE9FE',
    badgeStyle: { background: '#EDE9FE', color: '#5B21B6' },
  },
  PEST: {
    label: 'Pest',
    Icon: IconBug,
    iconColor: '#DC2626',
    dotBg: '#FEE2E2',
    badgeStyle: { background: '#FEE2E2', color: '#991B1B' },
  },
  DAMAGE: {
    label: 'Damage',
    Icon: IconZap,
    iconColor: '#D97706',
    dotBg: '#FEF3C7',
    badgeStyle: { background: '#FEF3C7', color: '#92400E' },
  },
  WEATHER: {
    label: 'Weather',
    Icon: IconCloudRain,
    iconColor: '#2563EB',
    dotBg: '#DBEAFE',
    badgeStyle: { background: '#DBEAFE', color: '#1E40AF' },
  },
  OTHER: {
    label: 'Other',
    Icon: IconClipboard,
    iconColor: '#166534',
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
  { value: 'ALL',     label: 'All',     Icon: null },
  { value: 'DISEASE', label: 'Disease', Icon: IconShieldAlert },
  { value: 'PEST',    label: 'Pest',    Icon: IconBug },
  { value: 'DAMAGE',  label: 'Damage',  Icon: IconZap },
  { value: 'WEATHER', label: 'Weather', Icon: IconCloudRain },
  { value: 'OTHER',   label: 'Other',   Icon: IconClipboard },
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
        {FILTER_OPTIONS.map((opt) => {
          const OptIcon = opt.Icon;
          return (
            <button
              key={opt.value}
              className={`filter-pill ${filterType === opt.value ? 'active' : ''}`}
              onClick={() => setFilterType(opt.value)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {OptIcon && <OptIcon size={14} />}
              <span>{opt.label}</span>
            </button>
          );
        })}
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
          <div className="empty-state-icon">
            <IconLeaf size={32} color="#164230" />
          </div>
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
            const TypeIcon = cfg.Icon;
            return (
              <div className="incident-card" key={incident.id}>
                {/* Timeline dot */}
                <div
                  className="incident-dot"
                  style={{ backgroundColor: cfg.dotBg }}
                >
                  <TypeIcon size={18} color={cfg.iconColor} />
                </div>

                {/* Card body */}
                <div className="incident-body">
                  {/* Header row */}
                  <div className="incident-header-row">
                    <div className="incident-meta">
                      <span className="incident-type-badge" style={{ ...cfg.badgeStyle, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <TypeIcon size={13} color="currentColor" />
                        <span>{cfg.label}</span>
                      </span>
                      <span className="incident-date" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IconCalendar size={13} />
                        <span>{formatDate(incident.incidentDate)}</span>
                      </span>
                      {incident.severityLevel && (
                        <span className={`severity-badge ${getSeverityClass(incident.severityLevel)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <IconAlertTriangle size={13} />
                          <span>Severity {incident.severityLevel} — {SEVERITY_LABELS[incident.severityLevel]}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="incident-description">{incident.description}</p>

                  {/* Action taken */}
                  {incident.actionTaken && (
                    <div className="incident-action">
                      <span className="incident-action-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IconCheck size={14} color="#166534" />
                        <span>Action:</span>
                      </span>
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <IconPencil size={13} />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => onDelete(incident.id)}
                        title="Delete this incident"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <IconTrash size={13} />
                        <span>Delete</span>
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
