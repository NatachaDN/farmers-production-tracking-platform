import React, { useState, useEffect } from 'react';
import '../../shared/components/Skeleton.css';
import { PlotCard } from '../../shared/components/PlotCard';
import { AddPlotModal } from './components/AddPlotModal';
import { NewFarmModal } from './components/NewFarmModal';
import { PlotDetailsModal } from '../crops/components/PlotDetailsModal';
import { plotService } from './services/plotService';
import { farmService } from './services/farmService';
import {
  IconFarms,
  IconPlus,
  IconSearch,
  IconSprout,
  IconCrop,
  IconLivestock,
  IconTomato,
  IconBean,
  IconLeaf,
  IconCheck,
  IconMapPin,
  IconCamera,
  IconChevronRight
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

export function FarmsAndPlotsView({ farmerId, onNavigate, onSelectFarm }) {
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const [isNewFarmModalOpen, setIsNewFarmModalOpen] = useState(false);
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
    if (onSelectFarm) {
      onSelectFarm(farm.id);
    } else if (onNavigate) {
      onNavigate('farm-details', farm.id);
    }
  };

  const handleCardPhotoUpload = async (e, targetFarm) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file || !targetFarm) return;

    const localUrl = URL.createObjectURL(file);
    setFarms((prev) => prev.map((f) => f.id === targetFarm.id ? { ...f, mapImageUrl: localUrl } : f));
    showNotification('Updating farm picture...');

    try {
      let finalUrl = localUrl;
      try {
        const res = await farmService.uploadFarmPhoto(file);
        if (res?.url) finalUrl = res.url;
      } catch (uploadErr) {
        console.warn('Backend image upload failed, falling back to data URL:', uploadErr);
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      await farmService.updateFarm(targetFarm.id, {
        ...targetFarm,
        mapImageUrl: finalUrl
      });
      setFarms((prev) => prev.map((f) => f.id === targetFarm.id ? { ...f, mapImageUrl: finalUrl } : f));
      showNotification(`Photo saved for "${targetFarm.name}"!`);
    } catch (err) {
      console.error('Failed to update farm photo:', err);
      showNotification('Photo updated for this session.');
    }
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

      <NewFarmModal
        isOpen={isNewFarmModalOpen}
        onClose={() => setIsNewFarmModalOpen(false)}
        onFarmCreated={(newFarm) => {
          setFarms((prev) => [newFarm, ...prev]);
          showNotification(`Farm "${newFarm.name}" created successfully!`);
        }}
        farmerId={farmerId}
      />

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
          <button type="button" style={primaryButtonStyle} onClick={() => onNavigate ? onNavigate('create-farm') : setIsNewFarmModalOpen(true)}>
            <IconPlus size={16} color="#FFFFFF" />
            New Farm
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-xl)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="acrea-skeleton" style={{ width: '60%', height: '20px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '80%', height: '14px', borderRadius: '4px', marginTop: '10px' }} />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <p style={{ color: '#B42318', fontSize: '0.875rem' }}>{loadError}</p>
        ) : farms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '12px' }}>
              You have no farm yet. Create your first farm to start organizing plots.
            </p>
            <button type="button" style={primaryButtonStyle} onClick={() => onNavigate ? onNavigate('create-farm') : setIsNewFarmModalOpen(true)}>
              <IconPlus size={16} color="#FFFFFF" />
              Create your first farm
            </button>
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {farms.map((farm) => {
            const isLivestock = farm.type === 'LIVESTOCK';
            const isMixed = farm.type === 'MIXED';
            const typeLabel = isLivestock ? 'Livestock' : isMixed ? 'Mixed' : 'Crops';
            const TypeIcon = isLivestock ? IconLivestock : isMixed ? IconFarms : IconCrop;
            const farmPlotsCount = plots.filter((p) => p.farmId == null || String(p.farmId) === String(farm.id)).length;

            return (
              <div
                key={farm.id}
                onClick={() => openFarm(farm)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid var(--color-card-border, #ECE7DC)',
                  borderRadius: 'var(--radius-xl, 20px)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(22, 66, 48, 0.12)';
                  e.currentTarget.style.borderColor = 'var(--color-brand-primary, #164230)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))';
                  e.currentTarget.style.borderColor = 'var(--color-card-border, #ECE7DC)';
                }}
              >
                {/* Farm Image Banner */}
                {farm.mapImageUrl ? (
                  <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#EAF4ED', overflow: 'hidden' }}>
                    <img
                      src={farm.mapImageUrl}
                      alt={farm.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(22, 66, 48, 0.88)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      {farm.status || 'ACTIVE'}
                    </div>
                  </div>
                ) : (
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
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#EAF4ED',
                      color: '#164230',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconFarms size={22} color="#164230" />
                    </div>
                    <label
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#164230',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                      }}
                    >
                      <IconCamera size={13} /> Add Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleCardPhotoUpload(e, farm)}
                      />
                    </label>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#EAF4ED',
                      color: '#164230',
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {farm.status || 'ACTIVE'}
                    </div>
                  </div>
                )}

                {/* Farm Card Content */}
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--color-text-primary, #164230)',
                      lineHeight: 1.3
                    }}>
                      {farm.name}
                    </div>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: isLivestock ? '#FEF3C7' : isMixed ? '#E0F2FE' : '#EAF4ED',
                      color: isLivestock ? '#B45309' : isMixed ? '#0369A1' : '#164230',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      <TypeIcon size={12} /> {typeLabel}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-text-muted, #5C6F64)' }}>
                    <IconMapPin size={15} color="#164230" />
                    <span>{[farm.district, farm.region, farm.country].filter(Boolean).join(', ') || 'Cameroon'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #F1ECE1' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#164230' }}>
                      {farm.size} {farm.sizeUnit === 'ACRES' ? 'acres' : 'ha'}
                      <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                        · {farmPlotsCount} plot{farmPlotsCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#164230',
                      fontWeight: 700,
                      fontSize: '0.8125rem'
                    }}>
                      View Farm <IconChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="acrea-skeleton" style={{ width: '50%', height: '22px', borderRadius: '4px' }} />
                  <div className="acrea-skeleton" style={{ width: '80px', height: '20px', borderRadius: '9999px' }} />
                </div>
                <div className="acrea-skeleton" style={{ width: '35%', height: '14px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px', marginTop: '8px' }} />
              </div>
            ))}
          </div>
        ) : filteredPlots.length === 0 ? (
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
