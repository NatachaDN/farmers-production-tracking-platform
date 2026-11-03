import React from 'react';
import { IconCrop, IconLivestock } from '../../shared/components/Icons';

const MODULES = [
  {
    type: 'CROP',
    title: 'Crop Production',
    label: 'Crop production',
    description: 'Manage plots, production cycles, activities and harvests.',
    summary: '4 active cycles · 6.3 t harvested',
    route: 'crops',
    Icon: IconCrop,
    color: '#2D7A52',
    background: '#EAF4ED'
  },
  {
    type: 'LIVESTOCK',
    title: 'Animal Production',
    label: 'Animal production',
    description: 'Track animal groups, feeding, production and population changes.',
    summary: '4 groups · 6,840 units this month',
    route: 'animals',
    Icon: IconLivestock,
    color: '#D97706',
    background: '#FEF3C7'
  }
];

export function QuickModuleCards({ onNavigate, farmType = 'MIXED' }) {
  const modules = MODULES.filter((module) => farmType === 'MIXED' || module.type === farmType);

  return modules.map(({ type, title, label, description, summary, route, Icon, color, background }) => (
    <div
      key={type}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={20} color={color} />
          </div>
          <span style={{ fontSize: '0.75rem', backgroundColor: background, color, padding: '3px 8px', borderRadius: '9999px', fontWeight: 500 }}>
            {label}
          </span>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          {description}
        </p>
      </div>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F4EFE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {summary}
        </span>
        <button
          onClick={() => onNavigate && onNavigate(route)}
          style={{ fontSize: '0.8125rem', color, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Open module →
        </button>
      </div>
    </div>
  ));
}
