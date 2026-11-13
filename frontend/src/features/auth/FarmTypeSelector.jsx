import React from 'react';
import { IconCrop, IconLivestock, IconDashboard, IconCheck } from '../../shared/components/Icons';

const FARM_TYPES = [
  { id: 'CROP', label: 'Crop', Icon: IconCrop },
  { id: 'LIVESTOCK', label: 'Livestock', Icon: IconLivestock },
  { id: 'MIXED', label: 'Mixed', Icon: IconDashboard }
];

export function FarmTypeSelector({ value, onChange }) {
  return (
    <fieldset className="auth-farm-types">
      <legend
        style={{
          display: 'block',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          marginBottom: '6px'
        }}
      >
        Farm type
      </legend>
      <div className="auth-farm-type-options">
        {FARM_TYPES.map(({ id, label, Icon }) => {
          const isSelected = value === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--color-brand-tint)' : '#FFFFFF',
                border: isSelected
                  ? '1.5px solid var(--color-brand-primary)'
                  : '1px solid var(--color-border-input)',
                color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Icon size={16} color="currentColor" />
              <span>{label}</span>
              {isSelected && <IconCheck size={13} color="var(--color-brand-primary)" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
