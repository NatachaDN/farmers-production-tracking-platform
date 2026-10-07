import React from 'react';
import { IconCrop, IconLivestock } from '../../shared/components/Icons';

export function QuickModuleCards({ onNavigate }) {
  return (
    <>
      {/* Crop Production Quick Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#EAF4ED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconCrop size={20} color="#2D7A52" />
            </div>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#EAF4ED', color: '#2D7A52', padding: '3px 8px', borderRadius: '9999px', fontWeight: 500 }}>
              Crop production
            </span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
            Crop Production
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Manage plots, production cycles, activities and harvests.
          </p>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F4EFE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            4 active cycles · 6.3 t harvested
          </span>
          <button
            onClick={() => onNavigate && onNavigate('crops')}
            style={{ fontSize: '0.8125rem', color: '#2D7A52', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Open module →
          </button>
        </div>
      </div>

      {/* Animal Production Quick Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconLivestock size={20} color="#D97706" />
            </div>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: '9999px', fontWeight: 500 }}>
              Animal production
            </span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
            Animal Production
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
            Track animal groups, feeding, production and population changes.
          </p>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F4EFE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            4 groups · 6,840 units this month
          </span>
          <button
            onClick={() => onNavigate && onNavigate('livestock')}
            style={{ fontSize: '0.8125rem', color: '#D97706', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Open module →
          </button>
        </div>
      </div>
    </>
  );
}
