import React from 'react';
import {
  IconFarms,
  IconCrop,
  IconLivestock,
  IconCamera,
  IconMapPin,
  IconChevronRight
} from '../../../shared/components/Icons';

const HOVER_STYLE = {
  transform: 'translateY(-4px)',
  boxShadow: '0 12px 28px rgba(22,66,48,0.12)',
  borderColor: '#164230'
};

const BASE_STYLE = {
  transform: 'translateY(0)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
  borderColor: '#ECE7DC'
};

function getTypeInfo(type) {
  if (type === 'LIVESTOCK') return { label: 'Livestock', Icon: IconLivestock, color: '#D97706' };
  if (type === 'MIXED')     return { label: 'Mixed',     Icon: IconFarms,     color: '#7C3AED' };
  return                           { label: 'Crops',     Icon: IconCrop,      color: '#164230' };
}

/**
 * FarmCard — Displays a single farm with photo banner.
 * Clicking the card opens farm details; "Add Photo" uploads inline.
 */
export function FarmCard({ farm, plotCount, onClick, onPhotoUpload }) {
  const { label: typeLabel, Icon: TypeIcon, color: typeColor } = getTypeInfo(farm.type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #ECE7DC',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        ...BASE_STYLE
      }}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, HOVER_STYLE)}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, BASE_STYLE)}
    >
      {/* ── Photo banner ─────────────────────────────────────────────────── */}
      {farm.mapImageUrl ? (
        <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#EAF4ED', overflow: 'hidden' }}>
          <img
            src={farm.mapImageUrl}
            alt={farm.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Status pill */}
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            backgroundColor: 'rgba(22,66,48,0.88)',
            color: '#FFFFFF',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            {farm.status || 'ACTIVE'}
          </div>
        </div>
      ) : (
        /* ── Empty photo placeholder ─────────────────────────────────────── */
        <div style={{
          position: 'relative',
          height: '135px',
          width: '100%',
          backgroundColor: '#FAF9F6',
          borderBottom: '1px solid #ECE7DC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            backgroundColor: '#EAF4ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <IconFarms size={22} color="#164230" />
          </div>

          {/* Add Photo button */}
          <label
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 14px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#164230',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
            }}
          >
            <IconCamera size={13} /> Add Photo
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { e.stopPropagation(); onPhotoUpload(e, farm); }}
            />
          </label>

          {/* Status pill */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            backgroundColor: '#EAF4ED', color: '#164230',
            padding: '3px 9px', borderRadius: '9999px',
            fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            {farm.status || 'ACTIVE'}
          </div>
        </div>
      )}

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {/* Type badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px',
          borderRadius: '9999px',
          backgroundColor: '#F0FDF4',
          color: typeColor,
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          alignSelf: 'flex-start'
        }}>
          <TypeIcon size={12} color={typeColor} />
          {typeLabel}
        </div>

        {/* Farm name */}
        <h3 style={{
          fontSize: '1.0625rem', fontWeight: 700,
          color: '#164230', margin: 0,
          letterSpacing: '-0.01em',
          lineHeight: 1.3
        }}>
          {farm.name}
        </h3>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8125rem', color: '#5C6F64' }}>
          <IconMapPin size={13} color="#164230" />
          <span>{[farm.district, farm.region, farm.country].filter(Boolean).join(', ') || 'Cameroon'}</span>
        </div>

        {/* Footer: size + plots + view link */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: '10px',
          borderTop: '1px solid #F1ECE1'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#164230' }}>
            {farm.size} {farm.sizeUnit === 'ACRES' ? 'acres' : 'ha'}
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#5C6F64', marginLeft: '5px' }}>
              · {plotCount} {plotCount === 1 ? 'plot' : 'plots'}
            </span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#164230', fontWeight: 700, fontSize: '0.8125rem' }}>
            View Farm <IconChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

