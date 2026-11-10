import React from 'react';

export function ProductionOverviewChart({ data = [], totalKg = 0 }) {
  // If data is passed as array of { month: 'Jan', quantityKg: 120 }
  const months = data.length > 0
    ? data
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => ({ month: m, quantityKg: 0 }));

  const maxVal = Math.max(...months.map(d => d.quantityKg || 0), 0);

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
            Monthly harvested yield from recorded crop cycles
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2D7A52' }} />
              Harvest (kg)
            </span>
          </div>

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
        {months.map((d, idx) => {
          const val = d.quantityKg || 0;
          const heightPercent = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
          return (
            <div
              key={idx}
              title={`${d.month}: ${val.toLocaleString()} kg`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px', cursor: 'default' }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                height: '120px',
                width: '6px',
                position: 'relative'
              }}>
                {val > 0 ? (
                  <div style={{
                    width: '3px',
                    height: `${Math.max(heightPercent, 6)}%`,
                    backgroundColor: '#2D7A52',
                    borderRadius: '2px',
                    margin: '0 auto',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      left: '-2.5px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#2D7A52'
                    }} />
                  </div>
                ) : (
                  <div style={{
                    width: '3px',
                    height: '2px',
                    backgroundColor: '#E2DCD2',
                    borderRadius: '1px',
                    margin: '0 auto'
                  }} />
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: val > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
      {maxVal === 0 && (
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          marginTop: '12px',
          marginBottom: '0'
        }}>
          No harvest records logged yet. Once you complete a cycle harvest, output trends will appear here.
        </p>
      )}
    </div>
  );
}
