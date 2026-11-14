import React, { useEffect, useState } from 'react';
import { plotService } from './services/plotService';
import { farmService } from './services/farmService';
import { cropCycleService } from '../crops/services/cropCycleService';
import { EditPlotModal } from './components/EditPlotModal';
import { getCropIcon, stageProgress } from './utils/farmPlotUtils';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { ConfirmModal } from '../../shared/components/ConfirmModal';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCamera,
  IconCheck,
  IconClose,
  IconCrop,
  IconFarms,
  IconMapPin,
  IconPencil,
  IconPlus,
  IconTrash
} from '../../shared/components/Icons';

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid var(--color-card-border, #ECE7DC)',
  borderRadius: 'var(--radius-xl, 20px)',
  padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3.5vw, 28px)',
  boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export function PlotDetailsView({ plotId, farmerId, onNavigate, onSelectFarm, onBack }) {
  const [plot, setPlot] = useState(null);
  const [farms, setFarms] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [forceDeleteWarning, setForceDeleteWarning] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!plotId) {
        setError('No plot selected.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [fetchedPlot, fetchedFarms, fetchedCycles] = await Promise.all([
          plotService.getPlotById(farmerId, plotId),
          farmService.getFarms().catch(() => []),
          cropCycleService.getCycles(farmerId).catch(() => []),
        ]);
        if (!mounted) return;
        setPlot(fetchedPlot);
        setFarms(Array.isArray(fetchedFarms) ? fetchedFarms : []);
        const cycleList = Array.isArray(fetchedCycles) ? fetchedCycles : [];
        setCycles(cycleList.filter((c) => String(c.plotId || c.plot?.id) === String(plotId)));
      } catch (err) {
        if (mounted) setError(err.message || 'Unable to load plot details.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [plotId, farmerId]);

  const goBack = () => {
    if (onBack) {
      onBack(plot?.farmId);
      return;
    }
    if (plot?.farmId && onSelectFarm) {
      onSelectFarm(plot.farmId);
    } else if (onNavigate) {
      onNavigate('farms');
    }
  };

  const handleUpdatePlot = async (updatedPayload) => {
    const saved = await plotService.updatePlot(farmerId, plot.id, {
      name: updatedPayload.name,
      area: updatedPayload.area,
      location: updatedPayload.location,
      cropType: updatedPayload.cropType,
      stage: updatedPayload.stage,
      farmId: updatedPayload.farmId,
      soilType: updatedPayload.soilType ?? plot.soilType,
      irrigationType: updatedPayload.irrigationType ?? plot.irrigationType,
      slope: updatedPayload.slope ?? plot.slope,
      notes: updatedPayload.notes ?? plot.notes,
      imageUrls: updatedPayload.imageUrls ?? plot.imageUrls ?? [],
    });
    setPlot(saved);
    showToast(`Plot "${saved.name}" updated.`);
  };

  const handleAddPlotPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !plot) return;

    setIsUploadingPhoto(true);
    setError('');
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await plotService.uploadPlotPhoto(file);
        if (res?.url) {
          uploadedUrls.push(res.url);
        }
      }
      if (uploadedUrls.length > 0) {
        const nextUrls = [...(plot.imageUrls || []), ...uploadedUrls];
        const saved = await plotService.updatePlot(farmerId, plot.id, {
          name: plot.name,
          area: plot.area,
          location: plot.location,
          cropType: plot.cropType,
          stage: plot.stage,
          farmId: plot.farmId,
          soilType: plot.soilType,
          irrigationType: plot.irrigationType,
          slope: plot.slope,
          notes: plot.notes,
          imageUrls: nextUrls,
        });
        setPlot(saved);
        showToast(`${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} added to plot.`);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload plot photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePlotPhoto = async (indexToRemove) => {
    if (!plot) return;
    const nextUrls = (plot.imageUrls || []).filter((_, idx) => idx !== indexToRemove);
    try {
      const saved = await plotService.updatePlot(farmerId, plot.id, {
        name: plot.name,
        area: plot.area,
        location: plot.location,
        cropType: plot.cropType,
        stage: plot.stage,
        farmId: plot.farmId,
        soilType: plot.soilType,
        irrigationType: plot.irrigationType,
        slope: plot.slope,
        notes: plot.notes,
        imageUrls: nextUrls,
      });
      setPlot(saved);
      showToast('Photo removed from plot.');
    } catch (err) {
      setError(err.message || 'Failed to remove plot photo.');
    }
  };

  const handleDeletePlot = () => {
    if (!plot) return;
    setForceDeleteWarning('');
    setIsDeleteOpen(true);
  };

  const confirmDeletePlot = async () => {
    if (!plot) return;
    setDeleting(true);
    try {
      await plotService.deletePlot(farmerId, plot.id, Boolean(forceDeleteWarning));
      setIsDeleteOpen(false);
      goBack();
    } catch (err) {
      if (err.status === 409 && !forceDeleteWarning) {
        setForceDeleteWarning(err.message || 'This plot is linked to an active production cycle. Force-delete it anyway?');
      } else {
        setError(err.message || 'Failed to delete plot.');
        setIsDeleteOpen(false);
        setForceDeleteWarning('');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={cardStyle}>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Loading plot details…</p>
        </div>
      </div>
    );
  }

  if (error || !plot) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('farms')}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            color: '#164230',
            border: '1.5px solid #164230',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <IconArrowLeft size={16} /> Back to Farms &amp; Plots
        </button>
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '12px', color: '#B91C1C' }}>
          <IconAlertCircle size={20} />
          <span>{error || 'Plot not found.'}</span>
        </div>
      </div>
    );
  }

  const progress = stageProgress(plot.stage);
  const assignedFarm = farms.find((f) => String(f.id) === String(plot.farmId));
  const resolvedFarmName = plot.farmName || assignedFarm?.name;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#164230',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1200,
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <IconCheck size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={goBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '9999px',
            backgroundColor: '#FFFFFF',
            color: '#164230',
            border: '1.5px solid #164230',
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
          }}
        >
          <IconArrowLeft size={17} />
          <span>{resolvedFarmName ? `Back to ${resolvedFarmName}` : 'Back to Farms & Plots'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              backgroundColor: '#164230',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <IconPencil size={15} /> Edit Plot
          </button>
          <button
            type="button"
            onClick={handleDeletePlot}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              backgroundColor: '#FEF2F2',
              color: '#B91C1C',
              border: '1px solid #FECACA',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <IconTrash size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Hero Summary Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: '#EAF4ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {getCropIcon(plot.cropType || plot.name)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#164230', margin: 0, letterSpacing: '-0.02em' }}>
                  {plot.name}
                </h1>
                <StatusBadge status={plot.stage || 'Planned'} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.875rem', color: '#4B5752' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <IconMapPin size={15} color="#3E7B52" />
                  {plot.location || 'No location specified'}
                </span>

                {plot.farmId && resolvedFarmName ? (
                  <button
                    type="button"
                    onClick={() => onSelectFarm && onSelectFarm(plot.farmId)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: '#EAF4ED',
                      color: '#164230',
                      border: '1px solid #C8E2D0',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <IconFarms size={14} />
                    <span>Farm: {resolvedFarmName}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <IconFarms size={14} />
                    <span>Unassigned — Assign to a farm</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cultivated Area
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#19201C' }}>
              {plot.area} ha
            </div>
          </div>
        </div>

        {/* Cycle progress bar */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F4EFE6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: '#4B5752' }}>Growth stage progress ({plot.stage || 'Planned'})</span>
            <span style={{ fontWeight: 700, color: '#164230' }}>{progress}%</span>
          </div>
          <div style={{ height: '8px', width: '100%', backgroundColor: '#ECE7DC', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#3E7B52', borderRadius: '9999px', transition: 'width 400ms ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '14px', fontSize: '0.8125rem', color: '#788680' }}>
            <span>Created: <strong style={{ color: '#4B5752' }}>{formatDate(plot.createdAt)}</strong></span>
            <span>Last updated: <strong style={{ color: '#4B5752' }}>{formatDate(plot.updatedAt)}</strong></span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase' }}>Primary Crop</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', marginTop: '6px' }}>{plot.cropType || 'Unspecified'}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase' }}>Assigned Farm</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', marginTop: '6px' }}>{resolvedFarmName || 'Unassigned'}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase' }}>Active / Total Cycles</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', marginTop: '6px' }}>{cycles.length}</div>
        </div>
      </div>

      {/* Supplementary Details */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
              Supplementary Details
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '2px 0 0' }}>
              Soil characteristics, irrigation, terrain, and field observations
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '9999px',
              backgroundColor: '#F9F6F0',
              color: '#164230',
              border: '1px solid #ECE7DC',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <IconPencil size={13} />
            <span>Edit Details</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase' }}>Soil Type</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#19201C', marginTop: '4px' }}>
              {plot.soilType || 'Not specified'}
            </div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase' }}>Irrigation Method</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#19201C', marginTop: '4px' }}>
              {plot.irrigationType || 'Not specified'}
            </div>
          </div>
          <div style={{ padding: '12px 14px', borderRadius: '12px', backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase' }}>Terrain / Slope</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#19201C', marginTop: '4px' }}>
              {plot.slope || 'Not specified'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#F9F6F0', border: '1px solid #ECE7DC' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#788680', textTransform: 'uppercase', marginBottom: '6px' }}>
            Field Notes
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: plot.notes ? '#19201C' : '#788680', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {plot.notes || 'No field notes recorded yet.'}
          </p>
        </div>
      </div>

      {/* Plot Photos */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
              Plot Photos
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '2px 0 0' }}>
              Visual field records of {plot.name}
            </p>
          </div>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: '#EAF4ED',
              color: '#164230',
              border: '1px solid #C8E2D0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: isUploadingPhoto ? 'wait' : 'pointer',
            }}
          >
            <IconPlus size={14} />
            <span>{isUploadingPhoto ? 'Uploading...' : 'Add Photo'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploadingPhoto}
              onChange={handleAddPlotPhotos}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {plot.imageUrls && plot.imageUrls.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 170px), 1fr))', gap: '12px' }}>
            {plot.imageUrls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                style={{
                  position: 'relative',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid #ECE7DC',
                  backgroundColor: '#F9F6F0',
                  aspectRatio: '4 / 3',
                }}
              >
                <img
                  src={url}
                  alt={`${plot.name} field photo ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemovePlotPhoto(idx)}
                  title="Remove photo"
                  aria-label="Remove photo"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(25, 32, 28, 0.72)',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <IconClose size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px 16px', textAlign: 'center', borderRadius: '14px', border: '1px dashed #D6CFC0', backgroundColor: '#F9F6F0' }}>
            <IconCamera size={24} color="#788680" />
            <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#788680' }}>
              No photos added yet. Upload field photos to document this plot.
            </p>
          </div>
        )}
      </div>

      {/* Linked Production Cycles */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#19201C', margin: 0 }}>
              Production Cycles on this Plot
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#788680', margin: '2px 0 0' }}>
              Crop cycles registered on {plot.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('crops')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              backgroundColor: '#EAF4ED',
              color: '#164230',
              border: '1px solid #C8E2D0',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Open Crop Production →
          </button>
        </div>

        {cycles.length === 0 ? (
          <div style={{ padding: '24px', borderRadius: '12px', backgroundColor: '#F9F6F0', border: '1px dashed #DFD8CA', textAlign: 'center', color: '#788680', fontSize: '0.875rem' }}>
            <IconCrop size={22} color="#3E7B52" />
            <p style={{ margin: '8px 0 0' }}>No production cycles linked to this plot yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {cycles.map((c) => (
              <div key={c.id} style={{ padding: '16px', borderRadius: '14px', border: '1px solid #ECE7DC', backgroundColor: '#FAF9F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <strong style={{ color: '#19201C', fontSize: '0.9375rem' }}>{c.cropName || c.name}</strong>
                  <StatusBadge status={c.status || 'ACTIVE'} size="sm" />
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#4B5752' }}>
                  Planted: {formatDate(c.startDate)} · Progress: {c.progress ?? 0}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditPlotModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        plot={plot}
        farms={farms}
        onPlotUpdated={handleUpdatePlot}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        title={forceDeleteWarning ? 'Force delete plot?' : 'Delete plot?'}
        message={
          forceDeleteWarning ||
          `Are you sure you want to delete "${plot.name}"? This action cannot be undone.`
        }
        confirmLabel={forceDeleteWarning ? 'Force Delete' : 'Delete Plot'}
        tone={forceDeleteWarning ? 'warning' : 'danger'}
        loading={deleting}
        onConfirm={confirmDeletePlot}
        onCancel={() => {
          if (!deleting) {
            setIsDeleteOpen(false);
            setForceDeleteWarning('');
          }
        }}
      />
    </div>
  );
}

export default PlotDetailsView;

