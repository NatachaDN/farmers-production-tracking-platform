import React, { useState, useEffect } from 'react';
import { PlotCard } from '../../shared/components/PlotCard';
import { AddPlotModal } from './components/AddPlotModal';
import { plotService } from './services/plotService';
import {
  IconFarms,
  IconPlus,
  IconSearch,
  IconFilter,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconCheck
} from '../../shared/components/Icons';

const INITIAL_PLOTS = [
  {
    id: 1,
    title: 'Plot A — Maize',
    crop: 'Maize',
    areaVal: 2.5,
    area: '2.5 ha cultivated area',
    stage: 'Vegetative growth',
    location: 'North Field, Section 1',
    progress: 62,
    icon: <IconSprout size={20} color="#2D7A52" />
  },
  {
    id: 2,
    title: 'Plot B — Tomatoes',
    crop: 'Tomatoes',
    areaVal: 1.0,
    area: '1.0 ha cultivated area',
    stage: 'Flowering',
    location: 'East Field, Block B',
    progress: 74,
    icon: <IconTomato size={20} color="#2D7A52" />
  },
  {
    id: 3,
    title: 'Plot C — Beans',
    crop: 'Beans',
    areaVal: 0.8,
    area: '0.8 ha cultivated area',
    stage: 'Planting',
    location: 'South Plot, Zone 2',
    progress: 29,
    icon: <IconBean size={20} color="#2D7A52" />
  },
  {
    id: 4,
    title: 'Plot D — Cassava',
    crop: 'Cassava',
    areaVal: 2.0,
    area: '2.0 ha cultivated area',
    stage: 'Maturing',
    location: 'West Plot, Hillside',
    progress: 84,
    icon: <IconLeaf size={20} color="#2D7A52" />
  }
];

function getIconForCrop(crop) {
  const c = (crop || '').toLowerCase();
  if (c.includes('tomato')) return <IconTomato size={20} color="#2D7A52" />;
  if (c.includes('bean')) return <IconBean size={20} color="#2D7A52" />;
  if (c.includes('cassava')) return <IconLeaf size={20} color="#2D7A52" />;
  return <IconSprout size={20} color="#2D7A52" />;
}

export function FarmsAndPlotsView({ farmerId = 1 }) {
  const [plots, setPlots] = useState(INITIAL_PLOTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadPlots() {
      try {
        const data = await plotService.getPlots(farmerId);
        if (data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p) => ({
            id: p.id,
            title: p.name,
            crop: p.cropType || 'Crop',
            areaVal: p.area,
            area: `${p.area} ha cultivated area`,
            stage: p.stage || 'Planting',
            location: p.location,
            progress: p.stage === 'Flowering' ? 74 : p.stage === 'Vegetative growth' ? 62 : p.stage === 'Maturing' ? 84 : 29,
            icon: getIconForCrop(p.cropType || p.name)
          }));
          setPlots(mapped);
        }
      } catch (err) {
        console.warn('Backend API plots fetch failed, using local plots:', err);
      }
    }
    loadPlots();
  }, [farmerId]);

  const handleAddPlot = async (plotData) => {
    let savedPlot;
    try {
      savedPlot = await plotService.createPlot(farmerId, plotData);
    } catch (err) {
      console.warn('Backend save failed, adding to local state:', err);
    }

    const newPlotItem = {
      id: savedPlot?.id || Date.now(),
      title: plotData.name,
      crop: plotData.cropType || 'Crop',
      areaVal: plotData.area,
      area: `${plotData.area} ha cultivated area`,
      stage: plotData.stage || 'Planting',
      location: plotData.location,
      progress: plotData.stage === 'Flowering' ? 74 : plotData.stage === 'Vegetative growth' ? 62 : plotData.stage === 'Maturing' ? 84 : 20,
      icon: getIconForCrop(plotData.cropType || plotData.name)
    };

    setPlots((prev) => [newPlotItem, ...prev]);
    showNotification(`Plot "${plotData.name}" (${plotData.area} ha) successfully registered!`);
  };

  const filteredPlots = plots.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalArea = plots.reduce((acc, curr) => acc + (curr.areaVal || 0), 0).toFixed(1);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#164230',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md, 10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1100,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#3E7B52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconCheck size={14} color="#FFFFFF" />
          </div>
          <span>{toast}</span>
        </div>
      )}

      {/* Add Plot Modal */}
      <AddPlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPlot={handleAddPlot}
      />

      {/* Farm Overview Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-brand-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
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
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-brand-primary)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)')}
          >
            <IconPlus size={16} />
            <span>Add Plot</span>
          </button>
        </div>

        {/* Metric Summary Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #F4EFE6'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total area</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{totalArea} ha</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Plot count</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{plots.length} plots</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Active cycles</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{plots.length} cycles</div>
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 14px',
                width: '220px'
              }}
            >
              <IconSearch size={16} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search plots or location"
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
            <button
              style={{
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
              }}
            >
              <IconFilter size={14} />
              <span>All stages</span>
            </button>

            {/* Add Plot Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)')}
            >
              <IconPlus size={15} />
              <span>Add Plot</span>
            </button>
          </div>
        </div>

        {/* 2x2 Plots Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}
        >
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
