import React from 'react';
import {
  IconFarms,
  IconCrop,
  IconLivestock,
  IconCamera,
  IconMapPin,
  IconArrowRight
} from '../../../shared/components/Icons';

function getTypeInfo(type) {
  if (type === 'LIVESTOCK') return { label: 'Livestock Farm', Icon: IconLivestock, color: '#D97706' };
  if (type === 'MIXED')     return { label: 'Mixed Agriculture', Icon: IconFarms, color: '#7C3AED' };
  return                           { label: 'Crop Production', Icon: IconCrop, color: '#164230' };
}

/**
 * FarmCard — Senior-farmer friendly farm card.
 * Designed with large tactile targets, clear French/English guidance,
 * instant photo upload directly on the card, and clear click-to-view affordance.
 */
export function FarmCard({ farm, plotCount, onClick, onPhotoUpload }) {
  const { label: typeLabel, Icon: TypeIcon, color: typeColor } = getTypeInfo(farm.type);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #ECE7DC',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(22,66,48,0.12)';
        e.currentTarget.style.borderColor = '#164230';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = '#ECE7DC';
      }}
    >
      {/* ── Photo banner ─────────────────────────────────────────────────── */}
      {farm.mapImageUrl ? (
        <div style={{ position: 'relative', height: '180px', width: '100%', backgroundColor: '#EAF4ED', overflow: 'hidden' }}>
          <img
            src={farm.mapImageUrl}
            alt={farm.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Status pill */}
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            backgroundColor: 'rgba(22,66,48,0.92)',
            color: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            {farm.status || 'ACTIVE'}
          </div>

          {/* Change Photo tactile badge */}
          <label
            onClick={(e) => e.stopPropagation()}
            title="Click to change farm picture"
            style={{
              position: 'absolute', bottom: '12px', right: '12px',
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#164230',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '1px solid #CBD5E1'
            }}
          >
            <IconCamera size={14} color="#164230" />
            <span>Change Photo</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { e.stopPropagation(); onPhotoUpload(e, farm); }}
            />
          </label>
        </div>
      ) : (
        /* ── Senior-friendly photo invitation banner ────────────────────── */
        <div style={{
          position: 'relative',
          height: '160px',
          width: '100%',
          backgroundColor: '#FAF9F6',
          borderBottom: '1.5px dashed #D5CEBF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px'
        }}>
          {/* Status badge */}
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            backgroundColor: '#EAF4ED', color: '#164230',
            padding: '3px 10px', borderRadius: '9999px',
            fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>
            {farm.status || 'ACTIVE'}
          </div>

          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: '#EAF4ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <IconCamera size={24} color="#164230" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#164230' }}>
              Add a Photo of Your Farm
            </div>
            <div style={{ fontSize: '0.75rem', color: '#5C6F64', marginTop: '2px' }}>
              Take or choose a picture from your device
            </div>
          </div>

          {/* Big Add Photo button */}
          <label
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 18px',
              borderRadius: '9999px',
              backgroundColor: '#164230',
              color: '#FFFFFF',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22,66,48,0.25)',
              marginTop: '4px'
            }}
          >
            <IconCamera size={14} color="#FFFFFF" />
            <span>Upload Farm Photo</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { e.stopPropagation(); onPhotoUpload(e, farm); }}
            />
          </label>
        </div>
      )}

      {/* ── Card body ────────────────────────────────────────────────────── */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {/* Type badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          borderRadius: '9999px',
          backgroundColor: '#F0FDF4',
          color: typeColor,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          alignSelf: 'flex-start'
        }}>
          <TypeIcon size={13} color={typeColor} />
          {typeLabel}
        </div>

        {/* Farm name */}
        <h3 style={{
          fontSize: '1.1875rem', fontWeight: 800,
          color: '#164230', margin: 0,
          letterSpacing: '-0.015em',
          lineHeight: 1.3
        }}>
          {farm.name}
        </h3>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#5C6F64' }}>
          <IconMapPin size={15} color="#164230" />
          <span>{[farm.district, farm.region, farm.country].filter(Boolean).join(', ') || 'Cameroon'}</span>
        </div>

        {/* Size + plot count */}
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#164230' }}>
          {farm.size} {farm.sizeUnit === 'ACRES' ? 'acres' : 'ha'}
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#5C6F64', marginLeft: '6px' }}>
            · {plotCount} {plotCount === 1 ? 'registered plot' : 'registered plots'}
          </span>
        </div>

        {/* Footer: Big tactile "View Farm Details" button */}
        <div style={{
          marginTop: 'auto', paddingTop: '12px',
          borderTop: '1px solid #F1ECE1',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.8125rem', color: '#5C6F64' }}>
            Tap card to manage plots
          </span>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#EAF4ED',
            color: '#164230',
            fontWeight: 700,
            fontSize: '0.875rem',
            padding: '8px 16px',
            borderRadius: '9999px'
          }}>
            <span>View Farm</span>
            <IconArrowRight size={14} color="#164230" />
          </div>
        </div>
      </div>
    </div>
  );
}

