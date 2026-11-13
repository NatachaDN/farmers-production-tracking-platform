import React, { useState, useEffect } from 'react';
import { farmService } from './services/farmService';
import { plotService } from './services/plotService';
import { AddPlotModal } from './components/AddPlotModal';
import { EditFarmModal } from './components/EditFarmModal';
import { FarmHeroBanner } from './components/FarmHeroBanner';
import { FarmMetricCards } from './components/FarmMetricCards';
import { FarmTerrainSection } from './components/FarmTerrainSection';
import { FarmPlotsSection } from './components/FarmPlotsSection';
import { PlotDetailsModal } from '../crops/components/PlotDetailsModal';
import {
  IconArrowLeft,
  IconCamera,
  IconMapPin,
  IconCheck,
  IconAlertCircle,
  IconEdit,
  IconPlus
} from '../../shared/components/Icons';

// ─── Shared button styles ────────────────────────────────────────────────────
const backBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 20px',
  borderRadius: '9999px',
  backgroundColor: '#FFFFFF',
  color: '#164230',
  border: '1.5px solid #164230',
  fontWeight: 600,
  fontSize: '0.9375rem',
  cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(22,66,48,0.08)'
};

const ghostBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 18px',
  borderRadius: '9999px',
  backgroundColor: '#FFFFFF',
  color: '#164230',
  border: '1px solid #ECE7DC',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer'
};

const primaryBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '10px 18px',
  borderRadius: '9999px',
  backgroundColor: '#164230',
  color: '#FFFFFF',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  border: 'none'
};

import { FarmDetailSkeleton, FarmDetailError } from './components/FarmDetailStatusStates';

// ─── Main component ───────────────────────────────────────────────────────────
export function FarmDetailsView({ farmId, farmerId, user, onNavigate, onBack }) {
  const [farm, setFarm] = useState(null);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isPlotDetailsOpen, setIsPlotDetailsOpen] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const goBack = onBack || (() => onNavigate && onNavigate('farms'));

  // ── Load farm + plots ──────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        let currentFarm = null;
        if (farmId) {
          try { currentFarm = await farmService.getFarmById(farmId); }
          catch { /* fall through to list fetch */ }
        }
        if (!currentFarm) {
          const all = await farmService.getFarms();
          if (Array.isArray(all) && all.length > 0) {
            currentFarm = all.find((f) => String(f.id) === String(farmId)) || all[0];
          }
        }
        if (isMounted) setFarm(currentFarm);

        const effectiveFarmerId = farmerId || user?.id || 1;
        try {
          const fetchedPlots = await plotService.getPlots(effectiveFarmerId);
          if (isMounted && Array.isArray(fetchedPlots)) {
            const farmPlots = currentFarm?.id
              ? fetchedPlots.filter((p) => p.farmId == null || String(p.farmId) === String(currentFarm.id))
              : fetchedPlots;
            setPlots(farmPlots);
          }
        } catch { /* plots are non-critical */ }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to load farm details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [farmId, farmerId, user]);

  // ── Photo upload ───────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !farm) return;

    const localUrl = URL.createObjectURL(file);
    setFarm((prev) => ({ ...prev, mapImageUrl: localUrl }));
    setUploadingPhoto(true);

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

      const updatedFarm = {
        ...farm, mapImageUrl: finalUrl,
        type: farm.type || 'CROP',
        size: farm.size || 1,
        sizeUnit: farm.sizeUnit || 'HECTARES',
        status: farm.status || 'ACTIVE',
        country: farm.country || 'Cameroon',
        region: farm.region || 'West',
        district: farm.district || 'Bafoussam'
      };
      await farmService.updateFarm(farm.id, updatedFarm);
      setFarm(updatedFarm);
      showToast('Farm photo updated successfully!');
    } catch {
      showToast('Photo saved for this session.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) return <FarmDetailSkeleton />;
  if (error || !farm) return <FarmDetailError message={error} onBack={goBack} />;

  const locationText = [farm.district, farm.region, farm.country].filter(Boolean).join(', ');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Toast notification ────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px',
          backgroundColor: '#164230', color: '#FFFFFF',
          padding: '12px 22px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: '10px',
          zIndex: 1200, fontSize: '0.9375rem', fontWeight: 600
        }}>
          <IconCheck size={16} color="#FFFFFF" />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Top navigation row ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button type="button" onClick={goBack} style={backBtnStyle}>
          <IconArrowLeft size={18} /> Back to My Farms
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button type="button" onClick={() => setIsEditModalOpen(true)} style={ghostBtnStyle}>
            <IconEdit size={16} /> Edit Farm Info
          </button>
          <label style={primaryBtnStyle}>
            <IconCamera size={16} />
            {uploadingPhoto ? 'Uploading...' : 'Change Farm Photo'}
            <input
              type="file" accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingPhoto}
              onChange={handlePhotoUpload}
            />
          </label>
        </div>
      </div>

      {/* ── Hero photo banner + farm identity ────────────────────────────── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #ECE7DC',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
      }}>
        <FarmHeroBanner
          farm={farm}
          uploadingPhoto={uploadingPhoto}
          onPhotoChange={handlePhotoUpload}
        />

        {/* Farm name, status, location, Add Plot CTA */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#164230', margin: 0, letterSpacing: '-0.02em' }}>
                  {farm.name}
                </h1>
                <span style={{
                  padding: '4px 12px', borderRadius: '9999px',
                  backgroundColor: '#EAF4ED', color: '#164230',
                  fontSize: '0.8125rem', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: '5px'
                }}>
                  <IconCheck size={12} /> {farm.status || 'ACTIVE'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', color: '#5C6F64' }}>
                <IconMapPin size={16} color="#164230" />
                <span>{locationText || 'Cameroon'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAddPlotModalOpen(true)}
              style={{
                ...primaryBtnStyle,
                padding: '12px 22px',
                fontSize: '0.9375rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(22,66,48,0.2)'
              }}
            >
              <IconPlus size={18} /> Add Plot to this Farm
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric cards ─────────────────────────────────────────────────── */}
      <FarmMetricCards farm={farm} plotCount={plots.length} />

      {/* ── Terrain & directions (optional) ──────────────────────────────── */}
      <FarmTerrainSection farm={farm} />

      {/* ── Plots grid ───────────────────────────────────────────────────── */}
      <FarmPlotsSection
        farmName={farm.name}
        plots={plots}
        onAddPlot={() => setIsAddPlotModalOpen(true)}
        onViewPlot={(plot) => { setSelectedPlot(plot); setIsPlotDetailsOpen(true); }}
      />

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <AddPlotModal
        isOpen={isAddPlotModalOpen}
        onClose={() => setIsAddPlotModalOpen(false)}
        onAddPlot={(newPlot) => {
          setPlots((prev) => [newPlot, ...prev]);
          showToast(`Plot "${newPlot.name}" added to this farm!`);
        }}
        farmerId={farmerId || user?.id || 1}
        farmId={farm.id}
      />

      <EditFarmModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        farm={farm}
        farmerId={farmerId || user?.id || 1}
        onFarmUpdated={(updated) => {
          setFarm((prev) => ({ ...prev, ...updated }));
          showToast('Farm information updated successfully.');
        }}
      />

      <PlotDetailsModal
        isOpen={isPlotDetailsOpen}
        onClose={() => { setIsPlotDetailsOpen(false); setSelectedPlot(null); }}
        plot={selectedPlot}
      />
    </div>
  );
}

export default FarmDetailsView;
