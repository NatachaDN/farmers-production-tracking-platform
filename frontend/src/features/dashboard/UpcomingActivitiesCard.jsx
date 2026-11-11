import React from 'react';
import '../../shared/components/Skeleton.css';

function formatScheduleTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    const targetDateOnly = new Date(target);
    targetDateOnly.setHours(0, 0, 0, 0);

    const diffDays = Math.round((targetDateOnly - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    return target.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function UpcomingActivitiesCard({ activities = [], onNavigate, loading = false }) {
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="acrea-skeleton" style={{ width: '150px', height: '20px', borderRadius: '4px' }} />
          <div className="acrea-skeleton" style={{ width: '50px', height: '14px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#FAF8F5' }}>
              <div className="acrea-skeleton" style={{ width: '65px', height: '24px', borderRadius: '6px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="acrea-skeleton" style={{ width: '70%', height: '16px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Upcoming Activities
        </h3>
        <button
          onClick={() => onNavigate && onNavigate('activities')}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-brand-primary)',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View all
        </button>
      </div>

      {activities && activities.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.map((act, i) => (
            <div key={act.id || i} style={{
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
                {formatScheduleTime(act.dateOrTime)}
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
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 16px',
          textAlign: 'center',
          backgroundColor: '#FAF8F5',
          borderRadius: '12px',
          border: '1px dashed #ECE7DC'
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500, margin: 0 }}>
            No upcoming activities scheduled
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', marginBottom: '12px' }}>
            Interventions and planned harvests will appear here.
          </p>
          <button
            onClick={() => onNavigate && onNavigate('activities')}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-brand-primary)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-brand-primary)',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Go to Activities
          </button>
        </div>
      )}
    </div>
  );
}
