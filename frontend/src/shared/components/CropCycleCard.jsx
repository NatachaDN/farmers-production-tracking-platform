import React from 'react';
import { StatusBadge } from './StatusBadge';

export function CropCycleCard({
  icon,
  cropName,
  plotName,
  area,
  status = "Active",
  plantingDate,
  expectedHarvest,
  expectedQuantity,
  expectedQuantityUnit = "kg",
  stage,
  progress = 0,
  subStatus = "On track",
  onViewDetails
}) {
  return (
    <div style={{
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-card)',
      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
    }}>
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-brand-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </div>
            <div>
              <h3 style={{
                fontSize: '1.0625rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em'
              }}>
                {cropName} · {plotName}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {area}
              </p>
            </div>
          </div>

          <StatusBadge status={status} size="sm" />
        </div>

        {/* Dates & Expected Target Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: expectedQuantity ? '1fr 1fr 1fr' : '1fr 1fr',
          gap: '12px',
          marginTop: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Planting date</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{plantingDate || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Expected harvest</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>{expectedHarvest || '—'}</div>
          </div>
          {expectedQuantity && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Target yield</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>
                {expectedQuantity.toLocaleString()} {expectedQuantityUnit || 'kg'}
              </div>
            </div>
          )}
        </div>

        {/* Stage & Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{stage}</span>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{
            height: '6px',
            width: '100%',
            backgroundColor: '#ECE7DC',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--color-brand-primary)',
              borderRadius: '9999px',
              transition: 'width 400ms ease-out'
            }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '22px',
        paddingTop: '14px',
        borderTop: '1px solid #F4EFE6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
          {subStatus}
        </span>

        <button
          onClick={onViewDetails}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-brand-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          View details →
        </button>
      </div>
    </div>
  );
}
