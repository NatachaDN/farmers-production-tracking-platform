import React, { useState, useEffect } from 'react';
import '../../shared/components/Skeleton.css';
import { PlotCard } from '../../shared/components/PlotCard';
import { ConfirmModal } from '../../shared/components/ConfirmModal';
import { FarmCard } from './components/FarmCard';
import { AddPlotModal } from './components/AddPlotModal';
import { NewFarmModal } from './components/NewFarmModal';
import { PlotDetailsModal } from '../crops/components/PlotDetailsModal';
import { plotService } from './services/plotService';
import { farmService } from './services/farmService';
import { mapPlotData } from './utils/farmPlotUtils';
import {
  IconPlus, IconSearch, IconCheck
} from '../../shared/components/Icons';

// ─── Shared styles ────────────────────────────────────────────────────────────
const panelStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid var(--color-card-border)',
  borderRadius: 'var(--radius-xl)',
  padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3.5vw, 28px)',
  boxShadow: 'var(--shadow-card)'
};

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 18px',
  borderRadius: '9999px',
  backgroundColor: 'var(--color-brand-primary)',
  color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem',
  cursor: 'pointer', border: 'none'
};

// ─── Main view ────────────────────────────────────────────────────────────────
export function FarmsAndPlotsView({ farmerId, onNavigate, onSelectFarm, onSelectPlot, onCreatePlot }) {
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [forceDeleteWarning, setForceDeleteWarning] = useState('');
  const [deletingPlot, setDeletingPlot] = useState(false);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true); setLoadError(null);
      try {
        const fetchedFarms = await farmService.getFarms();
        if (isMounted) setFarms(Array.isArray(fetchedFarms) ? fetchedFarms : []);
      } catch (err) {
        if (isMounted) setLoadError(err.message || 'Failed to load farms.');
      }
      try {
        const fetchedPlots = await plotService.getPlots(farmerId);
        if (isMounted && Array.isArray(fetchedPlots)) setPlots(fetchedPlots.map(mapPlotData));
      } catch { /* plots are non-critical */ }
      if (isMounted) setLoading(false);
    }
    loadData();
    return () => { isMounted = false; };
  }, [farmerId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openFarm = (farm) => {
    if (onSelectFarm) onSelectFarm(farm.id);
    else if (onNavigate) onNavigate('farm-details', farm.id);
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
      } catch {
        finalUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }
      await farmService.updateFarm(targetFarm.id, { ...targetFarm, mapImageUrl: finalUrl });
      setFarms((prev) => prev.map((f) => f.id === targetFarm.id ? { ...f, mapImageUrl: finalUrl } : f));
      showNotification(`Photo saved for "${targetFarm.name}"!`);
    } catch {
      showNotification('Photo updated for this session.');
    }
  };

  const handleAddPlot = async (plotData) => {
    try {
      const saved = await plotService.createPlot(farmerId, { ...plotData, farmId: farms[0]?.id });
      setPlots((prev) => [mapPlotData(saved), ...prev]);
      showNotification(`Plot "${plotData.name}" (${plotData.area} ha) successfully added!`);
    } catch (err) {
      showNotification(err.message || 'Failed to create plot.');
    }
  };

  const handleDeletePlot = (plot) => {
    setForceDeleteWarning('');
    setDeleteTarget(plot);
  };

  const confirmDeletePlot = async () => {
    if (!deleteTarget) return;
    setDeletingPlot(true);
    try {
      const force = Boolean(forceDeleteWarning);
      await plotService.deletePlot(farmerId, deleteTarget.id, force);
      setPlots((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showNotification(`Plot "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      setForceDeleteWarning('');
    } catch (err) {
      if (err.status === 409 && !forceDeleteWarning) {
        setForceDeleteWarning(err.message || 'This plot is linked to an active production cycle. Force-delete it anyway?');
      } else {
        showNotification(err.message || 'Failed to delete plot.');
        setDeleteTarget(null);
        setForceDeleteWarning('');
      }
    } finally {
      setDeletingPlot(false);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const term = searchTerm.toLowerCase();
  const filteredPlots = plots.filter((p) =>
    (p.title || '').toLowerCase().includes(term) ||
    (p.stage || '').toLowerCase().includes(term) ||
    (p.location || '').toLowerCase().includes(term)
  );
  const totalArea = plots.reduce((acc, p) => acc + (p.areaVal || 0), 0).toFixed(1);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px',
          backgroundColor: '#164230', color: '#FFFFFF',
          padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px',
          zIndex: 1200, fontSize: '0.875rem', fontWeight: 500
        }}>
          <IconCheck size={14} color="#FFFFFF" /><span>{toast}</span>
        </div>
      )}

      {/* Modals */}
      <NewFarmModal
        isOpen={isNewFarmModalOpen}
        onClose={() => setIsNewFarmModalOpen(false)}
        onFarmCreated={(newFarm) => {
          setFarms((prev) => [newFarm, ...prev]);
          showNotification(`Farm "${newFarm.name}" created!`);
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
        onClose={() => { setIsDetailsModalOpen(false); setSelectedPlot(null); }}
        plot={selectedPlot}
      />
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={forceDeleteWarning ? 'Force delete plot?' : 'Delete plot?'}
        message={
          forceDeleteWarning ||
          `Are you sure you want to delete "${deleteTarget?.title || 'this plot'}"? This action cannot be undone.`
        }
        confirmLabel={forceDeleteWarning ? 'Force Delete' : 'Delete Plot'}
        tone={forceDeleteWarning ? 'warning' : 'danger'}
        loading={deletingPlot}
        onConfirm={confirmDeletePlot}
        onCancel={() => {
          if (!deletingPlot) {
            setDeleteTarget(null);
            setForceDeleteWarning('');
          }
        }}
      />

      {/* ── My Farms panel ─────────────────────────────────────────────────── */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              My Farms
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              {farms.length} farm{farms.length === 1 ? '' : 's'} · {totalArea} ha in registered plots
            </p>
          </div>
          <button type="button" style={primaryBtn}
            onClick={() => onNavigate ? onNavigate('create-farm') : setIsNewFarmModalOpen(true)}>
            <IconPlus size={16} color="#FFFFFF" /> New Farm
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ border: '1px solid #ECE7DC', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="acrea-skeleton" style={{ width: '60%', height: '20px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '80%', height: '14px', borderRadius: '4px', marginTop: '8px' }} />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <p style={{ color: '#B42318', fontSize: '0.875rem' }}>{loadError}</p>
        ) : farms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 24px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '14px' }}>
              You have no farm yet. Create your first farm to start organising plots.
            </p>
            <button type="button" style={primaryBtn}
              onClick={() => onNavigate ? onNavigate('create-farm') : setIsNewFarmModalOpen(true)}>
              <IconPlus size={16} color="#FFFFFF" /> Create your first farm
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
            {farms.map((farm) => {
              const farmPlotsCount = plots.filter(
                (p) => p.farmId != null && String(p.farmId) === String(farm.id)
              ).length;
              return (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  plotCount={farmPlotsCount}
                  onClick={() => openFarm(farm)}
                  onPhotoUpload={handleCardPhotoUpload}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Plots panel ────────────────────────────────────────────────────── */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Plots</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1 1 260px', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-card-border)', borderRadius: '9999px', padding: '8px 14px', flex: '1 1 180px', maxWidth: '300px', minWidth: 0 }}>
              <IconSearch size={16} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search plots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', width: '100%', minWidth: 0 }}
              />
            </div>
            <button
              type="button"
              style={primaryBtn}
              onClick={() => {
                if (onCreatePlot) onCreatePlot(null);
                else if (onNavigate) onNavigate('create-plot');
                else setIsAddPlotModalOpen(true);
              }}
            >
              <IconPlus size={16} color="#FFFFFF" /> Add Plot
            </button>
          </div>
        </div>

        {loading ? (
          <div className="acrea-grid-2" style={{ gap: '20px' }}>
            {[1, 2].map((n) => (
              <div key={n} style={{ border: '1px solid #ECE7DC', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="acrea-skeleton" style={{ width: '50%', height: '22px', borderRadius: '4px' }} />
                  <div className="acrea-skeleton" style={{ width: '80px', height: '20px', borderRadius: '9999px' }} />
                </div>
                <div className="acrea-skeleton" style={{ width: '35%', height: '14px', borderRadius: '4px' }} />
                <div className="acrea-skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : filteredPlots.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '24px' }}>
            {plots.length === 0 ? 'No data yet.' : 'No plot matches your search.'}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
            {filteredPlots.map((plot) => {
              const resolvedFarmName =
                plot.farmName ||
                (plot.farmId != null ? farms.find((f) => String(f.id) === String(plot.farmId))?.name : null) ||
                'Unassigned';
              return (
                <PlotCard
                  key={plot.id}
                  icon={plot.icon}
                  title={plot.title}
                  farmName={resolvedFarmName}
                  area={plot.area}
                  stage={plot.stage}
                  progress={plot.progress}
                  imageUrls={plot.imageUrls}
                  onViewDetails={() => {
                    if (onSelectPlot) onSelectPlot(plot.id);
                    else { setSelectedPlot(plot); setIsDetailsModalOpen(true); }
                  }}
                  onDeletePlot={() => handleDeletePlot(plot)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
