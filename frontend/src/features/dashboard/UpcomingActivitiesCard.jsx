import React from 'react';

export function UpcomingActivitiesCard({ onNavigate }) {
  const activities = [
    { time: '14:00', title: 'Irrigate tomatoes', location: 'Plot B' },
    { time: 'Tomorrow', title: 'Weigh broilers', location: 'Batch C' },
    { time: '04 Oct', title: 'Apply fertilizer', location: 'Plot A' }
  ];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Upcoming Activities
        </h3>
        <button
          onClick={() => onNavigate && onNavigate('activities')}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View calendar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {activities.map((act, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '10px 12px',
            borderRadius: '10px',
            backgroundColor: '#FAF8F5'
          }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              backgroundColor: '#FFFFFF',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #ECE7DC',
              minWidth: '65px',
              textAlign: 'center'
            }}>
              {act.time}
            </span>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {act.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {act.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
