import React from 'react';
import { PlotCard } from '../../../shared/components/PlotCard';
import { IconPlus, IconSprout } from '../../../shared/components/Icons';
import { getCropIcon, stageProgress } from '../utils/farmPlotUtils';

const addBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 20px',
  borderRadius: '9999px',
  backgroundColor: '#164230',
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: '0.875rem',
  border: 'none',
  cursor: 'pointer'
};

/**
 * FarmPlotsSection — grid of PlotCards for a farm, with empty-state CTA.
 * Senior-farmer-friendly: big "Add Plot" button, clear empty message.
 */
export function FarmPlotsSection({ farmName, plots, onAddPlot, onViewPlot }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-xl, 20px)',
      border: '1px solid var(--color-card-border, #ECE7DC)',
      padding: '28px',
      boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#164230', margin: 0 }}>
            Plots &amp; Cultivated Parcels
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#5C6F64', margin: '4px 0 0' }}>
            Fields inside <strong>{farmName}</strong> dedicated to specific crops or grazing.
          </p>
        </div>
        <button type="button" style={addBtn} onClick={onAddPlot}>
          <IconPlus size={16} /> Add Plot
        </button>
      </div>

      {plots.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          backgroundColor: '#FAF9F6',
          borderRadius: '16px',
          border: '1.5px dashed #D6CFC5'
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            backgroundColor: '#EAF4ED',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <IconSprout size={28} color="#164230" />
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#164230', margin: '0 0 8px' }}>
            No plots on this farm yet
          </h3>
          <p style={{ color: '#5C6F64', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 20px' }}>
            Dividing your farm into plots helps you track individual crops like plantains,
            maize, tomatoes — and their harvest yields.
          </p>
          <button
            type="button"
            onClick={onAddPlot}
            style={{ ...addBtn, padding: '13px 28px', fontSize: '0.9375rem', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(22,66,48,0.2)' }}
          >
            <IconPlus size={18} /> Add First Plot to this Farm
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {plots.map((plot) => (
            <PlotCard
              key={plot.id}
              icon={getCropIcon(plot.cropType || plot.name)}
              title={plot.name}
              area={`${plot.area} ha cultivated area`}
              stage={plot.stage || 'Planting'}
              progress={stageProgress(plot.stage)}
              imageUrls={plot.imageUrls}
              onViewDetails={() => onViewPlot(plot)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

