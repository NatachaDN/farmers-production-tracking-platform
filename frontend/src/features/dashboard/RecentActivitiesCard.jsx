import React from 'react';
import { IconChevronRight } from '../../shared/components/Icons';

export function RecentActivitiesCard({ onNavigate }) {
  const recentActivities = [
    { title: 'Fertilization — Maize', meta: 'Plot A · Today, 08:30', bg: '#EAF4ED' },
    { title: 'Feeding — Cattle Group 1', meta: 'Dairy unit · Today, 07:15', bg: '#FEF3C7' },
    { title: 'Harvest — Tomatoes', meta: 'Plot B · Yesterday, 16:40', bg: '#E6F6F4' },
    { title: 'Egg collection — Layer Group A', meta: 'Poultry house · Yesterday, 10:20', bg: '#FEF3C7' }
  ];

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Recent Activities
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
          View all
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recentActivities.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 4px',
            borderBottom: i < 3 ? '1px solid #F4EFE6' : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {item.meta}
                </div>
              </div>
            </div>

            <IconChevronRight size={14} color="var(--color-text-muted)" />
          </div>
        ))}
      </div>
    </div>
  );
}
