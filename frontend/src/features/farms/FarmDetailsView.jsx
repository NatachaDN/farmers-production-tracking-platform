import React, { useState, useEffect } from 'react';
import { farmService } from './services/farmService';
import { plotService } from './services/plotService';
import { PlotCard } from '../../shared/components/PlotCard';
import { AddPlotModal } from './components/AddPlotModal';
import { EditFarmModal } from './components/EditFarmModal';
import { PlotDetailsModal } from '../crops/components/PlotDetailsModal';
import {
  IconArrowLeft,
  IconCamera,
  IconFarms,
  IconCrop,
  IconLivestock,
  IconMapPin,
  IconPlus,
  IconCheck,
  IconAlertCircle,
  IconDroplets,
  IconLeaf,
  IconSprout,
  IconEdit,
  IconTomato,
  IconBean
} from '../../shared/components/Icons';

function getIconForCrop(crop) {
  const c = (crop || '').toLowerCase();
  if (c.includes('tomato')) return <IconTomato size={20} color="#2D7A52" />;
  if (c.includes('bean')) return <IconBean size={20} color="#2D7A52" />;
  if (c.includes('cassava') || c.includes('plantain')) return <IconLeaf size={20} color="#2D7A52" />;
  return <IconSprout size={20} color="#2D7A52" />;
}

function progressForStage(stage) {
  if (stage === 'Flowering') return 74;
  if (stage === 'Vegetative growth') return 62;
  if (stage === 'Maturing') return 84;
  return 29;
}

export function FarmDetailsView({ farmId, farmerId, user, onNavigate, onBack }) {
  const [farm, setFarm] = useState(null);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modals & upload
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddPlotModalOpen, setIsAddPlotModalOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isPlotDetailsOpen, setIsPlotDetailsOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadFarmAndPlots() {
      setLoading(true);
      setError(null);
      try {
        let currentFarm = null;
        if (farmId) {
          try {
            currentFarm = await farmService.getFarmById(farmId);
          } catch (e) {
            console.warn('Could not fetch single farm by id, fetching all farms:', e);
          }
        }

        // If not found by single id, fetch all farms and pick the match or first one
        if (!currentFarm) {
          const allFarms = await farmService.getFarms();
          if (Array.isArray(allFarms) && allFarms.length > 0) {
            currentFarm = allFarms.find((f) => String(f.id) === String(farmId)) || allFarms[0];
          }
        }

        if (isMounted) {
          setFarm(currentFarm);
        }

        // Fetch farmer plots
        const effectiveFarmerId = farmerId || user?.id || 1;
        try {
          const fetchedPlots = await plotService.getPlots(effectiveFarmerId);
          if (isMounted && Array.isArray(fetchedPlots)) {
            // Filter plots for this farm if farmId is linked, otherwise show plots belonging to this farmer
            const matchingPlots = currentFarm?.id
              ? fetchedPlots.filter((p) => p.farmId == null || String(p.farmId) === String(currentFarm.id))
              : fetchedPlots;
            setPlots(matchingPlots);
          }
        } catch (plotErr) {
          console.warn('Failed to load plots for this farm:', plotErr);
        }
      } catch (err) {
        console.error('Failed to load farm details:', err);
        if (isMounted) setError(err.message || 'Unable to load farm details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFarmAndPlots();
    return () => { isMounted = false; };
  }, [farmId, farmerId, user]);

  // Handle farm photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !farm) return;

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setFarm((prev) => ({ ...prev, mapImageUrl: localUrl }));
    setUploadingPhoto(true);

    try {
      let finalUrl = localUrl;
      try {
        const res = await farmService.uploadFarmPhoto(file);
        if (res?.url) finalUrl = res.url;
      } catch (uploadErr) {
        console.warn('Backend image upload failed, falling back to local data URL:', uploadErr);
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        finalUrl = dataUrl;
      }

      // Persist the new image url to the farm record
      const updatedFarm = {
        ...farm,
        mapImageUrl: finalUrl,
        name: farm.name,
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
    } catch (err) {
      console.error('Failed to save farm photo:', err);
      showToast('Photo uploaded for this session.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePlotCreated = (newPlot) => {
    setPlots((prev) => [newPlot, ...prev]);
    showToast(`Plot "${newPlot.name}" added to this farm!`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
        <div className="acrea-skeleton" style={{ width: '180px', height: '40px', borderRadius: '9999px' }} />
        <div className="acrea-skeleton" style={{ width: '100%', height: '240px', borderRadius: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="acrea-skeleton" style={{ height: '110px', borderRadius: '16px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl, 20px)',
        border: '1px solid var(--color-card-border, #ECE7DC)',
        padding: '48px 24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <IconAlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#164230', marginBottom: '8px' }}>
          {error || 'Farm Not Found'}
        </h2>
        <p style={{ color: 'var(--color-text-muted, #5C6F64)', fontSize: '0.9375rem', marginBottom: '24px' }}>
          We could not load the details for this farm. It may have been removed or not yet registered.
        </p>
        <button
          type="button"
          onClick={onBack || (() => onNavigate && onNavigate('farms'))}
          style={{
            backgroundColor: '#164230',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IconArrowLeft size={16} /> Return to My Farms
        </button>
      </div>
    );
  }

  // Type labels and icon
  const isLivestock = farm.type === 'LIVESTOCK';
  const isMixed = farm.type === 'MIXED';
  const typeLabel = isLivestock ? 'Livestock & Animals' : isMixed ? 'Mixed Agriculture' : 'Crops & Fields';
  const TypeIcon = isLivestock ? IconLivestock : isMixed ? IconFarms : IconCrop;

  const locationText = [farm.district, farm.region, farm.country].filter(Boolean).join(', ');
  const sizeText = `${farm.size} ${farm.sizeUnit === 'ACRES' ? 'acres' : 'hectares'}`;
  const acresEquivalent = farm.sizeUnit === 'ACRES'
    ? (farm.size / 2.471).toFixed(1) + ' ha'
    : (farm.size * 2.471).toFixed(1) + ' acres';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            backgroundColor: '#164230',
            color: '#FFFFFF',
            padding: '12px 22px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1200,
            fontSize: '0.9375rem',
            fontWeight: 600
          }}
        >
          <IconCheck size={16} color="#FFFFFF" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          type="button"
          onClick={onBack || (() => onNavigate && onNavigate('farms'))}
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
            boxShadow: '0 2px 6px rgba(22, 66, 48, 0.08)'
          }}
        >
          <IconArrowLeft size={18} />
          Back to My Farms
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-text-primary, #164230)',
              border: '1px solid var(--color-card-border, #ECE7DC)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <IconEdit size={16} /> Edit Farm Info
          </button>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              backgroundColor: '#164230',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <IconCamera size={16} />
            {uploadingPhoto ? 'Uploading...' : 'Change Farm Photo'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingPhoto}
              onChange={handlePhotoUpload}
            />
          </label>
        </div>
      </div>

      {/* Hero Farm Photo & Identity Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl, 20px)',
        border: '1px solid var(--color-card-border, #ECE7DC)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))'
      }}>
        {farm.mapImageUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '280px', backgroundColor: '#EAF4ED' }}>
            <img
              src={farm.mapImageUrl}
              alt={farm.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100px',
              background: 'linear-gradient(to top, rgba(19, 32, 28, 0.75), transparent)'
            }} />
            <label
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#164230',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <IconCamera size={15} />
              {uploadingPhoto ? 'Updating...' : 'Update Photo'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                disabled={uploadingPhoto}
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        ) : (
          <div style={{
            padding: '36px 24px',
            backgroundColor: '#FAF9F6',
            borderBottom: '1px solid #ECE7DC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EAF4ED',
              color: '#164230',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <IconCamera size={32} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#164230', marginBottom: '6px' }}>
              Add a Photo of Your Farm
            </h3>
            <p style={{ color: 'var(--color-text-muted, #5C6F64)', fontSize: '0.875rem', maxWidth: '420px', marginBottom: '16px' }}>
              Take a photo with your phone or select a picture from your device. It makes your farm easy to recognize on your dashboard.
            </p>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '9999px',
                backgroundColor: '#164230',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22, 66, 48, 0.2)'
              }}
            >
              <IconCamera size={18} />
              {uploadingPhoto ? 'Uploading photo...' : 'Choose or Take Photo'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                disabled={uploadingPhoto}
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        )}

        {/* Farm Name & Main Badges */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--color-text-primary, #164230)',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  {farm.name}
                </h1>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: '#EAF4ED',
                  color: '#164230',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <IconCheck size={12} /> {farm.status || 'ACTIVE'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', color: 'var(--color-text-muted, #5C6F64)' }}>
                <IconMapPin size={16} color="#164230" />
                <span>{locationText || 'Cameroon'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsAddPlotModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '9999px',
                  backgroundColor: '#164230',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 66, 48, 0.2)'
                }}
              >
                <IconPlus size={18} />
                Add Plot to this Farm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Farm Metric Cards - Designed for Older Farmers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        {/* Total Size */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 20px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #5C6F64)', fontWeight: 500 }}>
            Total Farm Size
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#164230' }}>
            {sizeText}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #5C6F64)' }}>
            Approximately {acresEquivalent}
          </div>
        </div>

        {/* Primary Activity */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 20px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #5C6F64)', fontWeight: 500 }}>
            Primary Activity
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#EAF4ED',
              color: '#164230',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TypeIcon size={18} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#164230' }}>
              {typeLabel}
            </div>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #5C6F64)' }}>
            Main production focus
          </div>
        </div>

        {/* Registered Plots */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl, 20px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #5C6F64)', fontWeight: 500 }}>
            Plots in this Farm
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#164230' }}>
            {plots.length} {plots.length === 1 ? 'Plot' : 'Plots'}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #5C6F64)' }}>
            {plots.length > 0 ? 'Individual parcels cultivated' : 'No parcels defined yet'}
          </div>
        </div>
      </div>

      {/* Terrain & Directions Box (If Provided) */}
      {(farm.accessToWater || farm.soilType || farm.slope || farm.additionalNotes || farm.description) && (
        <div style={{
          backgroundColor: '#FAF9F6',
          borderRadius: 'var(--radius-xl, 20px)',
          border: '1px solid var(--color-card-border, #ECE7DC)',
          padding: '24px 28px'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#164230', marginBottom: '16px' }}>
            Terrain, Water & Directions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {farm.accessToWater && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Water Source
                </span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#164230', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconDroplets size={16} color="#0284C7" />
                  {farm.accessToWater === 'YES' ? 'Stream / River / Borehole available' : 'Rain-fed seasonal agriculture'}
                </p>
              </div>
            )}
            {farm.soilType && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Soil Type
                </span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#164230', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconLeaf size={16} color="#2D7A52" />
                  {farm.soilType} Soil
                </p>
              </div>
            )}
            {farm.slope && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Topography / Slope
                </span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#164230' }}>
                  {farm.slope === 'FLAT' ? 'Flat Level Land' : farm.slope === 'MODERATE' ? 'Gentle Incline' : 'Steep Hillside'}
                </p>
              </div>
            )}
          </div>

          {(farm.additionalNotes || farm.description) && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #ECE7DC' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Farmer Notes & Landmarks
              </span>
              <p style={{ margin: '6px 0 0', fontSize: '0.9375rem', color: 'var(--color-text-primary, #164230)', lineHeight: 1.5 }}>
                {farm.additionalNotes || farm.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plots on this Farm */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-xl, 20px)',
        border: '1px solid var(--color-card-border, #ECE7DC)',
        padding: '28px',
        boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0,0,0,0.05))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#164230', margin: 0 }}>
              Plots & Cultivated Parcels
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #5C6F64)', margin: '4px 0 0' }}>
              Fields inside {farm.name} dedicated to specific crops or grazing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddPlotModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: '#164230',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <IconPlus size={16} /> Add Plot
          </button>
        </div>

        {plots.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#FAF9F6',
            borderRadius: '16px',
            border: '1px dashed #ECE7DC'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#EAF4ED',
              color: '#164230',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <IconSprout size={26} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#164230', marginBottom: '6px' }}>
              No plots created on this farm yet
            </h3>
            <p style={{ color: 'var(--color-text-muted, #5C6F64)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 18px' }}>
              Dividing your farm into plots allows you to track individual crops (like plantains, maize, or tomatoes), harvest yields, and treatments.
            </p>
            <button
              type="button"
              onClick={() => setIsAddPlotModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '9999px',
                backgroundColor: '#164230',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9375rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22, 66, 48, 0.2)'
              }}
            >
              <IconPlus size={18} />
              Add First Plot to this Farm
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {plots.map((plot) => {
              const mapped = {
                id: plot.id,
                title: plot.name,
                crop: plot.cropType || 'Crop',
                areaVal: plot.area,
                area: `${plot.area} ha cultivated area`,
                stage: plot.stage || 'Planting',
                location: plot.location,
                progress: progressForStage(plot.stage),
                icon: getIconForCrop(plot.cropType || plot.name)
              };
              return (
                <PlotCard
                  key={plot.id}
                  icon={mapped.icon}
                  title={mapped.title}
                  area={mapped.area}
                  stage={mapped.stage}
                  progress={mapped.progress}
                  onViewDetails={() => {
                    setSelectedPlot(plot);
                    setIsPlotDetailsOpen(true);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddPlotModal
        isOpen={isAddPlotModalOpen}
        onClose={() => setIsAddPlotModalOpen(false)}
        onAddPlot={handlePlotCreated}
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
        onClose={() => {
          setIsPlotDetailsOpen(false);
          setSelectedPlot(null);
        }}
        plot={selectedPlot}
      />
    </div>
  );
}

export default FarmDetailsView;

