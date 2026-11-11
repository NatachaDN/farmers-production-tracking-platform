import React from 'react';
import { IconChevronRight } from '../../shared/components/Icons';
import '../../shared/components/Skeleton.css';

function formatActivityDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    const dOnly = new Date(d);
    dOnly.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today - dOnly) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
}

const TYPE_COLORS = {
  WATERING: '#E6F6F4',
  FERTILIZING: '#EAF4ED',
  TREATMENT: '#FEF3C7',
  WEEDING: '#F4EFE6',
  HARVEST: '#E6F6F4',
  PLANTING: '#EAF4ED'
};

export function RecentActivitiesCard({ activities = [], onNavigate, loading = false }) {
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
          <div className="acrea-skeleton" style={{ width: '130px', height: '20px', borderRadius: '4px' }} />
          <div className="acrea-skeleton" style={{ width: '50px', height: '14px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div className="acrea-skeleton" style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div className="acrea-skeleton" style={{ width: '65%', height: '14px', borderRadius: '4px' }} />
                  <div className="acrea-skeleton" style={{ width: '45%', height: '12px', borderRadius: '4px' }} />
                </div>
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
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Recent Activities
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
          {activities.map((item, i) => {
            const bg = TYPE_COLORS[item.activityType] || '#EAF4ED';
            const typeLabel = item.activityType
              ? item.activityType.charAt(0) + item.activityType.slice(1).toLowerCase()
              : 'Activity';
            const title = item.cropName ? `${typeLabel} — ${item.cropName}` : (item.cycleName ? `${typeLabel} — ${item.cycleName}` : typeLabel);
            const meta = `${item.plotName || 'Plot'} · ${formatActivityDate(item.activityDate)}`;

            return (
              <div
                key={item.id || i}
                onClick={() => onNavigate && onNavigate('activities')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 4px',
                  borderBottom: i < activities.length - 1 ? '1px solid #F4EFE6' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D7A52' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {meta}
                    </div>
                  </div>
                </div>

                <IconChevronRight size={14} color="var(--color-text-muted)" />
              </div>
            );
          })}
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
            No recent activities recorded
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', marginBottom: '12px' }}>
            Interventions performed on your crops will show up here.
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
            Record activity
          </button>
        </div>
      )}
    </div>
  );
}
