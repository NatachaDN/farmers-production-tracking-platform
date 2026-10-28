import React, { useState, useEffect } from 'react';
import { PlotCard } from '../../shared/components/PlotCard';
import { AddPlotModal } from './components/AddPlotModal';
import { PlotDetailsModal } from '../crops/components/PlotDetailsModal';
import { plotService } from './services/plotService';
import { farmService } from './services/farmService';
import {
  IconFarms,
  IconPlus,
  IconSearch,
  IconSprout,
  IconTomato,
  IconBean,
  IconLeaf,
  IconCheck,
  IconMapPin
} from '../../shared/components/Icons';

function getIconForCrop(crop) {
  const c = (crop || '').toLowerCase();
  if (c.includes('tomato')) return <IconTomato size={20} color="#2D7A52" />;
  if (c.includes('bean')) return <IconBean size={20} color="#2D7A52" />;
  if (c.includes('cassava')) return <IconLeaf size={20} color="#2D7A52" />;
  return <IconSprout size={20} color="#2D7A52" />;
}

function progressForStage(stage) {
  if (stage === 'Flowering') return 74;
  if (stage === 'Vegetative growth') return 62;
  if (stage === 'Maturing') return 84;
  return 29;
}

function mapPlot(p) {
  return {
    id: p.id,
    title: p.name,
    crop: p.cropType || 'Crop',
    areaVal: p.area,
    area: `${p.area} ha cultivated area`,
    stage: p.stage || 'Planting',
    location: p.location,
    progress: progressForStage(p.stage),
    icon: getIconForCrop(p.cropType || p.name)
  };
}

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid var(--color-card-border)',
  borderRadius: 'var(--radius-xl)',
  padding: '24px 28px',
  boxShadow: 'var(--shadow-card)'
};

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 18px',
  borderRadius: '9999px',
  backgroundColor: 'var(--color-brand-primary)',
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  border: 'none'
};

export function FarmsAndPlotsView({ farmerId = 1, onNavigate, onSelectFarm }) {
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const showNotification = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setLoadError(null);

      try {
        const fetchedFarms = await farmService.getFarms();
        if (isMounted) setFarms(Array.isArray(fetchedFarms) ? fetchedFarms : []);
      } catch (err) {
        console.error('Failed to load farms:', err);
        if (isMounted) setLoadError(err.message || 'Failed to load farms.');
      }

      try {
        const fetchedPlots = await plotService.getPlots(farmerId);
        if (isMounted && Array.isArray(fetchedPlots)) setPlots(fetchedPlots.map(mapPlot));
      } catch (err) {
        console.warn('Failed to load plots:', err);
      }

      if (isMounted) setLoading(false);
    }

    loadData();
    return () => { isMounted = false; };
  }, [farmerId]);

  const handleAddPlot = async (plotData) => {
    try {
      const saved = await plotService.createPlot(farmerId, {
        ...plotData,
        farmId: farms[0]?.id
      });
      setPlots((prev) => [mapPlot(saved), ...prev]);
      showNotification(`Plot "${plotData.name}" (${plotData.area} ha) successfully added!`);
    } catch (err) {
      console.error('Failed to create plot:', err);
      showNotification(err.message || 'Failed to create plot.');
    }
  };

  const handleDeletePlot = async (plot) => {
    if (!window.confirm(`Delete plot "${plot.title}"?`)) return;
    try {
      await plotService.deletePlot(farmerId, plot.id);
      setPlots((prev) => prev.filter((p) => p.id !== plot.id));
      showNotification(`Plot "${plot.title}" was deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete plot:', err);
      showNotification(err.message || 'Failed to delete plot.');
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredPlots = plots.filter((p) =>
    (p.title || '').toLowerCase().includes(term) ||
    (p.stage || '').toLowerCase().includes(term) ||
    (p.location || '').toLowerCase().includes(term)
  );

  const totalArea = plots.reduce((acc, curr) => acc + (curr.areaVal || 0), 0).toFixed(1);

  const openFarm = (farm) => {
    if (onSelectFarm) onSelectFarm(farm.id);
    else if (onNavigate) onNavigate('farm-details');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
            zIndex: 1200,
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          <IconCheck size={14} color="#FFFFFF" />
          <span>{toast}</span>
        </div>
      )}

      <AddPlotModal
        isOpen={isAddPlotModalOpen}
        onClose={() => setIsAddPlotModalOpen(false)}
        onAddPlot={handleAddPlot}
      />

      <PlotDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPlot(null);
        }}
        plot={selectedPlot}
      />

      {/* Farms section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              My Farms
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {farms.length} farm{farms.length === 1 ? '' : 's'} · {totalArea} ha in registered plots
            </p>
          </div>
          <button type="button" style={primaryButtonStyle} onClick={() => onNavigate && onNavigate('farms-create')}>
            <IconPlus size={16} color="#FFFFFF" />
            New Farm
          </button>
        </div>

        {loading && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading farms...</p>
        )}

        {!loading && loadError && (
          <p style={{ color: '#B42318', fontSize: '0.875rem' }}>{loadError}</p>
        )}

        {!loading && !loadError && farms.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '12px' }}>
              You have no farm yet. Create your first farm to start organizing plots.
            </p>
            <button type="button" style={primaryButtonStyle} onClick={() => onNavigate && onNavigate('farms-create')}>
              <IconPlus size={16} color="#FFFFFF" />
              Create your first farm
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {farms.map((farm) => (
            <div
              key={farm.id}
              onClick={() => openFarm(farm)}
              style={{
                border: '1px solid var(--color-card-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-brand-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconFarms size={20} color="var(--color-brand-primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{farm.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {farm.type} · {farm.status}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                <IconMapPin size={14} color="currentColor" />
                {[farm.district, farm.region, farm.country].filter(Boolean).join(', ')}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}>
                {farm.size} {farm.sizeUnit === 'ACRES' ? 'acres' : 'ha'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plots section */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Plots
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--color-card-border)',
                borderRadius: '9999px',
                padding: '8px 14px'
              }}
            >
              <IconSearch size={16} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search plots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem' }}
              />
            </div>
            <button type="button" style={primaryButtonStyle} onClick={() => setIsAddPlotModalOpen(true)}>
              <IconPlus size={16} color="#FFFFFF" />
              Add Plot
            </button>
          </div>
        </div>

        {filteredPlots.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
            {plots.length === 0 ? 'No plots registered yet.' : 'No plot matches your search.'}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {filteredPlots.map((plot) => (
              <PlotCard
                key={plot.id}
                icon={plot.icon}
                title={plot.title}
                area={plot.area}
                stage={plot.stage}
                progress={plot.progress}
                onViewDetails={() => {
                  setSelectedPlot(plot);
                  setIsDetailsModalOpen(true);
                }}
                onDeletePlot={() => handleDeletePlot(plot)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
