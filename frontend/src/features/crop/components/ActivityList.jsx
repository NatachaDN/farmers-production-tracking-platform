import React, { useState } from 'react';
import './ActivityList.css';

const TYPE_CONFIG = {
  WATERING: {
    label: 'Watering',
    icon: '💧',
    badgeClass: 'badge-watering',
  },
  TREATMENT: {
    label: 'Treatment',
    icon: '🛡️',
    badgeClass: 'badge-treatment',
  },
  FERTILIZING: {
    label: 'Fertilizing',
    icon: '🌱',
    badgeClass: 'badge-fertilizing',
  },
  WEEDING: {
    label: 'Weeding',
    icon: '🌾',
    badgeClass: 'badge-weeding',
  },
};

export function ActivityList({
  activities = [],
  isLoading,
  onEdit,
  onDelete,
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'ALL') return true;
    return act.activityType === filterType;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="activity-list-container">
      {/* Header & Filter Bar */}
      <div className="list-toolbar">
        <div>
          <h3 className="toolbar-title">Cycle Interventions History</h3>
          <p className="toolbar-count">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} recorded
          </p>
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          <button
            type="button"
            className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All ({activities.length})
          </button>
          {Object.keys(TYPE_CONFIG).map((type) => {
            const count = activities.filter((a) => a.activityType === type).length;
            return (
              <button
                type="button"
                key={type}
                className={`filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {TYPE_CONFIG[type].icon} {TYPE_CONFIG[type].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="list-empty-state">
          <div className="loading-spinner"></div>
          <p>Loading cycle history...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        /* Empty State */
        <div className="list-empty-state">
          <span className="empty-icon">📋</span>
          <h4>No activities recorded yet</h4>
          <p>
            {filterType === 'ALL'
              ? 'No interventions have been recorded for this cycle. Use the form above to log the first activity.'
              : `No ${TYPE_CONFIG[filterType]?.label.toLowerCase()} interventions found.`}
          </p>
        </div>
      ) : (
        /* History Table */
        <div className="table-responsive">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Notes / Observations</th>
                <th>Recorded At</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((act) => {
                const config = TYPE_CONFIG[act.activityType] || {
                  label: act.activityType,
                  icon: '📌',
                  badgeClass: 'badge-default',
                };

                return (
                  <tr key={act.id} className="activity-row">
                    {/* Date */}
                    <td className="cell-date">
                      <span className="date-badge">{formatDate(act.activityDate)}</span>
                    </td>

                    {/* Type */}
                    <td className="cell-type">
                      <span className={`type-badge ${config.badgeClass}`}>
                        <span className="badge-icon">{config.icon}</span>
                        <span>{config.label}</span>
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="cell-notes">
                      {act.notes ? (
                        <p className="notes-preview" title={act.notes}>
                          {act.notes}
                        </p>
                      ) : (
                        <span className="no-notes">No notes</span>
                      )}
                    </td>

                    {/* Recorded Audit */}
                    <td className="cell-meta">
                      {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>

                    {/* Actions */}
                    <td className="cell-actions">
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="action-btn view-btn"
                          title="View Details"
                          onClick={() => setSelectedActivity(act)}
                        >
                          👁️
                        </button>
                        {onEdit && (
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            title="Edit"
                            onClick={() => onEdit(act)}
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            title="Delete"
                            onClick={() => onDelete(act.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal (Acceptance criteria: viewing date, type, notes) */}
      {selectedActivity && (
        <div className="modal-backdrop" onClick={() => setSelectedActivity(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Intervention Details</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedActivity(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Intervention Type:</span>
                <span className={`type-badge ${TYPE_CONFIG[selectedActivity.activityType]?.badgeClass || ''}`}>
                  {TYPE_CONFIG[selectedActivity.activityType]?.icon} {TYPE_CONFIG[selectedActivity.activityType]?.label || selectedActivity.activityType}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of Intervention:</span>
                <span className="detail-value">{formatDate(selectedActivity.activityDate)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cycle ID:</span>
                <span className="detail-value">#{selectedActivity.cycleId}</span>
              </div>
              <div className="detail-notes-block">
                <span className="detail-label">Notes & Observations:</span>
                <div className="notes-box">
                  {selectedActivity.notes || 'No detailed observations were recorded for this activity.'}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedActivity(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
