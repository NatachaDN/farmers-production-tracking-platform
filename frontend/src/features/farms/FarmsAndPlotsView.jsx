import React, { useState } from 'react';
import { PlotCard } from '../../shared/components/PlotCard';
import {
  IconFarms,
  IconPlus,
  IconSearch,
  IconFilter,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf
} from '../../shared/components/Icons';

export function FarmsAndPlotsView() {
  const [searchTerm, setSearchTerm] = useState('');

  const plots = [
    {
      id: 'plot-a',
      title: 'Plot A — Maize',
      crop: 'Maize',
      area: '2.5 ha cultivated area',
      stage: 'Vegetative growth',
      progress: 62,
      icon: <IconSprout size={20} color="#2D7A52" />
    },
    {
      id: 'plot-b',
      title: 'Plot B — Tomatoes',
      crop: 'Tomatoes',
      area: '1.0 ha cultivated area',
      stage: 'Flowering',
      progress: 74,
      icon: <IconTomato size={20} color="#2D7A52" />
    },
    {
      id: 'plot-c',
      title: 'Plot C — Beans',
      crop: 'Beans',
      area: '0.8 ha cultivated area',
      stage: 'Planting',
      progress: 29,
      icon: <IconBean size={20} color="#2D7A52" />
    },
    {
      id: 'plot-d',
      title: 'Plot D — Cassava',
      crop: 'Cassava',
      area: '2.0 ha cultivated area',
      stage: 'Maturing',
      progress: 84,
      icon: <IconLeaf size={20} color="#2D7A52" />
    }
  ];

  const filteredPlots = plots.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.stage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Farm Overview Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-brand-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconFarms size={22} color="var(--color-brand-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.015em' }}>
                Green Acres Farm
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Nakuru County, Kenya · Main farm
              </p>
            </div>
          </div>

          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-brand-primary)',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-subtle)',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)'}
          >
            <IconPlus size={16} />
            <span>Add Farm</span>
          </button>
        </div>

        {/* Metric Summary Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #F4EFE6'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total area</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>8.7 ha</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Plot count</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>4 plots</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Active cycles</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>4 cycles</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Next harvest</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Tomatoes · 18 Oct</div>
          </div>
        </div>
      </div>

      {/* Plots Section */}
      <div>
        {/* Section Header & Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.015em' }}>
            Plots
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              width: '220px'
            }}>
              <IconSearch size={16} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search plots or crops"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-primary)',
                  width: '100%',
                  backgroundColor: 'transparent'
                }}
              />
            </div>

            {/* Filter Dropdown Button */}
            <button style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-card-border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)'
            }}>
              <IconFilter size={14} />
              <span>All stages</span>
            </button>

            {/* Add Plot Button */}
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-subtle)',
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)'}
            >
              <IconPlus size={15} />
              <span>Add Plot</span>
            </button>
          </div>
        </div>

        {/* 2x2 Plots Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {filteredPlots.map((plot) => (
            <PlotCard
              key={plot.id}
              icon={plot.icon}
              title={plot.title}
              area={plot.area}
              stage={plot.stage}
              progress={plot.progress}
              updated="Updated today"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
