import React from 'react';
import {
  IconCrop,
  IconLivestock,
  IconFarms
} from '../../../shared/components/Icons';

function getTypeInfo(type) {
  if (type === 'LIVESTOCK') return { label: 'Livestock & Animals', Icon: IconLivestock };
  if (type === 'MIXED')     return { label: 'Mixed Agriculture', Icon: IconFarms };
  return { label: 'Crops & Fields', Icon: IconCrop };
}

const metricCard = {
  backgroundColor: '#FFFFFF',
  borderRadius: 'var(--radius-xl, 20px)',
  border: '1px solid var(--color-card-border, #ECE7DC)',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = { fontSize: '0.875rem', color: '#5C6F64', fontWeight: 500 };
const valueStyle = { fontSize: '1.75rem', fontWeight: 800, color: '#164230' };
const subStyle   = { fontSize: '0.8125rem', color: '#5C6F64' };

/**
 * FarmMetricCards — 3 stat cards: size, activity type, plots count.
 */
export function FarmMetricCards({ farm, plotCount }) {
  const sizeText   = `${farm.size} ${farm.sizeUnit === 'ACRES' ? 'acres' : 'hectares'}`;
  const altUnit    = farm.sizeUnit === 'ACRES'
    ? `≈ ${(farm.size / 2.471).toFixed(1)} ha`
    : `≈ ${(farm.size * 2.471).toFixed(1)} acres`;

  const { label: typeLabel, Icon: TypeIcon } = getTypeInfo(farm.type);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {/* Total Size */}
      <div style={metricCard}>
        <div style={labelStyle}>Total Farm Size</div>
        <div style={valueStyle}>{sizeText}</div>
        <div style={subStyle}>Approximately {altUnit}</div>
      </div>

      {/* Primary Activity */}
      <div style={metricCard}>
        <div style={labelStyle}>Primary Activity</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            backgroundColor: '#EAF4ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <TypeIcon size={18} color="#164230" />
          </div>
          <div style={{ fontSize: '1.1875rem', fontWeight: 700, color: '#164230' }}>{typeLabel}</div>
        </div>
        <div style={subStyle}>Main production focus</div>
      </div>

      {/* Plots count */}
      <div style={metricCard}>
        <div style={labelStyle}>Plots in this Farm</div>
        <div style={valueStyle}>{plotCount} {plotCount === 1 ? 'Plot' : 'Plots'}</div>
        <div style={subStyle}>
          {plotCount > 0 ? 'Individual parcels cultivated' : 'No parcels defined yet'}
        </div>
      </div>
    </div>
  );
}

