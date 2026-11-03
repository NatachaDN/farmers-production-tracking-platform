import React from 'react';

export function ProductionOverviewChart({ farmType = 'MIXED' }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const cropHeights = [30, 45, 60, 40, 75, 55, 68, 85, 70, 95, 65, 80];
  const livestockHeights = [52, 38, 64, 48, 72, 60, 82, 66, 75, 58, 88, 70];
  const showCrops = farmType !== 'LIVESTOCK';
  const showLivestock = farmType !== 'CROP';

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Production Overview
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {showCrops && showLivestock
              ? 'Monthly output across crops and livestock'
              : `Monthly ${showCrops ? 'crop' : 'livestock'} production`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {(showCrops && showLivestock) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D7A52' }} />
                Crops
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                Livestock
              </span>
            </div>
          )}

          <span style={{
            fontSize: '0.75rem',
            backgroundColor: '#F4EFE6',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
            fontWeight: 500
          }}>
            Last 12 months
          </span>
        </div>
      </div>

      {/* Minimalist Column Chart */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '180px',
        paddingTop: '30px',
        paddingBottom: '10px',
        borderBottom: '1px solid #F0EAE1'
      }}>
        {months.map((m, idx) => (
          <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '3px' }}>
              {showCrops && (
                <span
                  aria-label={`Crop production ${cropHeights[idx]}%`}
                  style={{
                    width: '3px',
                    height: `${cropHeights[idx]}%`,
                    backgroundColor: '#2D7A52',
                    borderRadius: '2px',
                    position: 'relative'
                  }}
                >
                  <span style={{ position: 'absolute', top: '-4px', left: '-2.5px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D7A52' }} />
                </span>
              )}
              {showLivestock && (
                <span
                  aria-label={`Livestock production ${livestockHeights[idx]}%`}
                  style={{
                    width: '3px',
                    height: `${livestockHeights[idx]}%`,
                    backgroundColor: '#D97706',
                    borderRadius: '2px',
                    position: 'relative'
                  }}
                >
                  <span style={{ position: 'absolute', top: '-4px', left: '-2.5px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
