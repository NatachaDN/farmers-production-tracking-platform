import React from 'react';
import { IconDroplets, IconLeaf } from '../../../shared/components/Icons';
import { AcreaMap } from '../../../shared/components/AcreaMap';

const SLOPE_LABELS = {
  FLAT:     'Flat Level Land',
  MODERATE: 'Gentle Incline',
  STEEP:    'Steep Hillside'
};

const sectionStyle = {
  backgroundColor: '#FAF9F6',
  borderRadius: 'var(--radius-xl, 20px)',
  border: '1px solid var(--color-card-border, #ECE7DC)',
  padding: '24px 28px'
};

const tagStyle = {
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#5C6F64'
};

const valueStyle = {
  margin: '4px 0 0',
  fontWeight: 600,
  color: '#164230',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.9375rem'
};

/**
 * FarmTerrainSection — terrain, water, soil, slope, notes and interactive map.
 */
export function FarmTerrainSection({ farm }) {
  const farmLocationText = [farm.district, farm.region, farm.country].filter(Boolean).join(', ');
  const hasContent = farm.accessToWater || farm.soilType || farm.slope
    || farm.additionalNotes || farm.description || farmLocationText;

  if (!hasContent) return null;

  return (
    <div style={sectionStyle}>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#164230', margin: '0 0 16px' }}>
        Terrain, Water &amp; Interactive Farm Location
      </h3>

      {/* Interactive Leaflet Map for Farm */}
      <div style={{ marginBottom: '20px' }}>
        <AcreaMap
          locationText={farmLocationText}
          label={`Farm Location (${farmLocationText || 'Cameroon'})`}
          hint="Interactive map of this farm parcel. Toggle satellite view to see crop fields and boundaries."
          height="250px"
          interactive={false}
          pinLabel={farm.name}
          pinColor="#164230"
          showPresets={false}
          enableGps={false}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
        {farm.accessToWater && (
          <div>
            <span style={tagStyle}>Water Source</span>
            <p style={valueStyle}>
              <IconDroplets size={16} color="#0284C7" />
              {farm.accessToWater === 'YES'
                ? 'Stream / River / Borehole available'
                : 'Rain-fed seasonal agriculture'}
            </p>
          </div>
        )}
        {farm.soilType && (
          <div>
            <span style={tagStyle}>Soil Type</span>
            <p style={valueStyle}>
              <IconLeaf size={16} color="#2D7A52" />
              {farm.soilType} Soil
            </p>
          </div>
        )}
        {farm.slope && (
          <div>
            <span style={tagStyle}>Topography / Slope</span>
            <p style={{ ...valueStyle }}>
              {SLOPE_LABELS[farm.slope] || farm.slope}
            </p>
          </div>
        )}
      </div>

      {(farm.additionalNotes || farm.description) && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ECE7DC' }}>
          <span style={tagStyle}>Farmer Notes &amp; Landmarks</span>
          <p style={{ margin: '6px 0 0', fontSize: '0.9375rem', color: '#164230', lineHeight: 1.6 }}>
            {farm.additionalNotes || farm.description}
          </p>
        </div>
      )}
    </div>
  );
}

