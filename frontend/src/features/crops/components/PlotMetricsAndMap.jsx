import React from 'react';
import { IconZap, IconDroplets, IconSprout, IconCheckCircle } from '../../../shared/components/Icons';
import { AcreaMap } from '../../../shared/components/AcreaMap';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function PlotMetricsAndMap({ plot, areaVal, targetYield, plantingDate, harvestDate, stage, progress }) {
  const plotLoc = plot.location && plot.location !== '—' ? plot.location : '';

  return (
    <>
      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Cultivated Area</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{areaVal} ha</div>
        </div>
        <div style={{ backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Target Yield</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>{targetYield}</div>
        </div>
        <div style={{ backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Planting Date</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatDate(plantingDate)}</div>
        </div>
        <div style={{ backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Est. Harvest</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatDate(harvestDate)}</div>
        </div>
      </div>

      {/* Interactive Leaflet Map for Plot */}
      <div>
        <AcreaMap
          locationText={plotLoc}
          label={`Plot Map & Parcel Location ${plotLoc ? `(${plotLoc})` : ''}`}
          hint="Interactive map of this plot. Toggle Satellite to inspect crop rows and foliage boundaries."
          height="200px"
          interactive={false}
          pinLabel={plot.plotName || plot.title || 'Plot'}
          pinColor="#2D7A52"
          showPresets={false}
          enableGps={false}
        />
      </div>

      {/* Growth Stage Progress */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconZap size={16} color="var(--color-brand-primary)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Current Growth Stage: <strong style={{ color: 'var(--color-brand-primary)' }}>{stage}</strong>
            </span>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>{progress}% Complete</span>
        </div>
        <div style={{ height: '8px', width: '100%', backgroundColor: '#ECE7DC', borderRadius: '9999px', overflow: 'hidden', marginTop: '8px' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--color-brand-primary)', borderRadius: '9999px', transition: 'width 500ms ease-out' }} />
        </div>
      </div>

      {/* Agronomic Conditions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconDroplets size={22} color="#0284C7" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Soil Moisture</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0369A1' }}>68% · Optimal</div>
          </div>
        </div>
        <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconSprout size={22} color="#16A34A" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Crop Health</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#15803D' }}>Good · Low Risk</div>
          </div>
        </div>
        <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconCheckCircle size={22} color="#3E7B52" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Cycle Status</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#164230' }}>{plot.subStatus || 'On Track'}</div>
          </div>
        </div>
      </div>
    </>
  );
}
